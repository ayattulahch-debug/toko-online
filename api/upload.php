<?php

declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';

send_cors();
require_method('POST');
require_auth();

const MAX_UPLOAD_BYTES = 2097152;

function store_image(array $file, string $basename): string
{
    $error = (int) ($file['error'] ?? UPLOAD_ERR_NO_FILE);
    if ($error !== UPLOAD_ERR_OK) {
        json_error('Upload gambar gagal (kode ' . $error . ').');
    }

    if ((int) ($file['size'] ?? 0) > MAX_UPLOAD_BYTES) {
        json_error('Ukuran gambar maksimal 2 MB setelah kompresi.');
    }

    $tmpName = (string) ($file['tmp_name'] ?? '');
    if ($tmpName === '' || !is_uploaded_file($tmpName)) {
        json_error('Berkas upload tidak valid.');
    }

    $allowed = ['image/webp' => 'webp', 'image/jpeg' => 'jpg', 'image/png' => 'png'];

    $finfo = new finfo(FILEINFO_MIME_TYPE);
    $mime = (string) $finfo->file($tmpName);
    if (!isset($allowed[$mime])) {
        json_error('Format gambar harus WebP, JPG, atau PNG.');
    }

    $dir = uploads_dir();
    if (!is_dir($dir) && !mkdir($dir, 0755, true) && !is_dir($dir)) {
        json_error('Folder upload tidak dapat dibuat di server.', 500);
    }

    $filename = $basename . '.' . $allowed[$mime];
    if (!move_uploaded_file($tmpName, $dir . '/' . $filename)) {
        json_error('Gagal menyimpan gambar ke server.', 500);
    }

    return UPLOAD_URL_PREFIX . $filename;
}

if (!isset($_FILES['file']) || !is_array($_FILES['file'])) {
    json_error('Tidak ada gambar yang dikirim.');
}

$base = bin2hex(random_bytes(8));
$url = store_image($_FILES['file'], $base . '-full');

$thumbUrl = $url;
if (isset($_FILES['thumb']) && is_array($_FILES['thumb']) && (int) ($_FILES['thumb']['error'] ?? UPLOAD_ERR_NO_FILE) === UPLOAD_ERR_OK) {
    $thumbUrl = store_image($_FILES['thumb'], $base . '-thumb');
}

json_out(['url' => $url, 'thumbUrl' => $thumbUrl]);
