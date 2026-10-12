<?php

declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';

send_cors();
require_method('POST');
require_auth();

// Menyembunyikan atau menampilkan kembali satu produk. Hanya kolom is_active yang
// diubah: foto, harga, varian, kategori, dan urutan produk tetap utuh, sehingga
// produk bisa dimunculkan lagi persis seperti sebelumnya.

$body = read_json_body();

$id = (int) ($body['id'] ?? 0);
$hidden = $body['hidden'] ?? null;

if ($id <= 0) {
    json_error('ID produk tidak valid.');
}
if (!is_bool($hidden)) {
    json_error('Status tampil produk tidak valid.');
}

$pdo = db();

$stmt = $pdo->prepare('SELECT id FROM products WHERE id = ?');
$stmt->execute([$id]);
if ($stmt->fetch() === false) {
    json_error('Produk tidak ditemukan.', 404);
}

try {
    $stmt = $pdo->prepare('UPDATE products SET is_active = ? WHERE id = ?');
    $stmt->execute([$hidden ? 0 : 1, $id]);
} catch (PDOException $e) {
    json_error('Gagal mengubah status tampil produk.', 500);
}

json_out(['ok' => true, 'id' => $id, 'hidden' => $hidden]);
