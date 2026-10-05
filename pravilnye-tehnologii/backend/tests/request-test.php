<?php
declare(strict_types=1);
require dirname(__DIR__).'/request.php';
function check(bool $condition, string $label): void {if (!$condition) throw new RuntimeException($label);}
function payload(string $type='contact'): array {
    $p=['type'=>$type,'requestId'=>'11111111-1111-4111-8111-111111111111','website'=>'','consent'=>['accepted'=>true,'version'=>'2026-10-03'],
        'customer'=>['name'=>'QA Test','phone'=>'+7 900 000-00-00','email'=>'qa@example.invalid','city'=>'Ростов-на-Дону'],'comment'=>'Тестовая заявка <script>alert(1)</script>'];
    if ($type==='wholesale') $p['business']=['company'=>'QA studio','legalForm'=>'ООО','inn'=>'6165176208','activity'=>'Детейлинг','volume'=>'до 50000'];
    if ($type==='order') {$p['items']=[['productId'=>1,'sku'=>'405001','title'=>'Fine Cut','variant'=>'1 л','quantity'=>3,'unitPrice'=>4520,'availability'=>'in_stock']];$p['total']=13560;$p['currency']='RUB';$p['shipping']='Самовывоз';}
    return $p;
}
$dir=sys_get_temp_dir().'/pt-unit-'.bin2hex(random_bytes(8));mkdir($dir,0700);
$c=['origin'=>'https://production.example','data_dir'=>$dir,'rate_secret'=>bin2hex(random_bytes(32))];
$headers=['origin'=>$c['origin'],'content-type'=>'application/json'];$calls=0;$messages=[];
$send=function($c,$p,$m) use (&$calls,&$messages) {$calls++;$messages[]=$m;return true;};
function run_request(array|string $p, string $ip='192.0.2.1', string $method='POST', ?array $h=null, ?callable $sender=null, int $time=1000): array {
    global $headers,$c,$send;return pt_handle($method,$h ?? $headers,is_array($p)?json_encode($p):$p,$ip,$c,$sender ?? $send,$time);
}
try {
    check(run_request(payload(),method:'GET')[0]===405,'GET');
    check(run_request('{',ip:'192.0.2.2')[0]===422,'JSON');
    check(run_request(payload(),h:['origin'=>'https://evil.example','content-type'=>'application/json'])[0]===403,'origin');
    check(run_request(payload(),h:['origin'=>$c['origin'],'content-type'=>'multipart/form-data'])[0]===415,'upload');
    $cases=[];
    foreach (['name','phone'] as $field) {$p=payload();unset($p['customer'][$field]);$cases[]=$p;}
    $p=payload();$p['customer']['email']='bad';$cases[]=$p;
    $p=payload();$p['customer']['email']="qa@example.invalid\r\nBcc: evil@example.invalid";$cases[]=$p;
    $p=payload();$p['customer']['name']="Test\nBcc: evil";$cases[]=$p;
    $p=payload();$p['website']='bot';$cases[]=$p;
    $p=payload();$p['consent']['accepted']=false;$cases[]=$p;
    foreach (['recipient','to','destination_email','path','command'] as $field) {$p=payload();$p[$field]='evil';$cases[]=$p;}
    $p=payload();$p['customer']['name']=str_repeat('а',201);$cases[]=$p;
    $p=payload();$p['comment']=str_repeat('x',2001);$cases[]=$p;
    $p=payload();$p['type']='unknown';$cases[]=$p;
    foreach ([0,-1,1.5,10000,'1'] as $qty) {$p=payload('order');$p['items'][0]['quantity']=$qty;$cases[]=$p;}
    foreach ([-1,true,'NaN','1e20',INF] as $price) {$p=payload('order');$p['items'][0]['unitPrice']=$price;$cases[]=$p;}
    $p=payload('order');$p['items']=array_fill(0,101,$p['items'][0]);$cases[]=$p;
    foreach ($cases as $i=>$p) {try{pt_validate($p);throw new RuntimeException('accepted invalid '.$i);}catch(InvalidArgumentException){}}
    check($calls===0,'invalid cases never send');
    foreach (['contact','wholesale','order'] as $i=>$type) {
        $p=payload($type);$p['requestId']=sprintf('%08d-1111-4111-8111-111111111111',$i+1);
        $r=run_request($p,ip:'192.0.2.'.($i+10));check($r[0]===200 && $r[1]['delivery']==='mail_transport_accepted','valid '.$type);
        check(run_request($p,ip:'192.0.2.'.($i+20))[0]===200,'cross-IP duplicate cached');
    }
    check($calls===3,'only one mail per ID');check(str_contains($messages[2]['body'],'Артикул: 405001'),'readable order');
    check(str_contains($messages[2]['body'],'13560.00'),'displayed total');check(str_contains($messages[0]['body'],'<script>'),'HTML plain text');
    $p=payload('order');$p['requestId']='00000003-1111-4111-8111-111111111111';$p['total']=1;check(run_request($p,ip:'192.0.2.30')[0]===409,'ID content conflict');
    $p=payload();$p['requestId']='99999999-1111-4111-8111-111111111111';
    for ($i=0;$i<5;$i++) check(run_request('{',ip:'192.0.2.40')[0]===422,'reject counted');
    check(run_request($p,ip:'192.0.2.40')[0]===429,'rate limit');check(run_request($p,ip:'192.0.2.40',time:1901)[0]===200,'window reset');
    $p['requestId']='88888888-1111-4111-8111-111111111111';check(run_request($p,ip:'192.0.2.50',sender:fn()=>false)[0]===503,'mail failure');
    check(run_request($p,ip:'192.0.2.50')[0]===200,'known failure retry');
    $p['requestId']='77777777-1111-4111-8111-111111111111';check(run_request($p,ip:'192.0.2.51',sender:fn()=>throw new RuntimeException('transport'))[0]===503,'uncertain');
    check(run_request($p,ip:'192.0.2.51')[0]===409,'uncertain no duplicate');
    check(run_request(str_repeat('x',65537))[0]===413,'body size');
    foreach (glob($dir.'/*') as $file) {check(!str_contains(file_get_contents($file),'QA Test'),'no PII metadata');check((fileperms($file)&0077)===0,'private files');}
    echo 'PASS: A–M validation, types, rate window, deduplication, transport failure, content, storage privacy'.PHP_EOL;
} finally {foreach(glob($dir.'/*') as $file) unlink($file);rmdir($dir);}
