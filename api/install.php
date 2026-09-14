<?php

declare(strict_types=1);

// Halaman instalasi sekali pakai.
// Buka https://domainmu/api/install.php setelah api/config.php dibuat,
// lalu HAPUS file ini setelah instalasi selesai.

$configPath = __DIR__ . '/config.php';

function page(string $title, string $body, int $status = 200): void
{
    http_response_code($status);
    header('Content-Type: text/html; charset=utf-8');
    echo '<!doctype html><html lang="id"><head><meta charset="utf-8">'
        . '<meta name="viewport" content="width=device-width, initial-scale=1">'
        . '<title>' . htmlspecialchars($title) . '</title>'
        . '<style>body{font-family:system-ui,-apple-system,"Segoe UI",sans-serif;background:#f3f4f6;'
        . 'margin:0;padding:32px 16px;color:#1f2937}.card{max-width:520px;margin:0 auto;background:#fff;'
        . 'border-radius:12px;padding:24px;box-shadow:0 10px 30px rgba(0,0,0,.08)}'
        . 'h1{font-size:20px;margin:0 0 16px}h2{font-size:15px;margin:24px 0 8px}'
        . 'label{display:block;font-size:13px;font-weight:600;margin-top:12px}'
        . 'input{width:100%;box-sizing:border-box;padding:10px;margin-top:4px;border:1px solid #d1d5db;'
        . 'border-radius:8px;font-size:14px}button{margin-top:20px;width:100%;padding:12px;border:0;'
        . 'border-radius:8px;background:#ee4d2d;color:#fff;font-weight:700;font-size:14px;cursor:pointer}'
        . 'ul{padding-left:20px;font-size:14px;line-height:1.7}.err{background:#fef2f2;border:1px solid #fecaca;'
        . 'color:#991b1b;padding:12px;border-radius:8px;font-size:14px}'
        . '.ok{background:#f0fdf4;border:1px solid #bbf7d0;color:#166534;padding:12px;border-radius:8px;font-size:14px}'
        . 'code{background:#f3f4f6;padding:2px 6px;border-radius:4px;font-size:13px}</style></head><body>'
        . '<div class="card">' . $body . '</div></body></html>';
    exit;
}

if (!is_file($configPath)) {
    page(
        'Konfigurasi belum ada',
        '<h1>Konfigurasi belum ada</h1><div class="err">File <code>api/config.php</code> tidak ditemukan. '
        . 'Salin <code>api/config.sample.php</code> menjadi <code>api/config.php</code> dan isi kredensial '
        . 'database dari cPanel, lalu muat ulang halaman ini.</div>',
        500
    );
}

$config = require $configPath;

if (!is_array($config)) {
    page('Konfigurasi tidak valid', '<h1>Konfigurasi tidak valid</h1><div class="err">Isi <code>api/config.php</code> harus berupa <code>return [...]</code>.</div>', 500);
}

$setupKey = (string) ($config['setup_key'] ?? '');
if ($setupKey === '' || $setupKey === 'ganti-dengan-teks-acak-pilihanmu') {
    page(
        'setup_key belum disetel',
        '<h1>setup_key belum disetel</h1><div class="err">Buka <code>api/config.php</code> dan ganti nilai '
        . '<code>setup_key</code> dengan teks rahasia pilihanmu, lalu muat ulang halaman ini.</div>',
        500
    );
}

try {
    $pdo = new PDO(
        sprintf('mysql:host=%s;dbname=%s;charset=utf8mb4', (string) $config['db_host'], (string) $config['db_name']),
        (string) $config['db_user'],
        (string) $config['db_pass'],
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC]
    );
} catch (PDOException $e) {
    page(
        'Koneksi database gagal',
        '<h1>Koneksi database gagal</h1><div class="err">Periksa <code>db_host</code>, <code>db_name</code>, '
        . '<code>db_user</code>, dan <code>db_pass</code> di <code>api/config.php</code>.<br><br>'
        . htmlspecialchars($e->getMessage()) . '</div>',
        500
    );
}

