from decimal import Decimal
from pathlib import Path

from django.conf import settings
from django.core.files import File
from django.core.management.base import BaseCommand

from blog.models import Post
from products.models import Category, Product

CATEGORIES = [
    ("electronics", "Elektronika"),
    ("iphone", "iPhone"),
    ("kiyim-kechak", "Kiyim-kechak"),
    ("poyabzal", "Poyabzal"),
    ("uy-rozgor", "Uy-ro'zg'or"),
    ("gozallik", "Go'zallik"),
    ("sport", "Sport"),
    ("kitoblar", "Kitoblar"),
    ("oyinchoqlar", "O'yinchoqlar"),
    ("avtomobil", "Avtomobil"),
    ("oziq-ovqat", "Oziq-ovqat"),
]

PRODUCTS = [
    {
        "category": "electronics",
        "name": "Samsung Galaxy A55 256GB",
        "slug": "samsung-galaxy-a55-256",
        "description": "Katta AMOLED ekran, uzoq muddat ishlaydigan batareya va sifatli kamera. Kundalik foydalanish uchun ishonchli smartfon.",
        "price": "4200000.00",
        "discount_price": "3890000.00",
        "stock": 12,
        "image": 1,
    },
    {
        "category": "electronics",
        "name": "Xiaomi Redmi Note 13 Pro",
        "slug": "xiaomi-redmi-note-13-pro",
        "description": "Tez ishlaydigan protsessor, 200 MP kamera va 67W tez quvvatlash. Ish va o'yinlar uchun ajoyib tanlov.",
        "price": "3400000.00",
        "discount_price": "3190000.00",
        "stock": 18,
        "image": 2,
    },
    {
        "category": "electronics",
        "name": "AirPods Pro 2",
        "slug": "airpods-pro-2",
        "description": "Faol shovqin so'ndirish, qulay quloqchinlar va uzoq batareya. Musiqa va qo'ng'iroqlar uchun ideal.",
        "price": "2850000.00",
        "discount_price": "2690000.00",
        "stock": 8,
        "image": 3,
    },
    {
        "category": "electronics",
        "name": "Lenovo IdeaPad 15",
        "slug": "lenovo-ideapad-15",
        "description": "15.6 dyuymli ekran, 16 GB RAM va SSD disk. O'qish, ish va kundalik vazifalar uchun noutbuk.",
        "price": "8900000.00",
        "discount_price": "8490000.00",
        "stock": 5,
        "image": 4,
    },
    {
        "category": "iphone",
        "name": "iPhone 15 128GB",
        "slug": "iphone-15-128",
        "description": "A16 Bionic protsessor, Dynamic Island va 48 MP kamera. Zamonaviy iOS tajribasi.",
        "price": "12500000.00",
        "discount_price": "11990000.00",
        "stock": 6,
        "image": 5,
    },
    {
        "category": "iphone",
        "name": "iPhone 14 128GB",
        "slug": "iphone-14-128",
        "description": "Ishonchli batareya, ajoyib kamera va iOS ekotizimi. Kundalik foydalanish uchun qulay smartfon.",
        "price": "9800000.00",
        "discount_price": None,
        "stock": 4,
        "image": 6,
    },
    {
        "category": "kiyim-kechak",
        "name": "Erkaklar klassik ko'ylagi",
        "slug": "erkaklar-klassik-koylagi",
        "description": "Paxta matodan tikilgan, ofis va tantanalar uchun mos klassik ko'ylak. Turli o'lchamlar mavjud.",
        "price": "350000.00",
        "discount_price": "299000.00",
        "stock": 25,
        "image": 7,
    },
    {
        "category": "kiyim-kechak",
        "name": "Ayollar yozgi ko'ylagi",
        "slug": "ayollar-yozgi-koylagi",
        "description": "Yengil va nafas oluvchi mato, yozgi issiq kunlar uchun qulay ko'ylak. Zamonaviy dizayn.",
        "price": "450000.00",
        "discount_price": "399000.00",
        "stock": 18,
        "image": 8,
    },
    {
        "category": "kiyim-kechak",
        "name": "Sport kostyum",
        "slug": "sport-kostyum",
        "description": "Mashg'ulot va sayr uchun qulay sport kostyum. Elastik mato harakatlanishni osonlashtiradi.",
        "price": "650000.00",
        "discount_price": None,
        "stock": 14,
        "image": 9,
    },
    {
        "category": "poyabzal",
        "name": "Teri krossovka",
        "slug": "teri-krossovka",
        "description": "Tabiiy teridan tayyorlangan, kundalik kiyish uchun qulay krossovka. Yumshoq taglik.",
        "price": "780000.00",
        "discount_price": "699000.00",
        "stock": 10,
        "image": 1,
    },
    {
        "category": "poyabzal",
        "name": "Klassik erkaklar tuflisi",
        "slug": "klassik-erkaklar-tuflisi",
        "description": "Ofis va rasmiy tadbirlar uchun sifatli tufli. Chidamli material va qulay taglik.",
        "price": "950000.00",
        "discount_price": "849000.00",
        "stock": 6,
        "image": 2,
    },
    {
        "category": "uy-rozgor",
        "name": "Oshxona idishlari to'plami",
        "slug": "oshxona-idishlari-toplami",
        "description": "24 qismli, zamonaviy dizayndagi oshxona idishlari. Kundalik foydalanish uchun qulay.",
        "price": "1200000.00",
        "discount_price": "1090000.00",
        "stock": 7,
        "image": 3,
    },
    {
        "category": "uy-rozgor",
        "name": "Dizayner yoritgich lampa",
        "slug": "dizayner-yoritgich-lampa",
        "description": "Yumshoq va issiq yorug'lik beruvchi zamonaviy lampa. Yotoqxona va mehmonxona uchun mos.",
        "price": "180000.00",
        "discount_price": None,
        "stock": 30,
        "image": 4,
    },
    {
        "category": "uy-rozgor",
        "name": "Yumshoq ikki o'rinli divan",
        "slug": "yumshoq-ikki-orinli-divan",
        "description": "Sifatli mato va mustahkam karkas. Mehmonxona yoki yashash xonasi uchun qulay divan.",
        "price": "4800000.00",
        "discount_price": "4490000.00",
        "stock": 3,
        "image": 5,
    },
    {
        "category": "gozallik",
        "name": "Amber atir 100 ml",
        "slug": "amber-atir-100ml",
        "description": "Issiq va yoqimli hidli atir. Kundalik va kechki tadbirlar uchun mos.",
        "price": "520000.00",
        "discount_price": "459000.00",
        "stock": 15,
        "image": 6,
    },
    {
        "category": "gozallik",
        "name": "Yuzni parvarishlash to'plami",
        "slug": "yuzni-parvarishlash-toplami",
        "description": "Tozalash, namlash va himoya qilish uchun 4 qismli parvarish to'plami. Barcha teri turlari uchun.",
        "price": "390000.00",
        "discount_price": "349000.00",
        "stock": 22,
        "image": 7,
    },
    {
        "category": "gozallik",
        "name": "Professional soch quritgich",
        "slug": "professional-soch-quritgich",
        "description": "Kuchli havo oqimi va bir nechta rejim. Uyda salon darajasidagi soch turmagi uchun.",
        "price": "680000.00",
        "discount_price": None,
        "stock": 9,
        "image": 8,
    },
    {
        "category": "sport",
        "name": "Yoga va fitnes mati",
        "slug": "yoga-fitnes-mati",
        "description": "Siljimaydigan, qulay va yengil fitnes mati. Yoga, cho'zilish va mashqlar uchun.",
        "price": "120000.00",
        "discount_price": "99000.00",
        "stock": 40,
        "image": 9,
    },
    {
        "category": "sport",
        "name": "Shahar velosipedi 26\"",
        "slug": "shahar-velosipedi-26",
        "description": "Yengil alyuminiy ramka, 21 tezlik va ishonchli tormoz tizimi. Shahar bo'ylab sayr uchun.",
        "price": "2100000.00",
        "discount_price": "1990000.00",
        "stock": 4,
        "image": 1,
    },
    {
        "category": "sport",
        "name": "Professional futbol to'pi",
        "slug": "professional-futbol-topi",
        "description": "Chidamli material, yaxshi ushlash va aniq uchish. Mashg'ulot va o'yinlar uchun 5-o'lcham.",
        "price": "250000.00",
        "discount_price": None,
        "stock": 16,
        "image": 2,
    },
    {
        "category": "kitoblar",
        "name": "Dunyoning qisqa tarixi",
        "slug": "dunyoning-qisqa-tarixi",
        "description": "Insoniyat tarixi, fan va jamiyat rivoji haqida qiziqarli va tushunarli kitob.",
        "price": "180000.00",
        "discount_price": "159000.00",
        "stock": 25,
        "image": 3,
    },
    {
        "category": "kitoblar",
        "name": "Bolalar uchun ertaklar to'plami",
        "slug": "bolalar-uchun-ertaklar",
        "description": "Rangli rasmlar va qiziqarli ertaklar. Bolalarning tasavvurini rivojlantirish uchun.",
        "price": "95000.00",
        "discount_price": None,
        "stock": 35,
        "image": 4,
    },
    {
        "category": "oyinchoqlar",
        "name": "Rivojlantiruvchi puzl to'plami",
        "slug": "rivojlantiruvchi-puzl",
        "description": "1000 qismli puzl. Diqqat va mantiqiy fikrlashni rivojlantirish uchun qiziqarli mashg'ulot.",
        "price": "150000.00",
        "discount_price": "129000.00",
        "stock": 12,
        "image": 5,
    },
    {
        "category": "oyinchoqlar",
        "name": "Yog'och konstruktor",
        "slug": "yogoch-konstruktor",
        "description": "Xavfsiz yog'ochdan tayyorlangan konstruktor. Bolalar ijodiy o'yinlari uchun.",
        "price": "210000.00",
        "discount_price": "189000.00",
        "stock": 10,
        "image": 6,
    },
    {
        "category": "avtomobil",
        "name": "Avtomobil videoregistratori",
        "slug": "avtomobil-videoregistratori",
        "description": "Full HD yozuv, tungi rejim va keng ko'rish burchagi. Yo'lda xavfsizlik uchun.",
        "price": "850000.00",
        "discount_price": "749000.00",
        "stock": 11,
        "image": 7,
    },
    {
        "category": "avtomobil",
        "name": "Avtomobil gilamlari to'plami",
        "slug": "avtomobil-gilamlari",
        "description": "Suv o'tkazmaydigan va tozalash oson gilamlar. Ko'pchilik avtomobil modellari uchun mos.",
        "price": "420000.00",
        "discount_price": None,
        "stock": 8,
        "image": 8,
    },
    {
        "category": "oziq-ovqat",
        "name": "Tabiiy tog' asali 1 kg",
        "slug": "tabiiy-tog-asali",
        "description": "Tabiiy, qo'shimchalarsiz tog' asali. Nonushta va sog'lom ovqatlanish uchun.",
        "price": "140000.00",
        "discount_price": "125000.00",
        "stock": 30,
        "image": 9,
    },
    {
        "category": "oziq-ovqat",
        "name": "Quruq mevalar to'plami",
        "slug": "quruq-mevalar-toplami",
        "description": "O'rik, mayiz, yong'oq va boshqa tabiiy quruq mevalar. Sog'lom gazak uchun ideal.",
        "price": "220000.00",
        "discount_price": None,
        "stock": 20,
        "image": 1,
    },
]

