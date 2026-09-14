<?php

declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';

send_cors();
require_method('GET');

$productRows = db()->query(
    'SELECT id, name, price, original_price, sold, location, rating, description
     FROM products
     WHERE is_active = 1
     ORDER BY sort_order ASC, id ASC'
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

$variantRows = db()->query(
    'SELECT pv.product_id, pv.label, pv.price
     FROM product_variants pv
     INNER JOIN products p ON p.id = pv.product_id
     WHERE p.is_active = 1
     ORDER BY pv.product_id ASC, pv.sort_order ASC, pv.id ASC'
)->fetchAll();

$variantsByProduct = [];
foreach ($variantRows as $row) {
    $variantsByProduct[(int) $row['product_id']][] = [
        'label' => (string) $row['label'],
        'price' => (int) $row['price'],
    ];
}

$categoryRows = db()->query(
    'SELECT pc.product_id, pc.category_id
     FROM product_categories pc
     INNER JOIN products p ON p.id = pc.product_id
     WHERE p.is_active = 1
     ORDER BY pc.product_id ASC, pc.category_id ASC'
)->fetchAll();

$categoriesByProduct = [];
foreach ($categoryRows as $row) {
    $categoriesByProduct[(int) $row['product_id']][] = (int) $row['category_id'];
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
        'variants' => $variantsByProduct[$id] ?? [],
        'categoryIds' => $categoriesByProduct[$id] ?? [],
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
    'SELECT name, location, promo_text, banner, whatsapp_number, bottom_category_ids, accent_color
     FROM store_settings WHERE id = 1'
)->fetch();

$bottomCategoryIds = [];
foreach (explode(',', (string) ($settingsRow['bottom_category_ids'] ?? '')) as $rawId) {
    $value = (int) trim($rawId);
    if ($value > 0) {
        $bottomCategoryIds[] = $value;
    }
}

json_out([
    'products' => $products,
    'categories' => $categories,
    'settings' => [
        'name' => (string) ($settingsRow['name'] ?? ''),
        'location' => (string) ($settingsRow['location'] ?? ''),
        'promoText' => (string) ($settingsRow['promo_text'] ?? ''),
        'banner' => (string) ($settingsRow['banner'] ?? ''),
        'whatsappNumber' => (string) ($settingsRow['whatsapp_number'] ?? ''),
        'bottomCategoryIds' => $bottomCategoryIds,
        'accentColor' => (string) ($settingsRow['accent_color'] ?? '#ee4d2d'),
    ],
]);
