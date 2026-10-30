import { translitDeep } from './translit';

// Saytdagi (dev.harna.uz) "Ko'p so'raladigan savollar" va hujjatlar ("Biz haqimizda", "Maxfiylik siyosati",
// "Foydalanish shartlari") matnlari — uz / ru / en. Sayt xuddi shu matnlarni ko'rsatadi; FAQ backenddan
// (/faq) kelsa o'sha, bo'sh bo'lsa shu zaxira ro'yxat ishlatiladi.
export const FAQ_ITEMS = {
  uz: [
    {
      q: 'Harna.uz nima?',
      a: "Harna.uz — xizmat ko'rsatuvchi mutaxassislar va mijozlarni bog'laydigan platforma. Kerakli yo'nalishni tanlaysiz, mutaxassislar ro'yxatini reyting, joylashuv va narx bo'yicha saralaysiz va to'g'ridan-to'g'ri buyurtma berasiz.",
    },
    {
      q: "Ro'yxatdan o'tish pullikmi?",
      a: "Yo'q. Mijoz uchun ro'yxatdan o'tish ham, mutaxassis qidirish ham bepul.",
    },
    {
      q: "Qanday ro'yxatdan o'taman?",
      a: 'Telefon raqamingizni kiritasiz, SMS orqali kelgan tasdiqlash kodini yozasiz — tayyor. Google hisobingiz orqali ham kirishingiz mumkin.',
    },
    {
      q: 'Mutaxassisni qanday topaman?',
      a: 'Ikki yo\'l bor. Birinchisi — "Mutaxassislar" bo\'limidan o\'zingizga mos mutaxassisni tanlab, unga buyurtma berasiz. Ikkinchisi — "Buyurtma yaratish" orqali ochiq murojaat yozasiz va mos mutaxassislar o\'zlari javob beradi.',
    },
    {
      q: '"Tasdiqlangan mutaxassis" belgisi nimani anglatadi?',
      a: "Bu — shaxsi tasdiqlangan mutaxassis. U pasport ma'lumotlarini yuborgan va administrator ularni tekshirib chiqqan. Belgi faqat shaxs tasdiqlanganini bildiradi; hujjat ma'lumotlari hech kimga ko'rinmaydi.",
    },
    {
      q: 'Narxlar qanday belgilanadi?',
      a: "Har bir mutaxassis o'z xizmatlariga narx belgilaydi — soatbay, belgilangan yoki kelishilgan. Buyurtma sahifasida eng past narxdan boshlab ko'rsatiladi, aniq summa esa mutaxassis bilan kelishiladi.",
    },
    {
      q: "Ishdan keyin baho qanday qo'yiladi?",
      a: "Ish yakunlangandan keyin mutaxassisga baho va sharh qoldirasiz. Sharhlar mutaxassisning profilida ochiq ko'rinadi va uning umumiy reytingini shakllantiradi.",
    },
    {
      q: "Mutaxassis bo'lib ishlashni boshlash uchun nima kerak?",
      a: "Telefon raqamingizni tasdiqlaysiz, profilingizni to'ldirasiz va qaysi yo'nalishlarda ishlashingizni tanlaysiz. Ishonchni oshirish uchun sertifikat yuklashingiz va shaxsni tasdiqlashdan o'tishingiz mumkin — ikkalasini ham administrator ko'rib chiqadi.",
    },
    {
      q: "Ma'lumotlarim xavfsizmi?",
      a: "Parolingiz qaytarib bo'lmaydigan holda saqlanadi, pasport va JShShIR ma'lumotlari esa shifrlanadi. Saytdagi barcha aloqa HTTPS orqali himoyalangan. Batafsil ma'lumot maxfiylik siyosatida.",
    },
  ],
  ru: [
    {
      q: 'Что такое Harna.uz?',
      a: 'Harna.uz — платформа, которая связывает специалистов и заказчиков. Вы выбираете нужное направление, фильтруете специалистов по рейтингу, местоположению и цене и оформляете заказ напрямую.',
    },
    {
      q: 'Регистрация платная?',
      a: 'Нет. Для заказчика и регистрация, и поиск специалиста бесплатны.',
    },
    {
      q: 'Как зарегистрироваться?',
      a: 'Вводите номер телефона, затем код из SMS — готово. Также можно войти через аккаунт Google.',
    },
    {
      q: 'Как найти специалиста?',
      a: 'Двумя способами. Первый — выбрать подходящего специалиста в разделе «Специалисты» и оформить заказ. Второй — создать заказ, и подходящие специалисты откликнутся сами.',
    },
    {
      q: 'Что означает значок «Проверенный специалист»?',
      a: 'Это специалист с подтверждённой личностью: он отправил паспортные данные, а администратор их проверил. Значок говорит только о подтверждении личности — сами документы никому не видны.',
    },
    {
      q: 'Как формируются цены?',
      a: 'Каждый специалист сам назначает цену на свои услуги — почасовую, фиксированную или договорную. На странице показывается цена «от», точная сумма согласовывается с специалистом.',
    },
    {
      q: 'Как оставить оценку после работы?',
      a: 'После завершения работы вы ставите специалисту оценку и пишете отзыв. Отзывы видны в его профиле и формируют общий рейтинг.',
    },
    {
      q: 'Что нужно, чтобы начать работать специалистом?',
      a: 'Подтвердите номер телефона, заполните профиль и выберите направления работы. Для повышения доверия можно загрузить сертификаты и пройти подтверждение личности — и то, и другое проверяет администратор.',
    },
    {
      q: 'Мои данные в безопасности?',
      a: 'Пароль хранится в необратимом виде, паспортные данные и ПИНФЛ шифруются. Весь обмен данными идёт по HTTPS. Подробности — в политике конфиденциальности.',
    },
  ],
  en: [
    {
      q: 'What is Harna.uz?',
      a: 'Harna.uz connects skilled professionals with the people who need them. Pick a service, filter by rating, location and price, and book directly.',
    },
    {
      q: 'Is there a fee to sign up?',
      a: 'No. Signing up and finding a professional are both free for customers.',
    },
    {
      q: 'How do I sign up?',
      a: 'Enter your phone number and the code you receive by SMS. You can also sign in with a Google account.',
    },
    {
      q: 'How do I find a professional?',
      a: 'Two ways. Either pick someone yourself from the Professionals list and book them, or post an open request and let suitable professionals come to you.',
    },
    {
      q: 'What does the "verified" badge mean?',
      a: 'It means their identity was checked: they submitted passport details and an administrator reviewed them. The badge only confirms the identity — the documents themselves are never shown to anyone.',
    },
    {
      q: 'How are prices set?',
      a: 'Each professional sets their own prices — hourly, fixed or negotiable. Listings show a starting price; the exact amount is agreed with them.',
    },
    {
      q: 'How do reviews work?',
      a: 'Once the job is done you rate the professional and leave a review. Reviews appear on their public profile and feed their overall rating.',
    },
    {
      q: 'What do I need to start working as a professional?',
      a: 'Verify your phone, fill in your profile and choose the services you offer. To build trust you can upload certificates and go through identity verification — an administrator reviews both.',
    },
    {
      q: 'Is my data safe?',
      a: 'Passwords are stored irreversibly and passport details are encrypted. All traffic runs over HTTPS. See the privacy policy for the full picture.',
    },
  ],
};