IMAGE_BY_SLUG = {
    "samsung-galaxy-a55-256": "category-phone.jpg",
    "xiaomi-redmi-note-13-pro": "category-phone.jpg",
    "airpods-pro-2": "category-earbuds.jpg",
    "lenovo-ideapad-15": "category-laptop.jpg",
    "iphone-15-128": "category-phone.jpg",
    "iphone-14-128": "category-phone.jpg",
    "erkaklar-klassik-koylagi": "carousel-1.jpg",
    "ayollar-yozgi-koylagi": "product-7.jpg",
    "sport-kostyum": "product-2.jpg",
    "teri-krossovka": "product-4.jpg",
    "klassik-erkaklar-tuflisi": "cat-3.jpg",
    "oshxona-idishlari-toplami": "category-dish.jpg",
    "dizayner-yoritgich-lampa": "product-3.jpg",
    "yumshoq-ikki-orinli-divan": "category-sofa.jpg",
    "amber-atir-100ml": "cat-4.jpg",
    "yuzni-parvarishlash-toplami": "product-8.jpg",
    "professional-soch-quritgich": "cat-4.jpg",
    "yoga-fitnes-mati": "category-sport.jpg",
    "shahar-velosipedi-26": "category-sport.jpg",
    "professional-futbol-topi": "category-sport.jpg",
    "dunyoning-qisqa-tarixi": "category-books.jpg",
    "bolalar-uchun-ertaklar": "category-books.jpg",
    "rivojlantiruvchi-puzl": "carousel-3.jpg",
    "yogoch-konstruktor": "carousel-3.jpg",
    "avtomobil-videoregistratori": "category-auto.jpg",
    "avtomobil-gilamlari": "category-auto.jpg",
    "tabiiy-tog-asali": "category-food.jpg",
    "quruq-mevalar-toplami": "category-food.jpg",
}

