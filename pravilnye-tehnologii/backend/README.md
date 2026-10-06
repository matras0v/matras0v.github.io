# Заявки — передача на PHP-хостинг

GitHub Pages остаётся статическим preview: `request-config.js` содержит пустой endpoint,
все три формы готовят письмо, отправки не обещают. CSS/hero/каталог не меняются.

Готовый единый ZIP собирается `python3 production/package.py`; используйте `PRODUCTION_INSTALL.md`.
В ZIP endpoint уже настроен, config автоматически ищется в соседней private/mail-config.php.
Ниже — эквивалентная ручная установка.

## Загрузка

1. Загрузить существующий frontend целиком, включая обновлённые `index.html`,
   `request-client.js`, `client-flows.js`, `request-config.js`.
2. Скопировать **только** `backend/request.php` в публичный `/api/request.php`.
   PHP >=8.2, mbstring, HTTPS (HTTP разрешён только для localhost/127.0.0.1 в тестах). Не загружать backend/tests, config, README и composer в web root.
   Endpoint расположен в корне домена даже если frontend в подкаталоге.
3. Создать вне document root приватный каталог метаданных с правами 0700,
   доступный PHP-процессу. Заполнить копию `config/mail.example.php` вне web root/Git,
   права 0600, и настроить серверную переменную `PT_CONFIG_FILE` с абсолютным путём.
   Не помещать реальные credentials в проект, JS, Git или публичную папку.
4. Указать точный production HTTPS `origin` без `/` (IDN — punycode),
   авторизованный хостингом `from`, случайный `rate_secret` (генератор в шаблоне),
   `enabled=true`. Получатель неизменяемый: **iq_technologii@mail.ru**.
5. При настроенном MTA выбрать `transport=mail`. Никакого автоматического переключения
   после ошибки SMTP нет. Для SMTP: в приватной папке выполнить `composer install --no-dev`
   с `backend/composer.json`, указать внешний `vendor/autoload.php`, сервер/логин/пароль,
   порт и tls/ssl в приватном config; выбрать smtp. Проверка TLS остаётся включена.
   [PHPMailer](https://github.com/PHPMailer/PHPMailer) устанавливается серверно, не в frontend.
6. **Только на production** выставить в `request-config.js`:
   `window.PT_REQUEST_ENDPOINT = '/api/request.php';`.
   Preview в GitHub остаётся с пустым значением; клиент дополнительно отключает его на github.io.
7. Проверить одну контактную заявку (`#/contacts` → «Отправить заявку»), одну оптовую,
   один заказ. Владелец проверяет Inbox/Spam iq_technologii@mail.ru, читаемые русские тексты,
   состав/варианты/количество, Reply-To. Настроить SPF/DKIM/DMARC с хостингом.

## Контракт и ограничения

POST JSON, same-origin credentials; только contact/wholesale/order. Используются текущие
вложенные структуры customer/business/items. contact: customer name/phone, optional email/city,
comment=сообщение; wholesale: business company; order: productId/sku/title/variant/quantity/unitPrice,
total/currency RUB/shipping. requestId UUID v4, consent accepted=true + version, website пустой.
Неизвестные поля (включая recipient/to/path), загрузки и произвольные цены-строки отвергаются.
Максимум body 64KiB, 100 строк заказа, количество 1–9999, имя 200, комментарий 2000 символов.
Цены — только показанные браузером данные для менеджера, не финансовая запись.

200 `{accepted:true, requestId, delivery:"mail_transport_accepted"}` означает, что транспорт
принял письмо. [PHP mail() не подтверждает получение в ящике](https://www.php.net/manual/en/function.mail.php).
UI прямо сообщает эту границу. Невалидные данные 422, GET 405, origin 403, media 415,
большой body 413, лимит 429 (Retry-After 900), конфликт/неопределённый повтор 409, недоступность 503.
Неудача не очищает корзину. Подтверждённый заказ удаляет только отправленное количество по productId.
Двойной submit блокируется; форма после принятия отключается; reload сам ничего не отправляет.

5 попыток на IP за 15 минут, включая невалидный JSON; доверяем только REMOTE_ADDR,
не X-Forwarded-For. При reverse proxy настроить реальный REMOTE_ADDR в webserver для доверенного proxy.
Origin — защита от браузерных cross-site запросов, не замена антиспаму. CORS-заголовков нет.
Для однохостового PHP используется flock; хостингу нужны writable local filesystem и fsync.
Распределённый/shared multi-server hosting требует общего согласованного limiter.

Файлы содержат **только** keyed HMAC IP/requestId/payload, счётчик/TTL/статус — без текстов заявок,
имён, телефонов/email, raw IP. Лимит действует 15 минут, dedupe 24 часа. Pending после обрыва/ошибки
транспорта остаётся неопределённым и не пересылается автоматически: проверьте ящик, свяжитесь
с клиентом по согласованному каналу. Это не очередь; потеря metadata/смена secret снимает dedupe.
Для удаления просроченных metadata используйте maintenance: временно disabled endpoint, дождитесь
завершения активных запросов, удалите файлы с expires < now. Не unlink активно используемые lock-файлы.
Серверные логи — только общие коды ошибок; не включать SMTPDebug, request-body/access-body logging.
За пределами root находятся config, vendor, metadata и PHP error log. Отключить directory listing
в панели хостинга; `.htaccess` backend блокирует доступ к пакету в Apache, но не заменяет размещение
секретов вне root и конфигурацию nginx.

Проверки без реальной почты: `php backend/tests/request-test.php`,
`python3 backend/tests/http-test.py`, `node backend/tests/client-test.cjs`.
HTTP-тест использует локальный fake MTA; не считать его реальной доставкой.
Проект статический: отдельной frontend сборки нет, выполняется проверка синтаксиса JS.