$adminCount = 0;
try {
    $adminCount = (int) $pdo->query('SELECT COUNT(*) FROM admin_users')->fetchColumn();
} catch (PDOException $e) {
    $adminCount = 0;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    page(
        'Instalasi Toko Online',
        '<h1>Instalasi Toko Online</h1>'
        . '<p style="font-size:14px;color:#4b5563">Koneksi database berhasil. Langkah ini akan membuat tabel, '
        . 'mengisi data contoh, dan membuat akun admin. Aman dijalankan berulang — data yang sudah ada tidak ditimpa.</p>'
        . '<form method="post">'
        . '<label>Setup key (dari api/config.php)</label>'
        . '<input type="text" name="setup_key" autocomplete="off" required>'
        . '<label>Username admin</label>'
        . '<input type="text" name="username" value="admin" autocomplete="off" required>'
        . '<label>Password admin (minimal 8 karakter)</label>'
        . '<input type="password" name="password" autocomplete="new-password" required>'
        . '<button type="submit">Jalankan Instalasi</button>'
        . '</form>'
        . ($adminCount > 0
            ? '<h2>Catatan</h2><p style="font-size:14px;color:#4b5563">Akun admin sudah ada, jadi password tidak akan diubah.</p>'
            : '')
    );
}

if (($_POST['setup_key'] ?? '') !== $setupKey) {
    page('Setup key salah', '<h1>Setup key salah</h1><div class="err">Nilai <code>setup_key</code> tidak cocok dengan yang ada di <code>api/config.php</code>.</div>', 403);
}

$username = trim((string) ($_POST['username'] ?? ''));
$password = (string) ($_POST['password'] ?? '');
$messages = [];