POSTS = [
    (
        "Onlayn xarid qilishda 5 ta muhim maslahat",
        "Onlayn xarid qilishda mahsulot tavsifini diqqat bilan o'qing, sotuvchi reytingini tekshiring, yetkazib berish shartlari va qaytarish siyosati bilan tanishing. To'lovdan oldin savatdagi jami summani tekshiring. Savollaringiz bo'lsa, sotuvchi bilan oldindan bog'laning.",
    ),
    (
        "Yangi mavsum kolleksiyasi: nimalar trendda?",
        "Bu mavsumda qulaylik va minimalizm uyg'unlashgan uslublar mashhur. Neytral ranglar, tabiiy matolar va ko'p qatlamli kiyimlar kundalik garderobning asosiy qismiga aylanmoqda. O'zingizga mos va qulay kiyimni tanlashni unutmang.",
    ),
    (
        "Smartfon tanlashda nimaga e'tibor berish kerak?",
        "Smartfon tanlashda batareya sig'imi, kamera sifati, xotira hajmi va protsessor unumdorligiga e'tibor bering. Kundalik foydalanish uchun 8 GB RAM va 128 GB xotira ko'pchilik ehtiyojlarga yetadi. Byudjetingizni oldindan belgilang.",
    ),
    (
        "Uy uchun qulaylik yaratuvchi 7 ta mahsulot",
        "Uy sharoitini yaxshilash uchun yoritish, saqlash qutilari, qulay oshxona jihozlari va tozalash vositalaridan foydalanish mumkin. Kichik o'zgarishlar ham kundalik hayotni ancha qulay qiladi. Xarid qilishda ehtiyojdan kelib chiqing.",
    ),
    (
        "Sport va sog'lom turmush tarzi",
        "Muntazam jismoniy mashqlar kayfiyat va salomatlikni yaxshilaydi. Yangi boshlovchilar uchun yengil yugurish, yoga yoki uyda bajariladigan mashqlar mos. Mashg'ulotdan oldin isinish va suv ichishni unutmang.",
    ),
    (
        "Bolalar uchun xavfsiz o'yinchoqlar",
        "O'yinchoq tanlashda yoshga mosligi, materialining xavfsizligi va sertifikatlar mavjudligiga e'tibor bering. Kichik qismlari bo'lgan o'yinchoqlar kichik yoshdagi bolalar uchun xavfli bo'lishi mumkin. O'yinchoqni bolaning qiziqishiga qarab tanlang.",
    ),
    (
        "To'lov va yetkazib berish haqida",
        "Buyurtma berishda yetkazib berish manzilini to'g'ri kiriting. To'lov usulini tanlang va buyurtma raqamini saqlab qo'ying. Operator tasdiqlash uchun siz bilan bog'lanadi. Savollar bo'lsa, bog'lanish sahifasi orqali yozing.",
    ),
    (
        "Kitob o'qish odatini qanday shakllantirish mumkin?",
        "Har kuni 20 daqiqa o'qishdan boshlang. Qiziqarli mavzudagi kitoblarni tanlang va o'qish uchun qulay joy yarating. Maqsadni kichik qadamlarga bo'lib, natijani kuzatib boring. Doimiylik eng muhim omildir.",
    ),
]


