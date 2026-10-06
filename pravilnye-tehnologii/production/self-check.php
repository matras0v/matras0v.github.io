<?php
declare(strict_types=1);
// Install outside web root only. No mail is sent; no configuration values are printed.
if (PHP_SAPI !== 'cli') { http_response_code(404); exit; }
ini_set('display_errors','0');
$failed=false;
function check(string $name, bool $ok): void {
    global $failed;
    echo ($ok ? 'PASS: ' : 'FAIL: ').$name.PHP_EOL;
    if (!$ok) $failed=true;
}
check('PHP >= 8.2',version_compare(PHP_VERSION,'8.2','>='));
check('mbstring',extension_loaded('mbstring'));
$root=realpath($argv[1] ?? __DIR__.'/../public_html');
check('document root available',$root !== false);
if (!$root) exit(1);
$_SERVER['DOCUMENT_ROOT']=$root;
$endpoint=$root.'/api/request.php';
check('endpoint readable',is_file($endpoint) && is_readable($endpoint));
if (!is_file($endpoint)) exit(1);
try {
    // Loading the endpoint also parses its PHP syntax; CLI never invokes pt_main.
    require $endpoint;
    check('endpoint PHP load',true);
    $config=pt_config();
    check('private config / enabled / origin / sender / secret',true);
    check('metadata writable outside root',is_writable($config['data_dir']));
    $probe=$config['data_dir'].'/check-'.bin2hex(random_bytes(8));
    umask(0077);
    pt_locked($probe,static function($h): void {pt_write($h,['check'=>true]);});
    unlink($probe);
    check('metadata lock / write / flush',true);
    if ($config['transport']==='smtp') {
        require_once $config['autoload'];
        check('SMTP library available',class_exists('PHPMailer\\PHPMailer\\PHPMailer'));
    } else check('mail() available',function_exists('mail'));
} catch (Throwable) {check('server configuration / filesystem',false);}
echo 'Transport acceptance and Inbox/Spam delivery require a real hosting test.'.PHP_EOL;
exit($failed ? 1 : 0);
