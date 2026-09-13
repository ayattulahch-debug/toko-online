<?php

declare(strict_types=1);

const TOKEN_LIFETIME_DAYS = 14;
const MAX_IMAGES_PER_PRODUCT = 5;
const MAX_VARIANTS_PER_PRODUCT = 20;
// Sengaja tanpa garis miring di depan supaya URL gambar tetap benar baik saat
// aplikasi disajikan dari akar domain maupun dari subfolder.
const UPLOAD_URL_PREFIX = 'uploads/produk/';

function config(): array
{
    static $config = null;

    if ($config === null) {
        $path = __DIR__ . '/config.php';
        if (!is_file($path)) {
            json_error('Server belum dikonfigurasi: file api/config.php tidak ditemukan.', 500);
        }

        $loaded = require $path;
        if (!is_array($loaded)) {
            json_error('Isi api/config.php tidak valid.', 500);
        }

        $config = $loaded;
    }

    return $config;
}

function db_connect(): PDO
{
    $c = config();

    return new PDO(
        sprintf(
            'mysql:host=%s;dbname=%s;charset=%s',
            (string) $c['db_host'],
            (string) $c['db_name'],
            (string) ($c['db_charset'] ?? 'utf8mb4')
        ),
        (string) $c['db_user'],
        (string) $c['db_pass'],
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]
    );
}

function db(): PDO
{
    static $pdo = null;

    if ($pdo === null) {
        try {
            $pdo = db_connect();
        } catch (PDOException $e) {
            json_error('Tidak dapat terhubung ke database. Periksa isi api/config.php.', 500);
        }

        ensure_schema($pdo);
    }

    return $pdo;
}

// Tabel yang ditambahkan setelah instalasi awal. Dibuat otomatis saat pertama
// diakses, karena cPanel tidak mengembalikan berkas yang sudah dihapus dari
// server sehingga install.php tidak bisa diandalkan untuk menambah tabel.
const REQUIRED_TABLES = [
    'product_variants' => <<<'SQL'
        CREATE TABLE IF NOT EXISTS product_variants (
            id INT AUTO_INCREMENT PRIMARY KEY,
            product_id INT NOT NULL,
            label VARCHAR(150) NOT NULL,
            price INT NOT NULL DEFAULT 0,
            sort_order INT NOT NULL DEFAULT 0,
            CONSTRAINT fk_variants_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        SQL,
    'product_categories' => <<<'SQL'
        CREATE TABLE IF NOT EXISTS product_categories (
            product_id INT NOT NULL,
            category_id INT NOT NULL,
            PRIMARY KEY (product_id, category_id),
            CONSTRAINT fk_pc_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
            CONSTRAINT fk_pc_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        SQL,
];

function ensure_schema(PDO $pdo): void
{
    static $checked = false;

    if ($checked) {
        return;
    }
    $checked = true;

    $names = array_keys(REQUIRED_TABLES);
    $placeholders = implode(',', array_fill(0, count($names), '?'));

    try {
        $stmt = $pdo->prepare(
            'SELECT table_name FROM information_schema.tables
             WHERE table_schema = DATABASE() AND table_name IN (' . $placeholders . ')'
        );
        $stmt->execute($names);
        $found = $stmt->fetchAll(PDO::FETCH_COLUMN);
    } catch (PDOException $e) {
        return;
    }

    foreach (array_diff($names, $found) as $missing) {
        try {
            $pdo->exec(REQUIRED_TABLES[$missing]);
        } catch (PDOException $e) {
            // Diamkan dulu; kalau hak akses kurang, errornya akan muncul jelas
            // saat tabel itu benar-benar dipakai.
        }
    }
}

function json_out(mixed $data, int $status = 200): void
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');

    // Sebagian hosting memakai serialize_precision=17 sehingga rating 4.9
    // dikirim sebagai 4.9000000000000004. -1 memaksa bentuk terpendek.
    ini_set('serialize_precision', '-1');

    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function json_error(string $message, int $status = 400): void
{
    json_out(['error' => $message], $status);
}

function read_json_body(): array
{
    $raw = file_get_contents('php://input');
    if ($raw === false || $raw === '') {
        return [];
    }

    $data = json_decode($raw, true);
    if (!is_array($data)) {
        json_error('Format data yang dikirim tidak valid.');
    }

    return $data;
}

function send_cors(): void
{
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');

    if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
        http_response_code(204);
        exit;
    }
}

function require_method(string $method): void
{
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== $method) {
        json_error('Metode request tidak diizinkan.', 405);
    }
}