$tables = [
    <<<'SQL'
    CREATE TABLE IF NOT EXISTS admin_users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    SQL,
    <<<'SQL'
    CREATE TABLE IF NOT EXISTS admin_tokens (
        token CHAR(64) PRIMARY KEY,
        user_id INT NOT NULL,
        expires_at DATETIME NOT NULL,
        CONSTRAINT fk_tokens_user FOREIGN KEY (user_id) REFERENCES admin_users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    SQL,
    <<<'SQL'
    CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        icon VARCHAR(16) NOT NULL DEFAULT '📦',
        name VARCHAR(100) NOT NULL,
        sort_order INT NOT NULL DEFAULT 0
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    SQL,
    <<<'SQL'
    CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        price INT NOT NULL DEFAULT 0,
        original_price INT NULL,
        sold INT NOT NULL DEFAULT 0,
        location VARCHAR(100) NOT NULL DEFAULT '',
        rating DECIMAL(2,1) NOT NULL DEFAULT 5.0,
        description TEXT NOT NULL,
        is_active TINYINT(1) NOT NULL DEFAULT 1,
        sort_order INT NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_active (is_active)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    SQL,
    <<<'SQL'
    CREATE TABLE IF NOT EXISTS product_images (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id INT NOT NULL,
        url VARCHAR(255) NOT NULL,
        thumb_url VARCHAR(255) NOT NULL,
        sort_order INT NOT NULL DEFAULT 0,
        CONSTRAINT fk_images_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    SQL,
    <<<'SQL'
    CREATE TABLE IF NOT EXISTS product_variants (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id INT NOT NULL,
        label VARCHAR(150) NOT NULL,
        price INT NOT NULL DEFAULT 0,
        sort_order INT NOT NULL DEFAULT 0,
        CONSTRAINT fk_variants_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    SQL,
    <<<'SQL'
    CREATE TABLE IF NOT EXISTS product_categories (
        product_id INT NOT NULL,
        category_id INT NOT NULL,
        PRIMARY KEY (product_id, category_id),
        CONSTRAINT fk_pc_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        CONSTRAINT fk_pc_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    SQL,
    <<<'SQL'
    CREATE TABLE IF NOT EXISTS store_settings (
        id TINYINT PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        location VARCHAR(150) NOT NULL,
        promo_text VARCHAR(255) NOT NULL,
        banner VARCHAR(255) NOT NULL,
        whatsapp_number VARCHAR(20) NOT NULL,
        bottom_category_ids VARCHAR(255) NOT NULL DEFAULT '',
        accent_color VARCHAR(7) NOT NULL DEFAULT '#ee4d2d',
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    SQL,
];

foreach ($tables as $sql) {
    $pdo->exec($sql);
}
$messages[] = 'Tabel database siap.';

if ((int) $pdo->query('SELECT COUNT(*) FROM categories')->fetchColumn() === 0) {
    $stmt = $pdo->prepare('INSERT INTO categories (icon, name, sort_order) VALUES (?, ?, ?)');
    $seedCategories = [
        ['🏆', 'Plakat'],
        ['🪪', 'Name Tag'],
        ['💡', 'Lampu Hias'],
        ['🔑', 'Gantungan'],
        ['🖼️', 'Standee'],
        ['🎁', 'Souvenir'],
        ['🎟️', 'Promo'],
        ['⭐', 'Terlaris'],
    ];
    foreach ($seedCategories as $index => [$icon, $name]) {
        $stmt->execute([$icon, $name, $index]);
    }
    $messages[] = count($seedCategories) . ' kategori contoh ditambahkan.';
}

if ((int) $pdo->query('SELECT COUNT(*) FROM store_settings')->fetchColumn() === 0) {
    $stmt = $pdo->prepare(
        'INSERT INTO store_settings (id, name, location, promo_text, banner, whatsapp_number)
         VALUES (1, ?, ?, ?, ?, ?)'
    );
    $stmt->execute([
        'Toko Akrilik Kreatif',
        'Jakarta Barat',
        'PROMO KILAT! DISKON 50%',
        'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=1000&q=80',
        '6281234567890',
    ]);
    $messages[] = 'Pengaturan toko awal dibuat. Jangan lupa ganti nomor WhatsApp-nya.';
}

if ((int) $pdo->query('SELECT COUNT(*) FROM products')->fetchColumn() === 0) {
    $seedProducts = [
        [
            'name' => 'Plakat Akrilik Custom / Piala Penghargaan / Vandel Wisuda',
            'price' => 75000,
            'original' => 120000,
            'sold' => 4500,
            'location' => 'Jakarta Barat',
            'rating' => 4.9,
            'photo' => 'photo-1579548122080-c35fd6820ecb',
            'description' => "Plakat akrilik premium ketebalan 5mm. Cocok untuk hadiah wisuda, penghargaan, perlombaan, atau kenang-kenangan magang/KKN.\n\nDetail:\n- Bebas custom tulisan, bentuk, dan logo\n- Potongan rapi menggunakan mesin Laser Cutting\n- Cetak UV Print (Bukan stiker, warna tajam dan awet)\n- Free box bludru eksklusif\n- Proses pengerjaan cepat 1-2 hari kerja.",
        ],
        [
            'name' => 'Name Tag Akrilik Peniti / Magnet Custom Nama & Logo',
            'price' => 15000,
            'original' => null,
            'sold' => 12340,
            'location' => 'Bandung',
            'rating' => 4.8,
            'photo' => 'photo-1589384267710-7a170981ca78',
            'description' => "Name tag atau papan nama dada bahan akrilik tebal 2mm. Tampilan elegan, profesional, dan mengkilap (dilapisi resin).\n\n- Pilihan Pengait: Peniti atau Magnet super kuat\n- Hasil grafir/cetak sangat rapi dan anti luntur\n- Cocok untuk pegawai bank, ASN, guru, tenaga medis, dan panitia event.\n- Tidak ada minimal order (Bisa pesan 1 pcs).",
        ],
        [
            'name' => 'Lampu Tidur Hias Akrilik 3D Custom Foto & Nama LED',
            'price' => 125000,
            'original' => 150000,
            'sold' => 2100,
            'location' => 'Surabaya',
            'rating' => 4.9,
            'photo' => 'photo-1517502884422-41eaead166d4',
            'description' => "Lampu hias unik dari lembaran akrilik bening yang diukir (grafir laser) sehingga menghasilkan efek 3D saat dinyalakan.\n\n- Dudukan (base) kayu pinus estetik natural\n- Lampu LED warm white (nyaman di mata, tidak panas)\n- Bisa custom foto siluet wajah, nama, atau ucapan\n- Sangat cocok untuk kado ulang tahun, kado pernikahan (wedding), atau anniversary.\n- Power menggunakan kabel USB.",
        ],
        [
            'name' => 'Gantungan Kunci Akrilik Custom UV Print Bolak Balik (2 Sisi)',
            'price' => 8500,
            'original' => null,
            'sold' => 35000,
            'location' => 'Sleman',
            'rating' => 4.7,
            'photo' => 'photo-1605370425712-401d46b7a2d6',
            'description' => "Gantungan kunci akrilik custom desain bebas suka-suka!\n\n- Material: Akrilik tebal 3mm (atau 2 lapis 1.5mm di-press)\n- Dicetak menggunakan mesin UV Print Jepang (bukan stiker)\n- Gambar bisa bolak-balik (2 sisi) dengan desain yang sama atau berbeda\n- Ring gantungan tebal dan tidak mudah berkarat\n- Minimal order: 10 pcs (cocok untuk souvenir pernikahan, promosi perusahaan, atau merchandise komunitas).",
        ],
    ];

    $insertProduct = $pdo->prepare(
        'INSERT INTO products (name, price, original_price, sold, location, rating, description)
         VALUES (?, ?, ?, ?, ?, ?, ?)'
    );
    $insertImage = $pdo->prepare(
        'INSERT INTO product_images (product_id, url, thumb_url, sort_order) VALUES (?, ?, ?, 0)'
    );

    foreach ($seedProducts as $product) {
        $insertProduct->execute([
            $product['name'],
            $product['price'],
            $product['original'],
            $product['sold'],
            $product['location'],
            $product['rating'],
            $product['description'],
        ]);
        $productId = (int) $pdo->lastInsertId();
        $insertImage->execute([
            $productId,
            'https://images.unsplash.com/' . $product['photo'] . '?w=1000&q=80',
            'https://images.unsplash.com/' . $product['photo'] . '?w=400&q=80',
        ]);
    }

    $messages[] = count($seedProducts) . ' produk contoh ditambahkan.';
}

if ($adminCount === 0) {
    if ($username === '') {
        page('Username kosong', '<h1>Username kosong</h1><div class="err">Username admin wajib diisi.</div>', 400);
    }
    if (strlen($password) < 8) {
        page('Password terlalu pendek', '<h1>Password terlalu pendek</h1><div class="err">Password admin minimal 8 karakter. Kembali dan coba lagi.</div>', 400);
    }

    $stmt = $pdo->prepare('INSERT INTO admin_users (username, password_hash) VALUES (?, ?)');
    $stmt->execute([$username, password_hash($password, PASSWORD_DEFAULT)]);
    $messages[] = 'Akun admin "' . htmlspecialchars($username) . '" berhasil dibuat.';
} else {
    $messages[] = 'Akun admin sudah ada sebelumnya, tidak ada perubahan.';
}

page(
    'Instalasi selesai',
    '<h1>Instalasi selesai</h1><div class="ok"><ul>'
    . implode('', array_map(static function (string $message): string {
        return '<li>' . $message . '</li>';
    }, $messages))
    . '</ul></div>'
    . '<h2>Langkah terakhir</h2>'
    . '<div class="err"><strong>Hapus file <code>api/install.php</code> sekarang</strong> lewat cPanel File Manager. '
    . 'Selama file ini ada, siapa pun yang tahu setup key bisa membuat akun admin baru.</div>'
    . '<h2>Catatan</h2><ul><li>Produk contoh memakai gambar dari Unsplash — ganti dengan foto aslimu lewat panel admin.</li>'
    . '<li>Jangan lupa ubah nomor WhatsApp di menu Tampilan.</li></ul>'
);
