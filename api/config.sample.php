<?php

// Salin file ini menjadi `config.php` di folder yang sama, lalu isi sesuai
// database cPanel kamu. File `config.php` tidak ikut git, jadi tidak akan
// tertimpa saat update dari GitHub.

return [
    'db_host'    => 'localhost',
    'db_name'    => 'user_toko',
    'db_user'    => 'user_toko',
    'db_pass'    => 'password-database',

    // Kunci rahasia untuk membuka api/install.php.
    // Ganti dengan teks acak pilihanmu sendiri, lalu HAPUS api/install.php
    // setelah instalasi berhasil.
    'setup_key'  => 'ganti-dengan-teks-acak-pilihanmu',
];
