<?php

declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';

send_cors();
require_method('POST');
require_auth();

$body = read_json_body();

$categoryId = (int) ($body['categoryId'] ?? 0);
$productIds = normalize_category_ids($body['productIds'] ?? null);

if ($categoryId <= 0) {
    json_error('ID kategori tidak valid.');
}

if (count($productIds) > 500) {
    json_error('Terlalu banyak produk dalam satu kategori (maksimal 500).');
}

$pdo = db();

$stmt = $pdo->prepare('SELECT id FROM categories WHERE id = ?');
$stmt->execute([$categoryId]);
if ($stmt->fetch() === false) {
    json_error('Kategori tidak ditemukan.', 404);
}

// Hanya produk yang benar-benar ada yang ditautkan, supaya tidak menyisakan
// rujukan ke produk yang sudah dihapus.
if ($productIds !== []) {
    $placeholders = implode(',', array_fill(0, count($productIds), '?'));
    $stmt = $pdo->prepare('SELECT id FROM products WHERE id IN (' . $placeholders . ')');
    $stmt->execute($productIds);
    $productIds = array_map('intval', $stmt->fetchAll(PDO::FETCH_COLUMN));
}

$pdo->beginTransaction();

try {
    // Daftar produk kategori diganti seluruhnya, sesuai centang di panel admin.
    // Relasi ini dikelola terpisah dari sisi produk (products.php), jadi tidak
    // saling menimpa.
    $stmt = $pdo->prepare('DELETE FROM product_categories WHERE category_id = ?');
    $stmt->execute([$categoryId]);

    $stmt = $pdo->prepare('INSERT INTO product_categories (product_id, category_id) VALUES (?, ?)');
    foreach ($productIds as $productId) {
        $stmt->execute([$productId, $categoryId]);
    }

    $pdo->commit();
} catch (PDOException $e) {
    $pdo->rollBack();
    json_error('Gagal menyimpan produk kategori.', 500);
}

json_out(['ok' => true, 'productIds' => $productIds]);
