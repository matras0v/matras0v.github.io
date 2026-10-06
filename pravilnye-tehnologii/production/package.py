"""Build the single production ZIP from the finished static site. No credentials/tests."""
from pathlib import Path
import hashlib, zipfile

root = Path(__file__).resolve().parents[1]
output = root / 'pravilnye-tehnologii-production-final.zip'
files = {}
frontend = ['index.html','catalog.js','shinemate-data.js','retail-search.js',
    'request-client.js','client-flows.js','storefront.js','release-polish.js','delivery-final.js',
    'brand-feedback.css','delivery-final.css','delivery-polish.css','storefront.css','mobile-final.css']
for name in frontend:
    files['public_html/'+name] = (root/name).read_bytes()
files['public_html/request-config.js'] = b"/* Public endpoint only; no credentials. */\nwindow.PT_REQUEST_ENDPOINT = '/api/request.php';\n"
for folder, extensions in [('img',{'.jpg','.jpeg','.png','.webp','.svg','.ico','.gif'}),('fonts',{'.woff','.woff2'})]:
    for path in sorted((root/folder).rglob('*')):
        if path.is_file() and path.suffix.lower() in extensions:
            if path.is_symlink() or any(part.startswith('.') for part in path.relative_to(root).parts):
                raise ValueError('Unexpected asset path')
            files['public_html/'+path.relative_to(root).as_posix()] = path.read_bytes()
mapping = {
    'public_html/api/request.php':'backend/request.php',
    'public_html/.htaccess':'production/public.htaccess',
    'public_html/img/.htaccess':'production/static.htaccess',
    'public_html/fonts/.htaccess':'production/static.htaccess',
    'private/.htaccess':'production/private.htaccess',
    'private/mail-config.example.php':'backend/config/mail.example.php',
    'private/composer.json':'backend/composer.json',
    'private/self-check.php':'production/self-check.php',
    'PRODUCTION_INSTALL.md':'PRODUCTION_INSTALL.md',
}
for target, source in mapping.items(): files[target] = (root/source).read_bytes()
manifest = ''.join(hashlib.sha256(data).hexdigest()+'  '+name+'\n' for name,data in sorted(files.items()))
files['MANIFEST.sha256'] = manifest.encode()
with zipfile.ZipFile(output,'w',zipfile.ZIP_DEFLATED,compresslevel=9) as archive:
    for name,data in sorted(files.items()):
        info=zipfile.ZipInfo(name, date_time=(2026,10,6,0,0,0))
        info.compress_type=zipfile.ZIP_DEFLATED
        info.external_attr=(0o100644 << 16)
        archive.writestr(info,data)
print(f'{output}: {len(files)} files, {output.stat().st_size:,} bytes')