class Command(BaseCommand):
    help = "Demo kategoriyalar, mahsulotlar va blog postlarini qo'shadi."

    def add_arguments(self, parser):
        parser.add_argument(
            "--skip-images",
            action="store_true",
            help="Mahsulot rasmlarini media papkasiga ko'chirmaslik.",
        )
        parser.add_argument(
            "--refresh-images",
            action="store_true",
            help="Demo mahsulotlarning mavjud rasmlarini qayta yuklash.",
        )

    def handle(self, *args, **options):
        categories = {}
        for slug, name in CATEGORIES:
            category, created = Category.objects.update_or_create(
                slug=slug,
                defaults={"name": name},
            )
            categories[slug] = category
            if created:
                self.stdout.write(f"Kategoriya qo'shildi: {name}")

        static_image_dir = Path(settings.BASE_DIR, "static", "img")
        static_images = sorted(static_image_dir.glob("product-*.jpg"))

        created_products = 0
        updated_images = 0
        for data in PRODUCTS:
            defaults = {
                "category": categories[data["category"]],
                "name": data["name"],
                "description": data["description"],
                "price": Decimal(data["price"]),
                "discount_price": (
                    Decimal(data["discount_price"])
                    if data["discount_price"]
                    else None
                ),
                "stock": data["stock"],
            }
            product, created = Product.objects.get_or_create(
                slug=data["slug"],
                defaults=defaults,
            )
            if created:
                created_products += 1

            if not options["skip_images"]:
                image_exists = (
                    product.image
                    and product.image.storage.exists(product.image.name)
                )
                if (
                    image_exists
                    and options["refresh_images"]
                    and product.image
                ):
                    product.image.delete(save=False)
                    image_exists = False

                if not image_exists:
                    image_filename = IMAGE_BY_SLUG.get(data["slug"])
                    if image_filename:
                        source = static_image_dir / image_filename
                    elif static_images:
                        source = static_images[
                            (data["image"] - 1) % len(static_images)
                        ]
                    else:
                        source = None

                    if source and source.exists():
                        with source.open("rb") as image_file:
                            product.image.save(
                                f"seed-{product.slug}.jpg",
                                File(image_file),
                                save=True,
                            )
                        updated_images += 1

        # Old demo rows created before the seeded catalogue may not have an
        # image yet. Fill only those known legacy demo slugs, never arbitrary
        # products that an administrator may have added without an image.
        legacy_images = {
            "electronics": "product-5.jpg",
            "samsung-a55": "category-phone.jpg",
            "iphone-15-pro": "category-phone.jpg",
        }
        if not options["skip_images"]:
            for product in Product.objects.filter(
                slug__in=legacy_images,
            ):
                if product.image and not options["refresh_images"]:
                    continue
                if product.image and options["refresh_images"]:
                    product.image.delete(save=False)

                source = static_image_dir / legacy_images[product.slug]
                if not source.exists():
                    continue
                with source.open("rb") as image_file:
                    product.image.save(
                        f"seed-{product.slug}.jpg",
                        File(image_file),
                        save=True,
                    )
                updated_images += 1

        created_posts = 0
        for title, content in POSTS:
            _, created = Post.objects.get_or_create(
                title=title,
                defaults={"content": content},
            )
            if created:
                created_posts += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Demo ma'lumotlar tayyor: "
                f"{created_products} yangi mahsulot, "
                f"{updated_images} rasm, "
                f"{created_posts} yangi blog post."
            )
        )
