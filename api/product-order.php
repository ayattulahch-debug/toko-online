<?php

declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';

send_cors();
require_method('POST');
require_auth();

$body = read_json_body();
$input = $body['ids'] ?? null;

if (!is_array($input) || $input === []) {
    json_error('Daftar produk tidak valid.');
}

$unique = [];
foreach ($input as $rawId) {
    $value = (int) $rawId;
    if ($value > 0) {
        $unique[$value] = true;
    }
}

$ids = array_keys($unique);

if ($ids === []) {
    json_error('Daftar produk tidak valid.');
}

if (count($ids) > 500) {
    json_error('Terlalu banyak produk dalam satu permintaan.');
}

$pdo = db();
$pdo->beginTransaction();

try {
    // Urutan disimpan mulai dari 1 sesuai posisi pada daftar yang dikirim
    // dashboard, sehingga urutan tampil di katalog ikut berubah.
    $stmt = $pdo->prepare('UPDATE products SET sort_order = ? WHERE id = ?');
    foreach ($ids as $index => $productId) {
        $stmt->execute([$index + 1, $productId]);
    }

    $pdo->commit();
} catch (PDOException $e) {
    $pdo->rollBack();
    json_error('Gagal menyimpan urutan produk.', 500);
}

json_out(['ok' => true]);
