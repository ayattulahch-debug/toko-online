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

    $rows[] = [
        'id' => (int) ($category['id'] ?? 0),
        'icon' => $icon,
        'name' => $name,
        'order' => (int) $index,
    ];
}

$pdo = db();
$pdo->beginTransaction();

try {
    // Kategori lama diperbarui, bukan dihapus lalu dibuat ulang. Kalau dihapus
    // semua, foreign key dari product_categories akan ikut menghapus tautan
    // produk ke kategori setiap kali kategori disimpan.
    $keptIds = [];
    foreach ($rows as $row) {
        if ($row['id'] > 0) {
            $keptIds[] = $row['id'];
        }
    }

    if ($keptIds === []) {
        $pdo->exec('DELETE FROM categories');
    } else {
        $placeholders = implode(',', array_fill(0, count($keptIds), '?'));
        $stmt = $pdo->prepare('DELETE FROM categories WHERE id NOT IN (' . $placeholders . ')');
        $stmt->execute($keptIds);
    }

    $update = $pdo->prepare('UPDATE categories SET icon = ?, name = ?, sort_order = ? WHERE id = ?');
    $insert = $pdo->prepare('INSERT INTO categories (icon, name, sort_order) VALUES (?, ?, ?)');

    foreach ($rows as $row) {
        if ($row['id'] > 0) {
            $update->execute([$row['icon'], $row['name'], $row['order'], $row['id']]);
        } else {
            $insert->execute([$row['icon'], $row['name'], $row['order']]);
        }
    }

    $pdo->commit();
} catch (PDOException $e) {
    $pdo->rollBack();
    json_error('Gagal menyimpan kategori.', 500);
}

$saved = [];
foreach (db()->query('SELECT id, icon, name FROM categories ORDER BY sort_order ASC, id ASC')->fetchAll() as $row) {
    $saved[] = [
        'id' => (int) $row['id'],
        'icon' => (string) $row['icon'],
        'name' => (string) $row['name'],
    ];
}

json_out(['ok' => true, 'categories' => $saved]);