function bearer_token(): ?string
{
    $header = $_SERVER['HTTP_AUTHORIZATION'] ?? '';

    if ($header === '' && function_exists('apache_request_headers')) {
        foreach (apache_request_headers() as $name => $value) {
            if (strcasecmp((string) $name, 'Authorization') === 0) {
                $header = (string) $value;
                break;
            }
        }
    }

    if (preg_match('/^Bearer\s+([a-f0-9]{64})$/i', trim($header), $matches) === 1) {
        return strtolower($matches[1]);
    }

    return null;
}

function current_user(): ?array
{
    $token = bearer_token();
    if ($token === null) {
        return null;
    }

    $stmt = db()->prepare(
        'SELECT u.id, u.username
         FROM admin_tokens t
         INNER JOIN admin_users u ON u.id = t.user_id
         WHERE t.token = ? AND t.expires_at > NOW()'
    );
    $stmt->execute([$token]);
    $user = $stmt->fetch();

    return $user === false ? null : $user;
}

function require_auth(): array
{
    $user = current_user();
    if ($user === null) {
        json_error('Sesi tidak valid atau sudah berakhir. Silakan login ulang.', 401);
    }

    return $user;
}

function uploads_dir(): string
{
    return dirname(__DIR__) . '/uploads/produk';
}

function delete_upload_file(string $url): void
{
    if (!str_starts_with($url, UPLOAD_URL_PREFIX)) {
        return;
    }

    $file = uploads_dir() . '/' . basename($url);
    if (is_file($file)) {
        @unlink($file);
    }
}

function is_valid_image_url(string $url): bool
{
    if (str_starts_with($url, UPLOAD_URL_PREFIX)) {
        return is_file(uploads_dir() . '/' . basename($url));
    }

    if (filter_var($url, FILTER_VALIDATE_URL) === false) {
        return false;
    }

    return in_array(strtolower((string) parse_url($url, PHP_URL_SCHEME)), ['http', 'https'], true);
}

function normalize_images(mixed $images): array
{
    if (!is_array($images) || $images === []) {
        json_error('Minimal 1 foto produk wajib diisi.');
    }

    if (count($images) > MAX_IMAGES_PER_PRODUCT) {
        json_error('Maksimal ' . MAX_IMAGES_PER_PRODUCT . ' foto per produk.');
    }

    $result = [];

    foreach ($images as $image) {
        if (!is_array($image)) {
            json_error('Format data foto tidak valid.');
        }

        $url = trim((string) ($image['url'] ?? ''));
        $thumbUrl = trim((string) ($image['thumbUrl'] ?? ''));

        if ($thumbUrl === '') {
            $thumbUrl = $url;
        }

        if (!is_valid_image_url($url) || !is_valid_image_url($thumbUrl)) {
            json_error('Ada foto yang tidak valid. Silakan upload ulang foto tersebut.');
        }

        $result[] = ['url' => $url, 'thumbUrl' => $thumbUrl];
    }

    return $result;
}

function normalize_category_ids(mixed $ids): array
{
    if ($ids === null) {
        return [];
    }

    if (!is_array($ids)) {
        json_error('Format data kategori produk tidak valid.');
    }

    $clean = [];
    foreach ($ids as $id) {
        $value = (int) $id;
        if ($value > 0) {
            $clean[$value] = true;
        }
    }

    return array_keys($clean);
}

function normalize_variants(mixed $variants): array
{
    if ($variants === null) {
        return [];
    }

    if (!is_array($variants)) {
        json_error('Format data varian tidak valid.');
    }

    if (count($variants) > MAX_VARIANTS_PER_PRODUCT) {
        json_error('Maksimal ' . MAX_VARIANTS_PER_PRODUCT . ' varian per produk.');
    }

    $result = [];

    foreach ($variants as $variant) {
        if (!is_array($variant)) {
            json_error('Format data varian tidak valid.');
        }

        $label = trim((string) ($variant['label'] ?? ''));
        $price = (int) ($variant['price'] ?? 0);

        if ($label === '') {
            json_error('Nama varian tidak boleh kosong.');
        }
        if (mb_strlen($label) > 150) {
            json_error('Nama varian terlalu panjang (maksimal 150 karakter).');
        }
        if ($price < 0) {
            json_error('Harga varian tidak boleh negatif.');
        }

        $result[] = ['label' => $label, 'price' => $price];
    }

    return $result;
}

function normalize_whatsapp(string $number): string
{
    $digits = preg_replace('/\D+/', '', $number);

    if ($digits === null || $digits === '') {
        return '';
    }

    if (str_starts_with($digits, '0')) {
        $digits = '62' . substr($digits, 1);
    } elseif (str_starts_with($digits, '8')) {
        $digits = '62' . $digits;
    }

    return $digits;
}
