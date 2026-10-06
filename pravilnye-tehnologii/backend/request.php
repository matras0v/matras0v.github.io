<?php
declare(strict_types=1);
/* Upload this file to /api/request.php. PHP 8.2+, mbstring; no database or PII storage. */
const PT_RECIPIENT = 'zakaz@qptech.ru';
function pt_fields(array $value, array $allowed): void {
    if (array_diff(array_keys($value), $allowed)) throw new InvalidArgumentException('fields');
}
function pt_object(mixed $value): array {
    if (!is_array($value) || array_is_list($value)) throw new InvalidArgumentException('object');
    return $value;
}
function pt_text(mixed $value, int $max, bool $required = false, bool $multiline = false): string {
    if (!is_string($value) || !mb_check_encoding($value, 'UTF-8') || mb_strlen($value) > $max ||
        preg_match($multiline ? '/[\x00-\x08\x0B-\x1F\x7F]/' : '/[\x00-\x1F\x7F]/', $value)) throw new InvalidArgumentException('text');
    $value = trim($value);
    if ($required && $value === '') throw new InvalidArgumentException('required');
    return $value;
}
function pt_price(mixed $value): string {
    if (!(is_int($value) || is_float($value) || (is_string($value) && preg_match('/^\d{1,9}(?:\.\d{1,2})?$/D', $value))) ||
        !is_finite((float)$value) || (float)$value < 0 || (float)$value > 999999999) throw new InvalidArgumentException('price');
    return number_format((float)$value, 2, '.', '');
}
function pt_validate(array $p): array {
    $type = $p['type'] ?? null;
    if (!in_array($type, ['contact','wholesale','order'], true)) throw new InvalidArgumentException('type');
    $fields = ['type','requestId','consent','customer','comment','website'];
    pt_fields($p, array_merge($fields, $type === 'order' ? ['items','total','currency','shipping'] : ($type === 'wholesale' ? ['business'] : [])));
    $id = pt_text($p['requestId'] ?? '', 36, true);
    if (!preg_match('/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/iD', $id)) throw new InvalidArgumentException('id');
    $consent = pt_object($p['consent'] ?? null);pt_fields($consent, ['accepted','version']);
    if (($consent['accepted'] ?? false) !== true || ($p['website'] ?? '') !== '') throw new InvalidArgumentException('consent');
    $c = pt_object($p['customer'] ?? null);pt_fields($c, ['name','phone','email','city']);
    $phone = pt_text($c['phone'] ?? '',24,true);
    if (!preg_match('/^\+?[\d ()-]+$/D',$phone) || !preg_match('/^\d{10,15}$/D',preg_replace('/\D/','',$phone))) throw new InvalidArgumentException('phone');
    $email = pt_text($c['email'] ?? '',200);
    if ($email !== '' && !filter_var($email,FILTER_VALIDATE_EMAIL)) throw new InvalidArgumentException('email');
    $out = ['type'=>$type,'requestId'=>strtolower($id),'consent'=>['accepted'=>true,'version'=>pt_text($consent['version'] ?? '',40,true)],
        'customer'=>['name'=>pt_text($c['name'] ?? '',200,true),'phone'=>$phone,'email'=>$email,'city'=>pt_text($c['city'] ?? '',200,$type !== 'contact')],
        'comment'=>pt_text($p['comment'] ?? '',2000,$type === 'contact',true)];
    if ($type === 'order') {
        $items = $p['items'] ?? null;
        if (!is_array($items) || !array_is_list($items) || count($items)<1 || count($items)>100) throw new InvalidArgumentException('items');
        $out['items'] = [];
        foreach ($items as $item) {
            $item=pt_object($item);pt_fields($item,['productId','sku','title','variant','quantity','unitPrice','availability']);
            if (!is_int($item['productId'] ?? null) || $item['productId']<0 || $item['productId']>1000000 ||
                !is_int($item['quantity'] ?? null) || $item['quantity']<1 || $item['quantity']>9999) throw new InvalidArgumentException('item');
            if (!in_array($item['availability'] ?? '', ['','in_stock','on_request'],true)) throw new InvalidArgumentException('availability');
            $out['items'][]=['productId'=>$item['productId'],'sku'=>pt_text($item['sku'] ?? '',100),'title'=>pt_text($item['title'] ?? '',600,true),
                'variant'=>pt_text($item['variant'] ?? '',200),'quantity'=>$item['quantity'],'unitPrice'=>pt_price($item['unitPrice'] ?? null)];
        }
        if (($p['currency'] ?? '') !== 'RUB') throw new InvalidArgumentException('currency');
        $out['total']=pt_price($p['total'] ?? null);$out['shipping']=pt_text($p['shipping'] ?? '',300,true);
    } elseif ($type === 'wholesale') {
        $b=pt_object($p['business'] ?? null);pt_fields($b,['company','legalForm','inn','activity','volume']);
        $inn=pt_text($b['inn'] ?? '',12);
        if ($inn !== '' && !preg_match('/^\d{10}(\d{2})?$/D',$inn)) throw new InvalidArgumentException('inn');
        $out['business']=['company'=>pt_text($b['company'] ?? '',200,true),'inn'=>$inn];
        foreach (['legalForm','activity','volume'] as $field) $out['business'][$field]=pt_text($b[$field] ?? '',200);
    }
    return $out;
}
function pt_outside_root(string $path, string $root): string {
    $real=realpath($path);
    if (!$real || $real === $root || str_starts_with($real,$root.DIRECTORY_SEPARATOR)) throw new RuntimeException('private_path');
    return $real;
}
function pt_config(): array {
    $root=realpath($_SERVER['DOCUMENT_ROOT'] ?? '');if (!$root) throw new RuntimeException('root');
    $file=getenv('PT_CONFIG_FILE') ?: '';
    // Default package layout: public_html beside private; custom hosts can set PT_CONFIG_FILE.
    $default=dirname($root).'/private/mail-config.php';
    if ($file === '' && is_file($default)) $file=$default;
    $c=$file !== '' ? require pt_outside_root($file,$root) : [];
    if (!is_array($c)) throw new RuntimeException('config');
    foreach (['enabled'=>'PT_ENABLED','origin'=>'PT_ORIGIN','data_dir'=>'PT_DATA_DIR','rate_secret'=>'PT_RATE_SECRET','from'=>'PT_MAIL_FROM','transport'=>'PT_MAIL_TRANSPORT'] as $key=>$env) {
        $value=getenv($env);if ($value !== false) $c[$key]=$key === 'enabled' ? $value === '1' : $value;
    }
    $c['transport'] ??= 'mail';
    if (($c['enabled'] ?? false) !== true || !is_string($c['origin'] ?? null) ||
        !preg_match('~^(?:https://[a-z0-9.-]+|http://(?:127\.0\.0\.1|localhost))(?::\d+)?$~iD',$c['origin']) || strlen($c['rate_secret'] ?? '')<32 ||
        !is_string($c['from'] ?? null) || preg_match('/[\r\n]/',$c['from']) || !filter_var($c['from'],FILTER_VALIDATE_EMAIL) ||
        !in_array($c['transport'],['mail','smtp'],true)) throw new RuntimeException('config');
    $c['data_dir']=pt_outside_root($c['data_dir'] ?? '',$root);
    if (!is_dir($c['data_dir']) || !is_writable($c['data_dir']) || (fileperms($c['data_dir']) & 0077)) throw new RuntimeException('permissions');
    if ($c['transport'] === 'smtp') {
        $c['autoload']=pt_outside_root($c['autoload'] ?? '',$root);
        $smtp=$c['smtp'] ?? [];
        if (!is_string($smtp['host'] ?? null) || !preg_match('/^[a-z0-9.-]+$/iD',$smtp['host']) ||
            !in_array($smtp['encryption'] ?? '',['tls','ssl'],true) || !is_int($smtp['port'] ?? null) || $smtp['port']<1 || $smtp['port']>65535 ||
            !is_string($smtp['username'] ?? null) || $smtp['username']==='' || !is_string($smtp['password'] ?? null) || $smtp['password']==='') throw new RuntimeException('smtp_config');
    }
    return $c;
}
function pt_mail_content(array $p, int $now): array {
    $titles=['contact'=>'Новая заявка','wholesale'=>'Оптовая заявка','order'=>'Новый заказ'];
    $c=$p['customer'];$date=(new DateTimeImmutable('@'.$now))->setTimezone(new DateTimeZone('Europe/Moscow'))->format('d.m.Y H:i:s');
    $lines=['Правильные технологии — '.$titles[$p['type']],'Номер: '.$p['requestId'],'Дата: '.$date.' (МСК)','',
        'Имя: '.$c['name'],'Телефон: '.$c['phone'],'Email: '.($c['email'] ?: 'не указан'),'Город: '.($c['city'] ?: 'не указан'),''];
    if ($p['type'] === 'wholesale') {
        foreach (['company'=>'Компания','legalForm'=>'Форма организации','inn'=>'ИНН','activity'=>'Профиль','volume'=>'Объём закупок'] as $key=>$label) $lines[]=$label.': '.($p['business'][$key] ?: 'не указан');
    }
    if ($p['type'] === 'order') {
        $lines[]='Получение: '.$p['shipping'];$lines[]='';$lines[]='Товары:';
        foreach ($p['items'] as $i=>$item) {
            $lines[]=($i+1).'. '.$item['title'];$lines[]='Артикул: '.($item['sku'] ?: 'уточняется');
            $lines[]='Вариант: '.($item['variant'] ?: 'не указан');$lines[]='Количество: '.$item['quantity'];
            $lines[]='Цена на сайте на момент заявки: '.$item['unitPrice'].' RUB';$lines[]='';
        }
        $lines[]='Итого по данным браузера: '.$p['total'].' RUB';
        $lines[]='Цены, наличие и итог подтвердить у менеджера. Это заявка, не платёжный документ.';
    }
    $lines[]='';$lines[]='Комментарий / сообщение:';$lines[]=$p['comment'] ?: 'нет';
    $lines[]='';$lines[]='Согласие на обработку данных: принято, версия '.$p['consent']['version'];
    return ['subject'=>'[Правильные технологии] '.$titles[$p['type']],'body'=>implode("\n",$lines)];
}
function pt_send(array $c, array $p, array $message): bool {
    if ($c['transport'] === 'smtp') {
        require_once $c['autoload'];$mail=new \PHPMailer\PHPMailer\PHPMailer(true);
        $mail->isSMTP();$mail->SMTPDebug=0;$mail->Host=$c['smtp']['host'];$mail->Port=$c['smtp']['port'];$mail->SMTPAuth=true;
        $mail->Username=$c['smtp']['username'];$mail->Password=$c['smtp']['password'];$mail->SMTPSecure=$c['smtp']['encryption'];
        $mail->Timeout=10;$mail->CharSet='UTF-8';$mail->setFrom($c['from'],'Правильные технологии');$mail->addAddress(PT_RECIPIENT);
        if ($p['customer']['email'] !== '') $mail->addReplyTo($p['customer']['email']);
        $mail->Subject=$message['subject'];$mail->Body=$message['body'];$mail->isHTML(false);return $mail->send();
    }
    $headers=['From'=>$c['from'],'MIME-Version'=>'1.0','Content-Type'=>'text/plain; charset=UTF-8','Content-Transfer-Encoding'=>'base64'];
    if ($p['customer']['email'] !== '') $headers['Reply-To']=$p['customer']['email'];
    return mail(PT_RECIPIENT,mb_encode_mimeheader($message['subject'],'UTF-8','B',"\r\n"),chunk_split(base64_encode($message['body']),76,"\r\n"),$headers);
}
function pt_locked(string $file, callable $action): mixed {
    if (is_link($file)) throw new RuntimeException('storage');
    $handle=fopen($file,'c+');if (!$handle) throw new RuntimeException('storage');
    try {if (!flock($handle,LOCK_EX)) throw new RuntimeException('lock');return $action($handle);}
    finally {flock($handle,LOCK_UN);fclose($handle);}
}
function pt_read($handle): array {
    rewind($handle);$text=stream_get_contents($handle,4096);if ($text === '') return [];
    $data=json_decode($text,true,8,JSON_THROW_ON_ERROR);if (!is_array($data)) throw new RuntimeException('state');return $data;
}
function pt_write($handle, array $state): void {
    $text=json_encode($state,JSON_THROW_ON_ERROR);rewind($handle);
    if (!ftruncate($handle,0) || fwrite($handle,$text) !== strlen($text) || !fflush($handle) || !fsync($handle)) throw new RuntimeException('write');
}
function pt_handle(string $method, array $headers, string $raw, string $ip, array $c, callable $send, ?int $time=null): array {
    if ($method !== 'POST') return [405,['accepted'=>false]];
    if (($headers['origin'] ?? '') !== $c['origin']) return [403,['accepted'=>false]];
    if (!preg_match('~^application/json(?:\s*;|$)~i',$headers['content-type'] ?? '')) return [415,['accepted'=>false]];
    if (strlen($raw)>65536) return [413,['accepted'=>false]];
    if (!filter_var($ip,FILTER_VALIDATE_IP)) return [503,['accepted'=>false]];
    $now=$time ?? time();$dir=$c['data_dir'];umask(0077);
    // Count rejected attempts too; use REMOTE_ADDR only, never attacker-supplied forwarding headers.
    $ipKey=hash_hmac('sha256',$ip,$c['rate_secret']);
    $limited=pt_locked($dir.'/ip-'.$ipKey.'.json',function($h) use ($now) {
        $s=pt_read($h);if (($s['expires'] ?? 0)<=$now) $s=['expires'=>$now+900,'count'=>0];
        if (($s['count'] ?? 0)>=5) return true;$s['count']++;pt_write($h,$s);return false;
    });
    if ($limited) return [429,['accepted'=>false]];
    try {$decoded=json_decode($raw,true,16,JSON_THROW_ON_ERROR);$p=pt_validate(pt_object($decoded));}
    catch (JsonException|InvalidArgumentException) {return [422,['accepted'=>false]];}
    $key=hash_hmac('sha256',$p['requestId'],$c['rate_secret']);
    $digest=hash_hmac('sha256',json_encode($p,JSON_THROW_ON_ERROR),$c['rate_secret']);
    return pt_locked($dir.'/req-'.$key.'.json',function($h) use ($p,$digest,$c,$send,$now) {
        $s=pt_read($h);
        if (($s['expires'] ?? 0)>$now) {
            if (!hash_equals($s['digest'],$digest)) return [409,['accepted'=>false]];
            if ($s['state']==='accepted') return [200,['accepted'=>true,'requestId'=>$p['requestId'],'delivery'=>'mail_transport_accepted']];
            if ($s['state']==='pending') return [409,['accepted'=>false]]; // uncertain result: do not automatically send twice
        }
        $s=['digest'=>$digest,'state'=>'pending','expires'=>$now+86400];pt_write($h,$s);
        try {$ok=$send($c,$p,pt_mail_content($p,$now));}
        catch (Throwable) {error_log('PT_REQUEST transport_error');return [503,['accepted'=>false]];}
        $s['state']=$ok ? 'accepted' : 'failed';pt_write($h,$s);
        if (!$ok) {error_log('PT_REQUEST transport_rejected');return [503,['accepted'=>false]];}
        return [200,['accepted'=>true,'requestId'=>$p['requestId'],'delivery'=>'mail_transport_accepted']];
    });
}
function pt_main(): never {
    ini_set('display_errors','0');ini_set('log_errors','1');
    // Avoid PHP warnings leaking file names/config/customer input through host error logs.
    set_error_handler(static function(int $severity): never {throw new RuntimeException('runtime_warning');});
    $method=$_SERVER['REQUEST_METHOD'] ?? '';
    try {
        if ($method !== 'POST') {$result=[405,['accepted'=>false]];header('Allow: POST');}
        else {
            $c=pt_config();$raw=file_get_contents('php://input',false,null,0,65537);
            if ($raw === false) throw new RuntimeException('input');
            $result=pt_handle($method,['origin'=>$_SERVER['HTTP_ORIGIN'] ?? '','content-type'=>$_SERVER['CONTENT_TYPE'] ?? ''],
                $raw,$_SERVER['REMOTE_ADDR'] ?? '',$c,'pt_send');
        }
    } catch (Throwable) {error_log('PT_REQUEST unavailable');$result=[503,['accepted'=>false]];}
    restore_error_handler();http_response_code($result[0]);
    header('Content-Type: application/json; charset=utf-8');header('Cache-Control: no-store');header('X-Content-Type-Options: nosniff');
    if ($result[0]===429) header('Retry-After: 900');
    echo json_encode($result[1],JSON_UNESCAPED_UNICODE);exit;
}
if (PHP_SAPI !== 'cli') pt_main();
