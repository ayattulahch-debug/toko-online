<?php

declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';

send_cors();
require_method('GET');

$productRows = db()->query(
    'SELECT id, name, price, original_price, sold, location, rating, description
     FROM products
     WHERE is_active = 1
     ORDER BY id ASC'
)->fetchAll();

$imageRows = db()->query(
    'SELECT pi.product_id, pi.url, pi.thumb_url
     FROM product_images pi
     INNER JOIN products p ON p.id = pi.product_id
     WHERE p.is_active = 1
     ORDER BY pi.product_id ASC, pi.sort_order ASC, pi.id ASC'
)->fetchAll();

$imagesByProduct = [];
foreach ($imageRows as $row) {
    $imagesByProduct[(int) $row['product_id']][] = [
        'url' => (string) $row['url'],
        'thumbUrl' => (string) $row['thumb_url'],
    ];
}

$products = [];
foreach ($productRows as $row) {
    $id = (int) $row['id'];
    $products[] = [
        'id' => $id,
        'name' => (string) $row['name'],
        'price' => (int) $row['price'],
        'originalPrice' => $row['original_price'] === null ? null : (int) $row['original_price'],
        'sold' => (int) $row['sold'],
        'location' => (string) $row['location'],
        'rating' => (float) $row['rating'],
        'description' => (string) $row['description'],
        'images' => $imagesByProduct[$id] ?? [],
    ];
}

$categories = [];
foreach (db()->query('SELECT id, icon, name FROM categories ORDER BY sort_order ASC, id ASC')->fetchAll() as $row) {
    $categories[] = [
        'id' => (int) $row['id'],
        'icon' => (string) $row['icon'],
        'name' => (string) $row['name'],
    ];
}

$settingsRow = db()->query(
    'SELECT name, location, promo_text, banner, whatsapp_number FROM store_settings WHERE id = 1'
)->fetch();

json_out([
    'products' => $products,
    'categories' => $categories,
    'settings' => [
        'name' => (string) ($settingsRow['name'] ?? ''),
        'location' => (string) ($settingsRow['location'] ?? ''),
        'promoText' => (string) ($settingsRow['promo_text'] ?? ''),
        'banner' => (string) ($settingsRow['banner'] ?? ''),
        'whatsappNumber' => (string) ($settingsRow['whatsapp_number'] ?? ''),
    ],
]);
