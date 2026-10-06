<?php
/* COPY OUTSIDE document root and Git; configure PT_CONFIG_FILE to its absolute path. */
// Recipient is fixed in request.php: iq_technologii@mail.ru; not configurable by clients.
return [
    'enabled' => false, // enable only on final PHP host
    'origin' => 'https://production.example', // exact HTTPS origin, no trailing slash, ASCII/punycode
    'data_dir' => __DIR__.'/request-metadata', // mkdir 0700, PHP process writable
    'rate_secret' => '', // generate privately: php -r 'echo bin2hex(random_bytes(32));'
    'from' => '', // authorized sender on business/site domain, confirmed by host
    'transport' => 'mail', // mail() MTA fallback; use smtp when credentials are available
    'autoload' => __DIR__.'/vendor/autoload.php', // SMTP only
    'smtp' => ['host'=>'','port'=>587,'encryption'=>'tls','username'=>'','password'=>''],
];
