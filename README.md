# MultiShop — Django onlayn do'kon

MultiShop — Django asosidagi onlayn do'kon. Loyiha bosh sahifa, mahsulotlar
katalogi, qidiruv/filtrlash, savat, buyurtma berish, autentifikatsiya, blog va
bog'lanish sahifalarini o'z ichiga oladi.

## Asosiy imkoniyatlar

- Mahsulotlar va kategoriyalar bazadan olinadi (hardcoded kartochkalar yo'q).
- Qidiruv, kategoriya, narx oralig'i, ombordagi mavjudlik, chegirma va saralash bo'yicha filtrlash.
- Sahifalash (pagination).
- 11 ta kategoriya, 20+ demo mahsulot va 8 ta blog post uchun `seed_demo` buyrug'i.
- Session'ga asoslangan savat; miqdorni oshirish/kamaytirish va o'chirish.
- Savat va buyurtma amallari faqat `POST` + CSRF orqali ishlaydi.
- Ombordagi qoldiq (`stock`) tekshiriladi va buyurtma vaqtida kamaytiriladi.
- `Order` / `OrderItem` modellari va buyurtma muvaffaqiyati sahifasi.
- Ro'yxatdan o'tish, kirish va chiqish.
- Blog ro'yxati va batafsil sahifasi.
- Bog'lanish formasi: xabar bazaga saqlanadi va Gmail SMTP orqali yuboriladi.
- Maxfiy admin manzili; admin panelga faqat superuser kira oladi.
- Telefon va planshetlarga moslashgan Bootstrap layout.

## Texnologiyalar

- Python 3.13
- Django 6.1
- SQLite (development) yoki PostgreSQL (`DATABASE_URL` orqali)
- WhiteNoise (static fayllar)
- Bootstrap 4, jQuery, Owl Carousel

## Lokal ishga tushirish (Windows PowerShell)

```powershell
cd C:\laragon\www\django-web-site-master

# Virtual muhit (ixtiyoriy, lekin tavsiya etiladi)
py -m venv .venv
.\.venv\Scripts\Activate.ps1

pip install -r requirements.txt
python manage.py migrate
python manage.py seed_demo
python manage.py createsuperuser
python manage.py runserver
```

Sayt: <http://127.0.0.1:8000/>
Admin: <http://127.0.0.1:8000/boshqaruv-7f3c9a/> (default)

`ADMIN_URL` environment variable orqali admin manzilini o'zgartirish mumkin.
Productionda `admin` yoki boshqa taxmin qilinadigan so'z ishlatmang.

Lokal rejimda `DEBUG` avtomatik `True` bo'ladi va static fayllar Django
tomonidan beriladi. Shuning uchun qo'shimcha environment variable shart emas.

## Environment variables

`env.example` — namuna. Loyiha `.env` faylini avtomatik o'qimaydi; qiymatlarni
shell, Render dashboard yoki boshqa hosting panelida environment variable
sifatida bering.

| Variable | Maqsad | Default |
| --- | --- | --- |
| `DJANGO_ENV` | `development` yoki `production` | Render'da `production`, aks holda `development` |
| `DEBUG` | Debug rejimi | `development`da `True`, `production`da `False` |
| `SECRET_KEY` | Django secret key | Lokal uchun xavfsiz bo'lmagan kalit |
| `ALLOWED_HOSTS` | Ruxsat berilgan hostlar (vergul bilan) | `localhost,127.0.0.1,testserver,.onrender.com` |
| `CSRF_TRUSTED_ORIGINS` | Ishonchli originlar | Lokal va `*.onrender.com` |
| `DATABASE_URL` | PostgreSQL ulanish manzili | SQLite |
| `ADMIN_URL` | Maxfiy admin yo'li | `boshqaruv-7f3c9a/` |
| `SHIPPING_COST` | Yetkazib berish narxi | `15000` |
| `CONTACT_EMAIL` | Bog'lanish formasi qabul qiluvchisi | `behruzjalolov13@gmail.com` |
| `DEFAULT_FROM_EMAIL` | Yuboruvchi manzil | `MultiShop <behruzjalolov13@gmail.com>` |
| `EMAIL_HOST` | SMTP server | `smtp.gmail.com` |
| `EMAIL_PORT` | SMTP port | `587` |
| `EMAIL_HOST_USER` | SMTP foydalanuvchisi | `behruzjalolov13@gmail.com` |
| `EMAIL_HOST_PASSWORD` | Gmail App Password | Bo'sh (console backend) |
| `EMAIL_USE_TLS` | TLS | `True` |
| `SECURE_SSL_REDIRECT` | HTTP → HTTPS | `False` |
| `SESSION_COOKIE_SECURE` | Cookie faqat HTTPS | `False` |
| `CSRF_COOKIE_SECURE` | CSRF cookie faqat HTTPS | `False` |
| `SECURE_HSTS_SECONDS` | HSTS muddati | `0` |

Production'da kamida quyidagilarni o'rnating:

```text
DJANGO_ENV=production
DEBUG=False
SECRET_KEY=<uzun-tasodifiy-kalit>
ALLOWED_HOSTS=your-domain.com,.onrender.com
CSRF_TRUSTED_ORIGINS=https://your-domain.com,https://*.onrender.com
ADMIN_URL=<uzun-tasodifiy-maxfiy-yol>/
SECURE_SSL_REDIRECT=True
SESSION_COOKIE_SECURE=True
CSRF_COOKIE_SECURE=True
SECURE_HSTS_SECONDS=31536000

# Gmail orqali bog'lanish xabarlarini olish
CONTACT_EMAIL=behruzjalolov13@gmail.com
EMAIL_HOST_PASSWORD=<google-app-password>
```

`DEBUG=False` bo'lganda xavfsiz bo'lmagan default `SECRET_KEY` ishlatilsa yoki
`ADMIN_URL` berilmasa, loyiha `ImproperlyConfigured` bilan ataylab to'xtaydi.
Admin panelga faqat `is_superuser=True` bo'lgan foydalanuvchi kira oladi;
oddiy staff akkauntlar ham bloklanadi.

### Gmail App Password olish

1. Google akkauntda 2 bosqichli autentifikatsiyani yoqing.
2. Google Account → Security → App passwords bo'limiga o'ting.
3. Yangi app password yarating va uni `EMAIL_HOST_PASSWORD` sifatida bering.
4. `EMAIL_HOST_USER` va `CONTACT_EMAIL` — `behruzjalolov13@gmail.com`.

Oddiy Gmail parolini ishlatmang. App password bo'lmasa loyiha local rejimda
emailni console'ga chiqaradi, lekin har bir xabar `ContactMessage` sifatida
bazaga saqlanadi va admin panelda ko'rinadi.

## Render'ga deploy qilish

Build command:

```bash
pip install -r requirements.txt && python manage.py collectstatic --noinput && python manage.py migrate && python manage.py seed_demo
```

Start command:

```bash
gunicorn config.wsgi:application
```

Static fayllar WhiteNoise orqali beriladi. `DEBUG=False`da manifest static
storage ishlatiladi, shuning uchun `collectstatic` majburiy.

`seed_demo` idempotent: mavjud mahsulot yoki postni takrorlamaydi. Demo
ma'lumotlar kerak bo'lmasa, buyruqni build command'dan olib tashlang.

### Media fayllar haqida muhim eslatma

Render'ning oddiy fayl tizimi ephemeral — qayta deployda yuklangan rasmlar
yo'qolishi mumkin. Loyihada kichik saytlar uchun media'ni Django orqali berish
fallback'i bor, lekin production uchun S3, Cloudinary yoki persistent disk
ishlatish tavsiya etiladi. `MEDIA_ROOT`/storage'ni almashtirish uchun
`STORAGES` sozlamasini moslashtiring.

## Testlar

```powershell
python manage.py test
```

Testlar model narxlarini, savatning bo'sh holatini, `POST` talablarini,
stock cheklovlarini, buyurtma yaratishni, filtrlarni, autentifikatsiyani,
maxfiy admin manzilini, contact xabarlarini va sahifalashni tekshiradi.

## Asosiy URL'lar

| URL | Vazifa |
| --- | --- |
| `/` | Bosh sahifa |
| `/shop/` | Mahsulotlar katalogi |
| `/shop/<slug>/` | Mahsulot tafsiloti |
| `/shop/cart/` | Savat |
| `/shop/checkout/` | Buyurtma berish |
| `/shop/order/<uuid>/` | Buyurtma tasdiqlanishi |
| `/accounts/login/` | Kirish |
| `/accounts/register/` | Ro'yxatdan o'tish |
| `/blog/` | Blog |
| `/contact/` | Bog'lanish |
| `/<ADMIN_URL>/` | Maxfiy Django admin (faqat superuser) |

## Ma'lum cheklovlar

- Onlayn to'lov gateway'i yo'q; to'lov yetkazib berishda yoki bank
  o'tkazmasi sifatida tanlanadi.
- SMS/telefon tasdiqlash va kuryer tracking'i yo'q.
- Mahsulot sharhlari, wishlist va kupon tizimi hali qo'shilmagan.
- Blog oddiy darajada: postlar ro'yxati va batafsil sahifasi bor.
- Email development'da console'ga chiqadi; productionda Gmail App Password
  bering. App password bo'lmasa ham xabar bazaga saqlanadi.
- `db.comment.db` — eski qoralama matn fayli, ma'lumotlar bazasi emas va
  loyiha ishida ishlatilmaydi.
- Media fayllar Render'ning ephemeral diskida saqlanadi; doimiy storage uchun
  S3/Cloudinary kerak.

## Xavfsizlik bo'yicha qisqa nazorat ro'yxati

- [x] `POST` + CSRF savat va buyurtma amallarida.
- [x] Ombordagi miqdor va mahsulot mavjudligini tekshirish.
- [x] Buyurtma yaratishda `transaction.atomic` va `select_for_update`.
- [x] Xavfsiz default'lar va productionda `SECRET_KEY` majburiyligi.
- [x] `ALLOWED_HOSTS`, `CSRF_TRUSTED_ORIGINS`, secure cookie va HSTS sozlamalari.
- [x] `/admin/` yopilgan; maxfiy `ADMIN_URL` va faqat superuser ruxsati.
- [x] Contact xabarlari bazada zaxiralanadi.
- [ ] Real to'lov integratsiyasi (kelajakdagi ish).
- [ ] Media uchun doimiy storage (production).