export const DOCUMENTS = {
  uz: {
    about: {
      title: 'Biz haqimizda',
      updated: '',
      sections: [
        {
          h: 'Biz nima qilamiz',
          p: "Harna.uz — xizmat ko'rsatuvchi mutaxassislar va ularga ehtiyoji bor mijozlarni bog'laydigan onlayn platforma. Ta'mirlash, tozalash, elektrik, santexnika, repetitorlik va boshqa o'nlab yo'nalishda mutaxassis topish uchun endi tanish-bilishga tayanish shart emas.",
        },
        {
          h: 'Qanday ishlaydi',
          p: "Mijoz kerakli xizmat yo'nalishini tanlaydi, mutaxassislarni reyting, joylashuv va narx bo'yicha solishtiradi va to'g'ridan-to'g'ri buyurtma beradi. Kimni tanlashni bilmasa — ochiq buyurtma qoldiradi va mos mutaxassislar o'zlari javob beradi.\n\nIsh yakunlangach mijoz baho va sharh qoldiradi. Shu tariqa har bir mutaxassisning tarixi shakllanadi va keyingi mijoz uchun tanlash osonlashadi.",
        },
        {
          h: "Ishonchni qanday ta'minlaymiz",
          p: "Har bir hisob telefon raqami orqali tasdiqlanadi. Mutaxassislar qo'shimcha ravishda shaxsini tasdiqlashdan o'tishi va sertifikatlarini yuklashi mumkin — ikkalasini ham administrator qo'lda tekshiradi.\n\nSharhlar faqat haqiqiy buyurtmadan keyin qoldiriladi, ya'ni reytingni sun'iy ko'tarib bo'lmaydi.",
        },
        {
          h: 'Mutaxassislar uchun',
          p: "Platforma mutaxassisga mijoz qidirish uchun reklama byudjeti talab qilmaydi. Profilingizni to'ldirasiz, xizmat yo'nalishlari va narxlarni belgilaysiz — mijozlar sizni qidiruvdan topadi. Yaxshi bajarilgan har bir ish reytingingizni oshiradi.",
        },
        {
          h: 'Aloqa',
          p: "Savol yoki taklifingiz bo'lsa, saytdagi \"Mutaxassis bilan bog'lanish\" bo'limi orqali yozing — har bir murojaat o'qiladi.",
        },
      ],
    },
    privacy: {
      title: 'Maxfiylik siyosati',
      updated: '',
      sections: [
        {
          h: '1. Umumiy qoidalar',
          p: "Ushbu siyosat Harna.uz platformasidan foydalanuvchilar ma'lumotlarini yig'ish, saqlash, ishlatish va himoya qilish tartibini belgilaydi. Ro'yxatdan o'tish jarayonida ushbu siyosat bilan rozilik bildirish majburiy.",
        },
        {
          h: "2. Qanday ma'lumotlar yig'iladi",
          p: "Ro'yxatdan o'tishda: telefon raqami (majburiy), ism va familiya, parol (agar kiritsangiz), elektron pochta, jinsi, tug'ilgan sana, viloyat va tuman, profil rasmi.\n\nMutaxassislar uchun qo'shimcha: ish tavsifi, xizmat yo'nalishlari va narxlari, tajriba, tillar, ish jadvali, portfolio rasmlari, sertifikatlar.\n\nPlatformadan foydalanish natijasida: buyurtmalar tarixi, sharhlar va reytinglar, to'lovlar tarixi, xabarnomalar, tizimga kirish vaqti va IP-manzili.",
        },
        {
          h: "3. Shaxsni tasdiqlash ma'lumotlari",
          p: '"Tasdiqlangan mutaxassis" maqomini olish ixtiyoriy. Bunda JShShIR, pasport seriyasi va raqami qayta ishlanadi. Bu ma\'lumotlar bazada shifrlangan holda saqlanadi va ochiq profilda ko\'rsatilmaydi — boshqalar faqat "shaxsi tasdiqlangan" belgisini ko\'radi.',
        },
        {
          h: "4. Nima yig'ilmaydi",
          p: "Platforma karta raqamlari, CVV yoki bank hisob ma'lumotlarini saqlamaydi. To'lovlar to'liq to'lov tizimi tomonida amalga oshiriladi.",
        },
        {
          h: "5. Ma'lumotlar nima uchun ishlatiladi",
          p: "Hisobni yaratish va kirishni ta'minlash; mijoz va mutaxassisni bog'lash; buyurtmani boshqarish; reyting va sharhlar orqali ishonchni ta'minlash; buyurtma holati o'zgarganda xabar berish; firibgarlikning oldini olish; xizmatni yaxshilash uchun umumlashtirilgan statistika.\n\nMa'lumotlaringiz reklama maqsadida uchinchi tomonlarga sotilmaydi.",
        },
        {
          h: '6. Kimga ochiq va kimga uzatiladi',
          p: "Boshqa foydalanuvchilarga ochiq: ism va familiya, profil rasmi, viloyat va tuman, reyting va sharhlar. Buyurtma tuzilganda ikkala tomon bir-birining aloqa ma'lumotlarini ko'radi.\n\nXizmat ko'rsatuvchi hamkorlarga faqat zarur minimal ma'lumot uzatiladi: SMS provayderiga — telefon raqami va kod; Google'ga — \"Google orqali kirish\"ni tanlaganingizda pochta va ism; shaxsni tasdiqlash provayderiga — pasport ma'lumotlari (faqat siz boshlaganingizda); to'lov tizimiga — summa va identifikator.\n\nQonunda belgilangan hollarda vakolatli organlarning rasmiy so'rovi asosida taqdim etilishi mumkin.",
        },
        {
          h: "7. Ma'lumotlar qanday himoyalanadi",
          p: "Barcha aloqa HTTPS orqali shifrlanadi. Parollar qaytarib bo'lmaydigan usulda saqlanadi — hatto ma'muriyat ham asl parolni ko'ra olmaydi. Pasport ma'lumotlari alohida kalit bilan shifrlanadi. Sertifikat va hujjatlar yopiq omborda saqlanadi.\n\nSMS-kod 5 daqiqada eskiradi va 3 marta xato kiritilsa bekor qilinadi. Bitta raqamga soatiga 5 tadan ortiq kod yuborilmaydi. Parol 5 marta xato kiritilsa hisob 15 daqiqaga bloklanadi.\n\nHech qanday tizim 100% himoyani kafolatlay olmaydi. Platforma xodimlari hech qachon sizdan parol yoki SMS-kod so'ramaydi.",
        },
        {
          h: "8. Ma'lumotlar qancha saqlanadi",
          p: "Profil ma'lumotlari — hisob faol bo'lgan davrda. SMS-kodlar — 5 daqiqa. Vaqtinchalik yuklangan fayllar — 1 kun. Shaxsni tasdiqlash natijasi — 1 yil. Buyurtmalar va to'lovlar tarixi — qonun talab qilgan muddatgacha.",
        },
        {
          h: '9. Sizning huquqlaringiz',
          p: "Qanday ma'lumotlaringiz saqlanayotganini so'rash; noto'g'ri ma'lumotni to'g'irlash; hisobingizni o'chirishni talab qilish; rozilikni qaytarib olish; vakolatli organga shikoyat qilish.\n\nMurojaat uchun saytdagi \"Mutaxassis bilan bog'lanish\" bo'limidan foydalaning.",
        },
        {
          h: "10. Brauzerda saqlanadigan ma'lumotlar",
          p: "Sessiya kalitlari — tizimda qolishingiz uchun, brauzer yopilganda o'chiriladi. Til, mavzu va tanlangan manzil — qulaylik uchun brauzeringizda qoladi. Reklama yoki kuzatuv cookie'lari ishlatilmaydi.",
        },
        {
          h: "11. Yosh chegarasi va o'zgarishlar",
          p: "Platformadan 18 yoshdan kichik shaxslar foydalana olmaydi.\n\nSiyosat o'zgartirilishi mumkin. Muhim o'zgarishlar haqida ro'yxatdan o'tgan foydalanuvchilarga xabar beriladi.",
        },
      ],
    },
    terms: {
      title: 'Foydalanish shartlari',
      updated: '',
      sections: [
        {
          h: '1. Shartlarning qabul qilinishi',
          p: "Harna.uz platformasidan foydalanish orqali siz ushbu shartlarga rozilik bildirasiz. Rozi bo'lmasangiz, platformadan foydalanmang.",
        },
        {
          h: '2. Platformaning roli',
          p: "Harna.uz — mijoz va mutaxassis o'rtasidagi bog'lovchi platforma. Biz xizmatni o'zimiz ko'rsatmaymiz va tomonlar o'rtasidagi shartnomaning tarafi emasmiz.\n\nIshning sifati, muddati va narxi mutaxassisning o'zi bilan kelishiladi. Platforma ishonchni oshirish uchun reyting, sharh va shaxs tasdiqlash vositalarini beradi, lekin ish natijasi uchun javobgarlikni o'z zimmasiga olmaydi.",
        },
        {
          h: '3. Hisob va uning xavfsizligi',
          p: "Bir shaxs bir hisobdan foydalanadi. Ro'yxatdan o'tishda haqiqiy ma'lumot kiritish majburiy.\n\nParol va SMS-kodni saqlash sizning mas'uliyatingiz. Hisobingizdan amalga oshirilgan barcha harakatlar siz tomondan bajarilgan deb hisoblanadi.\n\nHisob 18 yoshdan kichik shaxsga tegishli bo'lsa yoki soxta ma'lumot bilan ochilgan bo'lsa — o'chiriladi.",
        },
        {
          h: '4. Mutaxassislar uchun majburiyatlar',
          p: "Ko'rsatilgan xizmatni kelishilgan sifat va muddatda bajarish; profildagi ma'lumotlar (tajriba, sertifikat, yo'nalishlar) haqiqatga mos bo'lishi; qonun talab qiladigan hollarda tegishli ruxsat va litsenziyaga ega bo'lish.\n\nSoxta sertifikat yuklash yoki boshqa shaxs nomidan ishlash — hisobni butunlay yopish uchun asos.",
        },
        {
          h: '5. Mijozlar uchun majburiyatlar',
          p: "Buyurtma shartlarini aniq bayon qilish; kelishilgan haqni o'z vaqtida to'lash; mutaxassisga nisbatan hurmatli munosabatda bo'lish.\n\nSharh haqiqiy tajribaga asoslanishi kerak. Asossiz salbiy sharh yoki raqobatchi nomidan yozilgan baho olib tashlanadi.",
        },
        {
          h: '6. Taqiqlangan harakatlar',
          p: "Platformadan qonunga zid maqsadda foydalanish; boshqa foydalanuvchini aldash yoki uning ma'lumotlarini ruxsatsiz yig'ish; reyting va sharhlarni sun'iy ko'tarish; tizimga avtomatlashtirilgan vositalar bilan ortiqcha yuklama berish; boshqa shaxs nomidan ish ko'rish.",
        },
        {
          h: "7. To'lovlar",
          p: "Ish haqi mijoz va mutaxassis o'rtasida kelishiladi. Platforma orqali to'lov amalga oshirilgan hollarda operatsiya to'lov tizimi qoidalariga bo'ysunadi.\n\nHamyondagi mablag' va bonuslardan foydalanish tartibi kabinetda ko'rsatiladi.",
        },
        {
          h: '8. Nizolarni hal qilish',
          p: "Nizo yuzaga kelsa, avval tomonlar o'zaro kelishuvga harakat qiladi. Kelishuv bo'lmasa, saytdagi murojaat kanali orqali platformaga xabar berish mumkin — biz vositachilik qilishga harakat qilamiz, lekin hakamlik vakolatiga ega emasmiz.\n\nQolgan hollarda nizolar O'zbekiston Respublikasi qonunchiligiga muvofiq hal etiladi.",
        },
        {
          h: '9. Javobgarlik chegarasi',
          p: 'Platforma texnik uzilishlar, uchinchi tomon xizmatlaridagi nosozliklar yoki foydalanuvchilarning o\'zaro kelishuvidan kelib chiqadigan zarar uchun javobgar emas.\n\nXizmat "qanday bo\'lsa shundayligicha" taqdim etiladi.',
        },
        {
          h: "10. Shartlarning o'zgarishi",
          p: "Shartlar o'zgartirilishi mumkin. Muhim o'zgarishlar haqida oldindan xabar beriladi. Yangi tahrir kuchga kirgandan keyin platformadan foydalanishni davom ettirish — yangi shartlarga rozilik hisoblanadi.",
        },
      ],
    },
  },
  ru: {
    about: {
      title: 'О нас',
      updated: '',
      sections: [
        {
          h: 'Чем мы занимаемся',
          p: 'Harna.uz — онлайн-платформа, которая связывает специалистов и заказчиков. Ремонт, уборка, электрика, сантехника, репетиторство и десятки других направлений — искать специалиста через знакомых больше не нужно.',
        },
        {
          h: 'Как это работает',
          p: 'Заказчик выбирает нужное направление, сравнивает специалистов по рейтингу, местоположению и цене и оформляет заказ напрямую. Если сложно выбрать — оформляет открытый заказ, и подходящие специалисты откликаются сами.\n\nПосле выполнения работы заказчик ставит оценку и пишет отзыв. Так формируется история каждого специалиста, и следующему заказчику выбирать проще.',
        },
        {
          h: 'Как мы обеспечиваем доверие',
          p: 'Каждый аккаунт подтверждается по номеру телефона. Специалисты дополнительно могут пройти подтверждение личности и загрузить сертификаты — и то, и другое проверяет администратор вручную.\n\nОтзывы оставляются только после реального заказа, поэтому накрутить рейтинг нельзя.',
        },
        {
          h: 'Для специалистов',
          p: 'Платформа не требует рекламного бюджета для поиска клиентов. Вы заполняете профиль, указываете направления и цены — заказчики находят вас через поиск. Каждая хорошо выполненная работа поднимает ваш рейтинг.',
        },
        {
          h: 'Связаться с нами',
          p: 'Если у вас есть вопрос или предложение, напишите через раздел «Связаться со специалистом» — мы читаем каждое обращение.',
        },
      ],
    },
    privacy: {
      title: 'Политика конфиденциальности',
      updated: '',
      sections: [
        {
          h: '1. Общие положения',
          p: 'Настоящая политика определяет порядок сбора, хранения, использования и защиты данных пользователей платформы Harna.uz. Согласие с политикой обязательно при регистрации.',
        },
        {
          h: '2. Какие данные собираются',
          p: 'При регистрации: номер телефона (обязательно), имя и фамилия, пароль (если вы его задаёте), электронная почта, пол, дата рождения, область и район, фото профиля.\n\nДля специалистов дополнительно: описание работы, направления услуг и цены, опыт, языки, график работы, портфолио, сертификаты.\n\nВ процессе использования: история заказов, отзывы и рейтинги, история платежей, уведомления, время и IP-адрес входа.',
        },
        {
          h: '3. Данные подтверждения личности',
          p: 'Получение статуса «Проверенный специалист» — добровольное. При этом обрабатываются ПИНФЛ, серия и номер паспорта. Эти данные хранятся в базе в зашифрованном виде и не показываются в публичном профиле — другие видят только значок «личность подтверждена».',
        },
        {
          h: '4. Что НЕ собирается',
          p: 'Платформа не хранит номера карт, CVV и банковские реквизиты. Платежи полностью выполняются на стороне платёжной системы.',
        },
        {
          h: '5. Для чего используются данные',
          p: 'Создание аккаунта и вход; связь заказчика и специалиста; управление заказом; обеспечение доверия через рейтинги и отзывы; уведомления об изменении статуса заказа; предотвращение мошенничества; обобщённая статистика для улучшения сервиса.\n\nВаши данные не продаются третьим лицам в рекламных целях.',
        },
        {
          h: '6. Кому доступны и кому передаются',
          p: 'Другим пользователям видны: имя и фамилия, фото профиля, область и район, рейтинг и отзывы. При оформлении заказа стороны видят контакты друг друга.\n\nПартнёрам передаётся только необходимый минимум: SMS-провайдеру — номер и код; Google — почта и имя при входе через Google; провайдеру подтверждения личности — паспортные данные (только если вы начали процедуру); платёжной системе — сумма и идентификатор.\n\nВ предусмотренных законом случаях данные могут быть предоставлены уполномоченным органам по официальному запросу.',
        },
        {
          h: '7. Как защищаются данные',
          p: 'Весь обмен идёт по HTTPS. Пароли хранятся необратимо — даже администрация не видит исходный пароль. Паспортные данные шифруются отдельным ключом. Сертификаты и документы хранятся в закрытом хранилище.\n\nSMS-код действует 5 минут и аннулируется после 3 неверных попыток. На один номер отправляется не более 5 кодов в час. После 5 неверных вводов пароля аккаунт блокируется на 15 минут.\n\nНи одна система не даёт 100% гарантии. Сотрудники платформы никогда не спрашивают ваш пароль или SMS-код.',
        },
        {
          h: '8. Сроки хранения',
          p: 'Данные профиля — пока аккаунт активен. SMS-коды — 5 минут. Временно загруженные файлы — 1 день. Результат подтверждения личности — 1 год. История заказов и платежей — в течение срока, установленного законом.',
        },
        {
          h: '9. Ваши права',
          p: 'Запросить, какие данные о вас хранятся; исправить неверные данные; потребовать удаления аккаунта; отозвать согласие; обратиться с жалобой в уполномоченный орган.\n\nДля обращения используйте раздел «Связаться со специалистом».',
        },
        {
          h: '10. Данные в браузере',
          p: 'Ключи сессии — чтобы вы оставались в системе; удаляются при закрытии браузера. Язык, тема и выбранный адрес — для удобства, остаются в вашем браузере. Рекламные и трекинговые cookie не используются.',
        },
        {
          h: '11. Возрастное ограничение и изменения',
          p: 'Пользоваться платформой могут только лица старше 18 лет.\n\nПолитика может изменяться. О существенных изменениях зарегистрированные пользователи уведомляются заранее.',
        },
      ],
    },
    terms: {
      title: 'Условия использования',
      updated: '',
      sections: [
        {
          h: '1. Принятие условий',
          p: 'Используя платформу Harna.uz, вы соглашаетесь с настоящими условиями. Если вы не согласны — не пользуйтесь платформой.',
        },
        {
          h: '2. Роль платформы',
          p: 'Harna.uz связывает заказчиков и специалистов. Мы не оказываем услуги сами и не являемся стороной договора между ними.\n\nКачество, сроки и цена работы согласуются напрямую с специалистом. Платформа предоставляет рейтинги, отзывы и подтверждение личности для повышения доверия, но не несёт ответственности за результат работы.',
        },
        {
          h: '3. Аккаунт и его безопасность',
          p: 'Один человек — один аккаунт. При регистрации обязательно указывать достоверные данные.\n\nСохранность пароля и SMS-кода — ваша ответственность. Все действия, совершённые из вашего аккаунта, считаются совершёнными вами.\n\nАккаунт, принадлежащий лицу младше 18 лет или созданный с ложными данными, удаляется.',
        },
        {
          h: '4. Обязанности специалистов',
          p: 'Выполнять услугу в согласованном качестве и в срок; данные в профиле (опыт, сертификаты, направления) должны соответствовать действительности; иметь разрешения и лицензии там, где этого требует закон.\n\nЗагрузка поддельных сертификатов или работа от имени другого лица — основание для полной блокировки аккаунта.',
        },
        {
          h: '5. Обязанности заказчиков',
          p: 'Чётко формулировать условия заказа; своевременно оплачивать согласованную сумму; уважительно относиться к специалисту.\n\nОтзыв должен основываться на реальном опыте. Необоснованно негативные отзывы и оценки от имени конкурентов удаляются.',
        },
        {
          h: '6. Запрещённые действия',
          p: 'Использование платформы в противоправных целях; обман других пользователей и несанкционированный сбор их данных; искусственная накрутка рейтингов и отзывов; создание избыточной нагрузки автоматизированными средствами; действия от имени другого лица.',
        },
        {
          h: '7. Оплата',
          p: 'Стоимость работы согласуется между заказчиком и специалистом. Если оплата проходит через платформу, операция подчиняется правилам платёжной системы.\n\nПорядок использования средств кошелька и бонусов указан в личном кабинете.',
        },
        {
          h: '8. Разрешение споров',
          p: 'При возникновении спора стороны сначала пытаются договориться. Если не получилось, можно сообщить платформе через раздел обращений — мы попробуем выступить посредником, но не обладаем правом арбитража.\n\nВ остальных случаях споры разрешаются в соответствии с законодательством Республики Узбекистан.',
        },
        {
          h: '9. Ограничение ответственности',
          p: 'Платформа не отвечает за технические сбои, неполадки сторонних сервисов и ущерб, вытекающий из договорённостей пользователей между собой.\n\nСервис предоставляется «как есть».',
        },
        {
          h: '10. Изменение условий',
          p: 'Условия могут изменяться. О существенных изменениях мы уведомляем заранее. Продолжение использования платформы после вступления новой редакции в силу означает согласие с ней.',
        },
      ],
    },
  },
  en: {
    about: {
      title: 'About us',
      updated: '',
      sections: [
        {
          h: 'What we do',
          p: 'Harna.uz is an online platform that connects skilled professionals with the people who need them. Repairs, cleaning, electrical work, plumbing, tutoring and dozens of other services — finding someone no longer depends on who you happen to know.',
        },
        {
          h: 'How it works',
          p: "A customer picks a service, compares professionals by rating, location and price, and books directly. If choosing is hard, they post an open request instead and suitable professionals come to them.\n\nOnce the job is done the customer leaves a rating and a review. That builds each professional's history and makes the next customer's choice easier.",
        },
        {
          h: 'How we build trust',
          p: 'Every account is verified by phone. Professionals can additionally go through identity verification and upload certificates — an administrator reviews both by hand.\n\nReviews can only be left after a real booking, so ratings cannot be inflated.',
        },
        {
          h: 'For professionals',
          p: 'The platform does not require an advertising budget to find customers. You fill in your profile, set your services and prices, and customers find you through search. Every job done well raises your rating.',
        },
        {
          h: 'Get in touch',
          p: 'If you have a question or a suggestion, write to us through "Contact a specialist" — every message is read.',
        },
      ],
    },
    privacy: {
      title: 'Privacy policy',
      updated: '',
      sections: [
        {
          h: '1. General',
          p: 'This policy sets out how Harna.uz collects, stores, uses and protects user data. Accepting it is required to register.',
        },
        {
          h: '2. What we collect',
          p: 'At sign-up: phone number (required), first and last name, password (if you set one), email, gender, date of birth, region and district, profile photo.\n\nFor professionals additionally: work description, services and prices, experience, languages, schedule, portfolio images, certificates.\n\nThrough use of the platform: order history, reviews and ratings, payment history, notifications, sign-in time and IP address.',
        },
        {
          h: '3. Identity verification data',
          p: 'Becoming a "verified professional" is optional. It processes your PINFL and passport series and number. That data is stored encrypted and never appears on the public profile — others only see the "identity verified" badge.',
        },
        {
          h: '4. What we do NOT collect',
          p: 'The platform never stores card numbers, CVV codes or bank account details. Payments are handled entirely by the payment provider.',
        },
        {
          h: '5. Why we use it',
          p: 'Creating your account and signing you in; connecting customers and professionals; managing orders; building trust through ratings and reviews; telling you when an order changes state; preventing fraud and abuse; aggregate statistics to improve the service.\n\nYour data is not sold to third parties for advertising.',
        },
        {
          h: '6. Who can see it and where it goes',
          p: "Visible to other users: first and last name, profile photo, region and district, rating and reviews. Once an order exists, both sides see each other's contact details.\n\nService partners receive only the minimum they need: the SMS provider — your number and the code; Google — your email and name if you choose Google sign-in; the identity provider — passport details, and only if you started that flow; the payment system — the amount and an identifier.\n\nData may be disclosed to authorities on an official request where the law requires it.",
        },
        {
          h: '7. How it is protected',
          p: 'All traffic runs over HTTPS. Passwords are stored irreversibly — not even administrators can read the original. Passport details are encrypted with a separate key. Certificates and documents live in private storage.\n\nAn SMS code expires in 5 minutes and is voided after 3 wrong attempts. No more than 5 codes go to one number per hour. Five wrong passwords lock the account for 15 minutes.\n\nNo system guarantees complete protection. Platform staff will never ask you for your password or an SMS code.',
        },
        {
          h: '8. How long we keep it',
          p: 'Profile data — while the account is active. SMS codes — 5 minutes. Temporary uploads — 1 day. Identity verification result — 1 year. Order and payment history — for as long as the law requires.',
        },
        {
          h: '9. Your rights',
          p: 'Ask what data we hold about you; correct anything wrong; request deletion of your account; withdraw your consent; complain to the supervisory authority.\n\nUse "Contact a specialist" on the site to reach us.',
        },
        {
          h: '10. What we store in your browser',
          p: 'Session keys so you stay signed in; they are cleared when the browser closes. Language, theme and your chosen location stay in your browser for convenience. No advertising or tracking cookies are used.',
        },
        {
          h: '11. Age limit and changes',
          p: 'The platform is for people aged 18 and over.\n\nThis policy may change. Registered users are told in advance about material changes.',
        },
      ],
    },
    terms: {
      title: 'Terms of use',
      updated: '',
      sections: [
        {
          h: '1. Accepting these terms',
          p: 'By using Harna.uz you agree to these terms. If you do not agree, please do not use the platform.',
        },
        {
          h: '2. What the platform is',
          p: 'Harna.uz connects customers and professionals. We do not perform the services ourselves and are not a party to the agreement between them.\n\nQuality, timing and price are agreed directly with the professional. The platform provides ratings, reviews and identity verification to support trust, but is not responsible for the outcome of the work.',
        },
        {
          h: '3. Your account',
          p: 'One person, one account. The details you register with must be accurate.\n\nKeeping your password and SMS codes safe is your responsibility. Anything done from your account is treated as done by you.\n\nAccounts belonging to anyone under 18, or opened with false details, are removed.',
        },
        {
          h: '4. Obligations of professionals',
          p: "Deliver the agreed service to the agreed standard and schedule; keep profile details (experience, certificates, services) truthful; hold any permit or licence the law requires for the work.\n\nUploading forged certificates or working under someone else's identity is grounds for permanent removal.",
        },
        {
          h: '5. Obligations of customers',
          p: "State the terms of the job clearly; pay the agreed amount on time; treat professionals with respect.\n\nReviews must reflect a real experience. Unfounded negative reviews and ratings written on a competitor's behalf are removed.",
        },
        {
          h: '6. Prohibited conduct',
          p: "Using the platform for unlawful purposes; deceiving other users or harvesting their data; inflating ratings or reviews; placing excessive automated load on the system; acting under another person's identity.",
        },
        {
          h: '7. Payments',
          p: "The price is agreed between customer and professional. Where payment runs through the platform, the transaction is subject to the payment provider's rules.\n\nHow wallet balances and bonuses may be used is shown in your dashboard.",
        },
        {
          h: '8. Disputes',
          p: 'If a dispute arises, the parties should first try to settle it between themselves. Failing that, you can tell us through the support channel — we will try to mediate, but we have no arbitration authority.\n\nOtherwise disputes are resolved under the law of the Republic of Uzbekistan.',
        },
        {
          h: '9. Limitation of liability',
          p: 'The platform is not liable for technical outages, failures in third-party services, or losses arising from what users agree between themselves.\n\nThe service is provided "as is".',
        },
        {
          h: '10. Changes',
          p: 'These terms may change. We give notice of material changes in advance. Continuing to use the platform after a new version takes effect means you accept it.',
        },
      ],
    },
  },
};

// Kirill (cr) matnlari — o'zbekcha matnlardan birinchi so'ralganda o'giriladi.
for (const texts of [FAQ_ITEMS, DOCUMENTS]) {
  let cr;
  Object.defineProperty(texts, 'cr', {
    enumerable: true,
    get() {
      cr ??= translitDeep(texts.uz);
      return cr;
    },
  });
}
