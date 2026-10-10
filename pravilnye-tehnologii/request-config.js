/* PUBLIC URL only. No SMTP/password/API secret here.
 * Static Pages: configure the deployed owner's HTTPS backend /api/request.php.
 * Same-origin PHP production package uses /api/request.php.
 * Backend must allow the exact site Origin and store customer records in the approved region.
 * Until deployed and tested this stays blank: the UI must not claim submission. */
window.PT_REQUEST_ENDPOINT = '';
