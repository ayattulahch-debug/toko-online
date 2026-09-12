<?php

declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';

send_cors();

$action = (string) ($_GET['action'] ?? '');

if ($action === 'login') {
    require_method('POST');

    $body = read_json_body();
    $username = trim((string) ($body['username'] ?? ''));
    $password = (string) ($body['password'] ?? '');

    if ($username === '' || $password === '') {
        json_error('Username dan password wajib diisi.');
    }

    $stmt = db()->prepare('SELECT id, username, password_hash FROM admin_users WHERE username = ?');
    $stmt->execute([$username]);
    $user = $stmt->fetch();

    // password_verify tetap dijalankan walau user tidak ditemukan agar waktu
    // respons tidak membocorkan username mana yang ada.
    $hash = $user === false
        ? '$2y$10$usesomesillystringfore7hnbRJHxXVLeakoG8K30oukPsA.ztMG'
        : (string) $user['password_hash'];

    if ($user === false || password_verify($password, $hash) === false) {
        usleep(300000);
        json_error('Username atau password salah.', 401);
    }

    $token = bin2hex(random_bytes(32));
    $stmt = db()->prepare(
        'INSERT INTO admin_tokens (token, user_id, expires_at)
         VALUES (?, ?, DATE_ADD(NOW(), INTERVAL ' . TOKEN_LIFETIME_DAYS . ' DAY))'
    );
    $stmt->execute([$token, (int) $user['id']]);

    db()->exec('DELETE FROM admin_tokens WHERE expires_at < NOW()');

    json_out(['token' => $token, 'username' => (string) $user['username']]);
}

if ($action === 'logout') {
    require_method('POST');
    require_auth();

    $token = bearer_token();
    if ($token !== null) {
        $stmt = db()->prepare('DELETE FROM admin_tokens WHERE token = ?');
        $stmt->execute([$token]);
    }

    json_out(['ok' => true]);
}

if ($action === 'change-password') {
    require_method('POST');
    $user = require_auth();
    $body = read_json_body();

    $oldPassword = (string) ($body['oldPassword'] ?? '');
    $newPassword = (string) ($body['newPassword'] ?? '');

    if (strlen($newPassword) < 8) {
        json_error('Password baru minimal 8 karakter.');
    }

    $stmt = db()->prepare('SELECT password_hash FROM admin_users WHERE id = ?');
    $stmt->execute([(int) $user['id']]);
    $hash = (string) $stmt->fetchColumn();

    if (password_verify($oldPassword, $hash) === false) {
        usleep(300000);
        json_error('Password lama tidak cocok.', 401);
    }

    $stmt = db()->prepare('UPDATE admin_users SET password_hash = ? WHERE id = ?');
    $stmt->execute([password_hash($newPassword, PASSWORD_DEFAULT), (int) $user['id']]);

    // Semua sesi lama dicabut, lalu sesi ini diberi token baru.
    $stmt = db()->prepare('DELETE FROM admin_tokens WHERE user_id = ?');
    $stmt->execute([(int) $user['id']]);

    $token = bin2hex(random_bytes(32));
    $stmt = db()->prepare(
        'INSERT INTO admin_tokens (token, user_id, expires_at)
         VALUES (?, ?, DATE_ADD(NOW(), INTERVAL ' . TOKEN_LIFETIME_DAYS . ' DAY))'
    );
    $stmt->execute([$token, (int) $user['id']]);

    json_out(['token' => $token]);
}

json_error('Aksi tidak dikenal.', 404);
