<?php

declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';

send_cors();

$method = (string) ($_SERVER['REQUEST_METHOD'] ?? '');

if ($method === 'DELETE') {
    require_auth();

    $id = (int) ($_GET['id'] ?? 0);
    if ($id <= 0) {
        json_error('ID produk tidak valid.');
    }

    $pdo = db();
    $stmt = $pdo->prepare('SELECT url, thumb_url FROM product_images WHERE product_id = ?');
    $stmt->execute([$id]);
    $images = $stmt->fetchAll();

    if ($images === []) {
        $stmt = $pdo->prepare('SELECT id FROM products WHERE id = ?');
        $stmt->execute([$id]);
        if ($stmt->fetch() === false) {
            json_error('Produk tidak ditemukan.', 404);
        }
    }

    $stmt = $pdo->prepare('DELETE FROM products WHERE id = ?');
    $stmt->execute([$id]);

    foreach ($images as $image) {
        delete_upload_file((string) $image['url']);
        if ($image['thumb_url'] !== $image['url']) {
            delete_upload_file((string) $image['thumb_url']);
        }
    }

    json_out(['ok' => true]);
}

require_method('POST');
require_auth();

$body = read_json_body();

$id = (int) ($body['id'] ?? 0);
$name = trim((string) ($body['name'] ?? ''));
$description = trim((string) ($body['description'] ?? ''));
$price = (int) ($body['price'] ?? 0);
$originalPriceInput = $body['originalPrice'] ?? null;
$originalPrice = ($originalPriceInput === null || $originalPriceInput === '' || (int) $originalPriceInput <= 0)
    ? null
    : (int) $originalPriceInput;
$sold = (int) ($body['sold'] ?? 0);
$location = trim((string) ($body['location'] ?? ''));
$rating = (float) ($body['rating'] ?? 5.0);

if ($name === '') {
    json_error('Nama produk wajib diisi.');
}
if (mb_strlen($name) > 255) {
    json_error('Nama produk terlalu panjang (maksimal 255 karakter).');
}
if ($description === '') {
    json_error('Deskripsi produk wajib diisi.');
}
if ($price < 0) {
    json_error('Harga tidak boleh negatif.');
}
if ($sold < 0) {
    json_error('Jumlah terjual tidak boleh negatif.');
}
if ($rating < 0 || $rating > 5) {
    json_error('Rating harus berada di antara 0 dan 5.');
}
if (mb_strlen($location) > 100) {
    json_error('Lokasi terlalu panjang (maksimal 100 karakter).');
}

$images = normalize_images($body['images'] ?? null);
$variants = normalize_variants($body['variants'] ?? null);

$pdo = db();
$pdo->beginTransaction();

try {
    if ($id > 0) {
        $stmt = $pdo->prepare('SELECT id FROM products WHERE id = ?');
        $stmt->execute([$id]);
        if ($stmt->fetch() === false) {
            $pdo->rollBack();
            json_error('Produk tidak ditemukan.', 404);
        }

        $stmt = $pdo->prepare(
            'UPDATE products
             SET name = ?, price = ?, original_price = ?, sold = ?, location = ?, rating = ?, description = ?
             WHERE id = ?'
        );
        $stmt->execute([$name, $price, $originalPrice, $sold, $location, $rating, $description, $id]);
    } else {
        $stmt = $pdo->prepare(
            'INSERT INTO products (name, price, original_price, sold, location, rating, description)
             VALUES (?, ?, ?, ?, ?, ?, ?)'
        );
        $stmt->execute([$name, $price, $originalPrice, $sold, $location, $rating, $description]);
        $id = (int) $pdo->lastInsertId();
    }

    $stmt = $pdo->prepare('DELETE FROM product_images WHERE product_id = ?');
    $stmt->execute([$id]);

    $stmt = $pdo->prepare(
        'INSERT INTO product_images (product_id, url, thumb_url, sort_order) VALUES (?, ?, ?, ?)'
    );
    foreach ($images as $index => $image) {
        $stmt->execute([$id, $image['url'], $image['thumbUrl'], $index]);
    }

    $stmt = $pdo->prepare('DELETE FROM product_variants WHERE product_id = ?');
    $stmt->execute([$id]);

    $stmt = $pdo->prepare(
        'INSERT INTO product_variants (product_id, label, price, sort_order) VALUES (?, ?, ?, ?)'
    );
    foreach ($variants as $index => $variant) {
        $stmt->execute([$id, $variant['label'], $variant['price'], $index]);
    }

    $pdo->commit();
} catch (PDOException $e) {
    $pdo->rollBack();
    json_error('Gagal menyimpan produk ke database.', 500);
}

json_out(['ok' => true, 'id' => $id]);
