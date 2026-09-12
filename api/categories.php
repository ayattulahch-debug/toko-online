<?php

declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';

send_cors();
require_method('POST');
require_auth();

$body = read_json_body();
$input = $body['categories'] ?? null;

if (!is_array($input)) {
    json_error('Data kategori tidak valid.');
}

if (count($input) > 20) {
    json_error('Maksimal 20 kategori.');
}

$rows = [];
foreach ($input as $index => $category) {
    if (!is_array($category)) {
        json_error('Format data kategori tidak valid.');
    }

    $name = trim((string) ($category['name'] ?? ''));
    $icon = trim((string) ($category['icon'] ?? '📦'));

    if ($name === '') {
        json_error('Nama kategori tidak boleh kosong.');
    }
    if (mb_strlen($name) > 100) {
        json_error('Nama kategori terlalu panjang (maksimal 100 karakter).');
    }
    if (mb_strlen($icon) > 16) {
        json_error('Ikon kategori terlalu panjang (maksimal 16 karakter).');
    }

    $rows[] = ['icon' => $icon, 'name' => $name, 'order' => (int) $index];
}

$pdo = db();
$pdo->beginTransaction();

try {
    $pdo->exec('DELETE FROM categories');

    $stmt = $pdo->prepare('INSERT INTO categories (icon, name, sort_order) VALUES (?, ?, ?)');
    foreach ($rows as $row) {
        $stmt->execute([$row['icon'], $row['name'], $row['order']]);
    }

    $pdo->commit();
} catch (PDOException $e) {
    $pdo->rollBack();
    json_error('Gagal menyimpan kategori.', 500);
}

json_out(['ok' => true]);
