<?php

declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';

send_cors();
require_method('POST');
require_auth();

$body = read_json_body();

$name = trim((string) ($body['name'] ?? ''));
$location = trim((string) ($body['location'] ?? ''));
$promoText = trim((string) ($body['promoText'] ?? ''));
$banner = trim((string) ($body['banner'] ?? ''));
$whatsappNumber = normalize_whatsapp((string) ($body['whatsappNumber'] ?? ''));
$bottomCategoryIds = normalize_category_ids($body['bottomCategoryIds'] ?? null);

if (count($bottomCategoryIds) > MAX_BOTTOM_CATEGORIES) {
    json_error('Maksimal ' . MAX_BOTTOM_CATEGORIES . ' kategori untuk bilah bawah.');
}

if ($name === '') {
    json_error('Nama toko wajib diisi.');
}
if (mb_strlen($name) > 150) {
    json_error('Nama toko terlalu panjang (maksimal 150 karakter).');
}
if (mb_strlen($location) > 150) {
    json_error('Lokasi terlalu panjang (maksimal 150 karakter).');
}
if (mb_strlen($promoText) > 255) {
    json_error('Teks promo terlalu panjang (maksimal 255 karakter).');
}
if ($banner === '' || is_valid_image_url($banner) === false) {
    json_error('Banner toko belum diisi atau tidak valid.');
}
if ($whatsappNumber === '' || strlen($whatsappNumber) < 10 || strlen($whatsappNumber) > 15) {
    json_error('Nomor WhatsApp tidak valid. Contoh: 6281234567890.');
}

$pdo = db();

// Hanya kategori yang benar-benar ada yang disimpan, supaya pengaturan tidak
// menyisakan rujukan ke kategori yang sudah dihapus.
if ($bottomCategoryIds !== []) {
    $placeholders = implode(',', array_fill(0, count($bottomCategoryIds), '?'));
    $stmt = $pdo->prepare('SELECT id FROM categories WHERE id IN (' . $placeholders . ')');
    $stmt->execute($bottomCategoryIds);
    $bottomCategoryIds = array_map('intval', $stmt->fetchAll(PDO::FETCH_COLUMN));
}

$stmt = $pdo->prepare('SELECT banner FROM store_settings WHERE id = 1');
$stmt->execute();
$oldBanner = (string) ($stmt->fetchColumn() ?: '');

try {
    $stmt = $pdo->prepare(
        'INSERT INTO store_settings (id, name, location, promo_text, banner, whatsapp_number, bottom_category_ids)
         VALUES (1, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
            name = VALUES(name),
            location = VALUES(location),
            promo_text = VALUES(promo_text),
            banner = VALUES(banner),
            whatsapp_number = VALUES(whatsapp_number),
            bottom_category_ids = VALUES(bottom_category_ids)'
    );
    $stmt->execute([
        $name,
        $location,
        $promoText,
        $banner,
        $whatsappNumber,
        implode(',', $bottomCategoryIds),
    ]);
} catch (PDOException $e) {
    json_error('Gagal menyimpan pengaturan toko.', 500);
}

if ($oldBanner !== '' && $oldBanner !== $banner) {
    delete_upload_file($oldBanner);
}

json_out(['ok' => true]);
