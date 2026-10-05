"""Local HTTP + PHP mail() integration via fake MTA. Sends no real mail."""
import contextlib, email, json, os, pathlib, shutil, socket, subprocess, sys, tempfile, time, urllib.request, urllib.error, uuid
project = pathlib.Path(__file__).resolve().parents[2]
@contextlib.contextmanager
def server():
    with tempfile.TemporaryDirectory(prefix='pt-http-') as temp:
        base=pathlib.Path(temp);root=base/'public';root.mkdir();state=base/'state';state.mkdir(mode=0o700)
        (root/'api').mkdir();shutil.copy2(project/'backend/request.php',root/'api/request.php')
        for path in project.iterdir():
            if path.name in ('backend','request-config.js') or path.name.startswith('.') or path.suffix=='.md':continue
            (root/path.name).symlink_to(path)
        (root/'request-config.js').write_text("window.PT_REQUEST_ENDPOINT = '/api/request.php';")
        mailfile=base/'mail.eml';reject=base/'reject';mta=base/'fake-mta'
        mta.write_text('#!'+sys.executable+'\nimport sys,pathlib\ndata=sys.stdin.buffer.read()\nif pathlib.Path('+repr(str(reject))+').exists():sys.exit(1)\npathlib.Path('+repr(str(mailfile))+').write_bytes(data)\n')
        mta.chmod(0o700)
        with socket.socket() as sock:sock.bind(('127.0.0.1',0));port=sock.getsockname()[1]
        origin=f'http://127.0.0.1:{port}'
        env=os.environ.copy();env.update(PT_ENABLED='1',PT_ORIGIN=origin,PT_DATA_DIR=str(state),PT_RATE_SECRET=os.urandom(32).hex(),PT_MAIL_FROM='website@qptech.ru',PT_MAIL_TRANSPORT='mail',PT_CONFIG_FILE='')
        log=(base/'server.log').open('w+')
        process=subprocess.Popen(['php','-d','sendmail_path='+str(mta),'-d','display_errors=0','-S',f'127.0.0.1:{port}','-t',str(root)],env=env,stdout=log,stderr=log)
        try:
            for _ in range(100):
                if process.poll() is not None:raise RuntimeError('PHP server failed')
                try:urllib.request.urlopen(origin,timeout=.1);break
                except (OSError,urllib.error.HTTPError):time.sleep(.05)
            else:raise RuntimeError('PHP startup timeout')
            yield origin,mailfile,reject,state
        finally:process.terminate();process.wait(timeout=5);log.close()
def request(origin,payload,method='POST',content='application/json',origin_header=None):
    raw=json.dumps(payload).encode() if isinstance(payload,dict) else payload.encode()
    req=urllib.request.Request(origin+'/api/request.php',data=raw if method=='POST' else None,method=method,headers={'Origin':origin_header or origin,'Content-Type':content})
    try:r=urllib.request.urlopen(req,timeout=5)
    except urllib.error.HTTPError as e:r=e
    data=r.read();assert r.headers['Content-Type'].startswith('application/json');assert b'Warning' not in data
    return r.status,json.loads(data),r.headers

def payload(kind):
    p={'type':kind,'requestId':str(uuid.uuid4()),'customer':{'name':'QA Test','phone':'+7 900 000-00-00','email':'qa@example.invalid','city':'Ростов-на-Дону'},'comment':'Тестовая заявка','website':'','consent':{'accepted':True,'version':'2026-10-03'}}
    if kind=='wholesale':p['business']={'company':'QA studio'}
    if kind=='order':p.update(items=[{'productId':1,'sku':'405001','title':'Fine Cut','variant':'1 л','quantity':3,'unitPrice':4520}],total=13560,currency='RUB',shipping='Самовывоз')
    return p
if __name__=='__main__':
    with server() as (origin,mailfile,reject,state):
        if '--serve' in sys.argv:
            print('QA_SERVER='+origin,flush=True)
            try:
                while True:time.sleep(1)
            except KeyboardInterrupt:pass
        else:
            assert request(origin,'',method='GET')[0]==405
            assert request(origin,'{',origin_header='https://evil.example')[0]==403
            assert request(origin,'{')[0]==422
            for kind in ('contact','wholesale','order'):
                p=payload(kind);r=request(origin,p);assert r[0]==200 and r[1]['requestId']==p['requestId'] and r[1]['delivery']=='mail_transport_accepted'
                msg=email.message_from_bytes(mailfile.read_bytes());assert msg['To']=='zakaz@qptech.ru';assert msg['Reply-To']=='qa@example.invalid';assert 'Тестовая заявка' in msg.get_payload(decode=True).decode('utf-8')
                if kind=='order':assert 'Артикул: 405001' in msg.get_payload(decode=True).decode('utf-8')
            assert request(origin,payload('contact')|{'recipient':'evil@example.invalid'})[0]==422
            r=request(origin,payload('contact'));assert r[0]==429 and r[2]['Retry-After']=='900'
            for path in state.iterdir():assert 'QA Test' not in path.read_text()
            print('PASS: real HTTP status/JSON/origin/rate-limit, three PHP mail() handoffs to fake MTA, fixed To and Reply-To; no real email sent')
