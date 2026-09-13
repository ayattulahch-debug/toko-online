<?php

declare(strict_types=1);

// Skrip sekali pakai untuk mengganti username dan password admin.
// Dilindungi setup_key dari api/config.php.
// HAPUS file ini lewat cPanel File Manager setelah dipakai.

$configPath = __DIR__ . '/config.php';

function page(string $title, string $body, int $status = 200): void
{
    http_response_code($status);
    header('Content-Type: text/html; charset=utf-8');
    echo '<!doctype html><html lang="id"><head><meta charset="utf-8">'
        . '<meta name="viewport" content="width=device-width, initial-scale=1">'
        . '<title>' . htmlspecialchars($title) . '</title>'
        . '<style>body{font-family:system-ui,-apple-system,"Segoe UI",sans-serif;background:#f3f4f6;'
        . 'margin:0;padding:32px 16px;color:#1f2937}.card{max-width:480px;margin:0 auto;background:#fff;'
        . 'border-radius:12px;padding:24px;box-shadow:0 10px 30px rgba(0,0,0,.08)}'
        . 'h1{font-size:19px;margin:0 0 14px}h2{font-size:15px;margin:18px 0 8px}'
        . 'label{display:block;font-size:13px;font-weight:600;margin-top:12px}'
        . 'input{width:100%;box-sizing:border-box;padding:10px;margin-top:4px;border:1px solid #d1d5db;'
        . 'border-radius:8px;font-size:14px}button{margin-top:18px;width:100%;padding:12px;border:0;'
        . 'border-radius:8px;background:#ee4d2d;color:#fff;font-weight:700;font-size:14px;cursor:pointer}'
        . '.err{background:#fef2f2;border:1px solid #fecaca;color:#991b1b;padding:12px;border-radius:8px;font-size:14px}'
        . '.ok{background:#f0fdf4;border:1px solid #bbf7d0;color:#166534;padding:12px;border-radius:8px;font-size:14px}'
        . 'code{background:#f3f4f6;padding:2px 6px;border-radius:4px;font-size:13px}</style></head><body>'
        . '<div class="card">' . $body . '</div></body></html>';
    exit;
}

if (!is_file($configPath)) {
    page('Konfigurasi belum ada', '<h1>Konfigurasi belum ada</h1><div class="err">File <code>api/config.php</code> tidak ditemukan.</div>', 500);
}

$config = require $configPath;

if (!is_array($config)) {
    page('Konfigurasi tidak valid', '<h1>Konfigurasi tidak valid</h1><div class="err">Isi <code>api/config.php</code> harus berupa <code>return [...]</code>.</div>', 500);
}

$setupKey = (string) ($config['setup_key'] ?? '');
if ($setupKey === '' || $setupKey === 'ganti-dengan-teks-acak-pilihanmu') {
    page('setup_key belum disetel', '<h1>setup_key belum disetel</h1><div class="err">Isi <code>setup_key</code> di <code>api/config.php</code> terlebih dahulu.</div>', 500);
}

try {
    $pdo = new PDO(
        sprintf('mysql:host=%s;dbname=%s;charset=utf8mb4', (string) $config['db_host'], (string) $config['db_name']),
        (string) $config['db_user'],
        (string) $config['db_pass'],
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC]
    );
} catch (PDOException $e) {
    page('Koneksi database gagal', '<h1>Koneksi database gagal</h1><div class="err">' . htmlspecialchars($e->getMessage()) . '</div>', 500);
}

$existing = $pdo->query('SELECT username FROM admin_users ORDER BY id ASC')->fetchAll();

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    $list = $existing === []
        ? '<p style="font-size:14px;color:#4b5563">Belum ada akun admin. Form ini akan membuatnya.</p>'
        : '<p style="font-size:14px;color:#4b5563">Akun admin saat ini: <strong>'
            . htmlspecialchars(implode(', ', array_column($existing, 'username'))) . '</strong></p>';

    page(
        'Ganti Akun Admin',
        '<h1>Ganti Akun Admin</h1>'
        . $list
        . '<form method="post">'
        . '<label>Setup key (dari api/config.php)</label>'
        . '<input type="text" name="setup_key" autocomplete="off" required>'
        . '<label>Username admin</label>'
        . '<input type="text" name="username" value="admin" autocomplete="off" required>'
        . '<label>Password baru (minimal 8 karakter)</label>'
        . '<input type="password" name="password" autocomplete="new-password" required>'
        . '<button type="submit">Simpan</button>'
        . '</form>'
        . '<h2>Catatan</h2>'
        . '<p style="font-size:13px;color:#6b7280">Akun admin lama akan diganti, dan semua sesi login '
        . 'yang masih aktif akan keluar. Setelah berhasil, <strong>hapus file '
        . '<code>api/reset-admin.php</code></strong> lewat File Manager.</p>'
    );
}

if (($_POST['setup_key'] ?? '') !== $setupKey) {
    page('Setup key salah', '<h1>Setup key salah</h1><div class="err">Nilainya tidak cocok dengan <code>api/config.php</code>.</div>', 403);
}

$username = trim((string) ($_POST['username'] ?? ''));
$password = (string) ($_POST['password'] ?? '');

if ($username === '') {
    page('Username kosong', '<h1>Username kosong</h1><div class="err">Username wajib diisi.</div>', 400);
}
if (strlen($password) < 8) {
    page('Password terlalu pendek', '<h1>Password terlalu pendek</h1><div class="err">Password minimal 8 karakter. Kembali dan coba lagi.</div>', 400);
}

$pdo->beginTransaction();

try {
    $pdo->exec('DELETE FROM admin_tokens');
    $pdo->exec('DELETE FROM admin_users');
    $stmt = $pdo->prepare('INSERT INTO admin_users (username, password_hash) VALUES (?, ?)');
    $stmt->execute([$username, password_hash($password, PASSWORD_DEFAULT)]);
    $pdo->commit();
} catch (PDOException $e) {
    $pdo->rollBack();
    page('Gagal menyimpan', '<h1>Gagal menyimpan</h1><div class="err">' . htmlspecialchars($e->getMessage()) . '</div>', 500);
}

page(
    'Akun admin diperbarui',
    '<h1>Akun admin diperbarui</h1><div class="ok">Username <strong>' . htmlspecialchars($username)
    . '</strong> sudah bisa dipakai untuk login ke panel toko.</div>'
    . '<h2>Langkah terakhir</h2>'
    . '<div class="err"><strong>Hapus file <code>api/reset-admin.php</code> sekarang</strong> lewat cPanel '
    . 'File Manager, supaya tidak ada yang bisa mengganti akun adminmu.</div>'
);
