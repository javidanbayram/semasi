/* =====================================================================
   ALBUM CONTENT & CONFIG
   ---------------------------------------------------------------------
   HOW TO USE YOUR OWN PHOTOS:
   Drop her real photos into the /photos folder named 12149836-5C87-46C8-831F-93DB257A1176.jpg …
   12149836-5C87-46C8-831F-93DB257A1176.jpg. Each image first tries the local file; if it's missing,
   the gorgeous Unsplash demo image is shown instead. Zero code changes.
   ===================================================================== */

window.CONFIG = {
  /* Folder for your real photos (12149836-5C87-46C8-831F-93DB257A1176.jpg … 12149836-5C87-46C8-831F-93DB257A1176.jpg) */
  photoDir: 'photos/',

  /* Background music file (track.m4a) */
  musicUrl: 'track.m4a',

  /* Book page aspect ratio (width / height) */
  pageRatio: 0.72,
};

/* Demo images (Unsplash) used whenever photos/photoN.jpg is not found. */
const U = (id) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=900&q=80`;
window.DEMO_PHOTOS = {
  '12149836-5C87-46C8-831F-93DB257A1176.jpg':  U('1494790108377-be9c29b29330'),
  '5B07EF4B-70C3-434C-9B3A-2572E65C23A8.jpg':  U('1516589178581-6cd7833ae3b2'),
  '803093AB-A2EB-4B75-916F-4875A97612C1.jpg':  U('1529626455594-4ff0802cfb7e'),
  '85C5FB92-FB91-4331-AF12-7F9784028887.jpg':  U('1517841905240-472988babdf9'),
  'IMG_0218.jpg':  U('1522673607200-164d1b6ce486'),
  'IMG_0562.jpg':  U('1524504388940-b1c1722653e1'),
  'IMG_0564.jpg':  U('1488426862026-3ee34a7d66df'),
  'IMG_0565.jpg':  U('1434030216411-0b793f4b4173'),
  'IMG_0814.jpg':  U('1507525428034-b723cf961d3e'),
  'IMG_0815.jpg': U('1518199266791-5375a83190b7'),
  'IMG_0818.jpg': U('1500917293891-ef795e70e1f6'),
  'IMG_0819 (1).jpg': U('1511988617509-a57c8a288659'),
  'IMG_1945.jpg': U('1519741497674-611481863552'),
  'IMG_1946.jpg': U('1490750967868-88aa4486c946'),
  'IMG_1947.jpg': U('1506744038136-46273834b3fb'),
  '12149836-5C87-46C8-831F-93DB257A1176.jpg': U('1438761681033-6461ffad8d80'),
};

/* ---------------------------------------------------------------------
   18 INNER PAGES
   layout: 'title' | 'polaroid' (A) | 'dual' (B) | 'letter' (C) |
           'film' (D) | 'sparkle' (E) | 'list' | 'quote' | 'mosaic' |
           'tribute' | 'finale'
   --------------------------------------------------------------------- */
window.PAGES = [
  /* 1 */ {
    layout: 'title',
    kicker: 'Bu albom',
    text: 'Hər səhifəsində onun gözəlliyi, işığı və təbəssümü var. Tələsmə — yavaş-yavaş vərəqlə...',
  },
  /* 2 — Layout A */ {
    layout: 'polaroid',
    photo: '12149836-5C87-46C8-831F-93DB257A1176.jpg',
    caption: 'Gülüşünlə bütün dünyanı işıqlandırdığın o ilk an...',
    note: 'bu gülüşə görə ♥',
    tilt: -3,
  },
  /* 3 — Layout B */ {
    layout: 'dual',
    photos: ['5B07EF4B-70C3-434C-9B3A-2572E65C23A8.jpg', '803093AB-A2EB-4B75-916F-4875A97612C1.jpg'],
    quote: '“Sənin gülümsədiyin hər an, dünyanın ən gözəl mənzərəsidir.”',
  },
  /* 4 — Layout C */ {
    layout: 'letter',
    greeting: 'Əzizim,',
    paragraphs: [
      'Bəzən sənə baxıram və necə bacardığına heyran qalıram. Gecə yarısına qədər dərs oxuyursan, yorulursan, amma səhər yenə də o gözəl təbəssümünlə yeni günə başlayırsan.',
      'Sənin gücün səs-küylü deyil — sakit, inadkar və çox gözəldir. Heç kimin görmədiyi o əməyi mən görürəm və hər dəfə səninlə bir az daha fəxr edirəm.',
      'Unutma: yol nə qədər çətin olsa da, sən tək deyilsən. Mən həmişə yanındayam.',
    ],
    sign: 'Sevgi ilə',
  },
  /* 5 — Layout D */ {
    layout: 'film',
    photos: ['85C5FB92-FB91-4331-AF12-7F9784028887.jpg', 'IMG_0218.jpg', 'IMG_0562.jpg'],
    title: 'Sənin gözəlliyinin lenti',
    caption: 'Kadr-kadr parlayan işıq — heç vaxt sönməsin deyə.',
  },
  /* 6 — Layout E */ {
    layout: 'sparkle',
    photo: 'IMG_0564.jpg',
    title: 'Mənim ulduzum',
    caption: 'Sən gülümsəyəndə hətta ulduzlar da bir anlıq susur ✨',
  },
  /* 7 — Layout A */ {
    layout: 'polaroid',
    photo: 'IMG_0565.jpg',
    caption: 'Dərslərdən nə qədər yorulsan da, gözlərindəki əzmi heç vaxt itirmədiyin günlər...',
    note: 'qürur duyuram!',
    tilt: 2.5,
  },
  /* 8 — List */ {
    layout: 'list',
    title: 'Səndə sevdiyim kiçik şeylər',
    items: [
      'Danışarkən gözlərinin parlaması',
      'Hər kiçik detala fikir verməyin',
      'Yorğun olsan da “yaxşıyam” deyib gülümsəməyin',
      'Hər işi sona qədər çatdırmaq inadın',
      'Gülüşünün hamıya yoluxması',
      'Və sadəcə... sən olmağın',
    ],
  },
  /* 9 — Layout B */ {
    layout: 'dual',
    photos: ['IMG_0814.jpg', 'IMG_0815.jpg'],
    quote: '“Hər baxışında dünyanı daha gözəl edirsən.”',
  },
  /* 10 — Layout E */ {
    layout: 'sparkle',
    photo: 'IMG_0818.jpg',
    title: 'Hər xırdalıqda',
    caption: 'Hər xırdalıqda belə səni düşünmək dünyanın ən gözəl hissidir',
  },
  /* 11 — Layout D */ {
    layout: 'film',
    photos: ['IMG_0819 (1).jpg', 'IMG_1945.jpg', 'IMG_1946.jpg'],
    title: 'Sənin kadrların',
    caption: 'Sənin gözlənilməz anların, səmimi təbəssümlərin.',
  },
  /* 12 — Layout C */ {
    layout: 'letter',
    greeting: 'Bilirsənmi?',
    paragraphs: [
      'Sənin gözəlliyin təkcə üzündə deyil. O, başqalarına göstərdiyin qayğıda, dostlarına olan sədaqətində, ən çətin gündə belə ümidini itirməməyindədir.',
      'Səni tanıdığım gündən bəri dünyaya fərqli baxıram — daha mehriban, daha işıqlı, daha mənalı.',
      'Və hər gün bir az daha anlayıram ki, həyatımdakı ən böyük şans sənsən.',
    ],
    sign: 'Həmişə səninlə',
  },
  /* 13 — Layout A */ {
    layout: 'polaroid',
    photo: 'IMG_1947.jpg',
    caption: 'Bəzi anları şəkil tuta bilmir — amma ürək onları heç vaxt unutmur.',
    note: 'heyranam!',
    tilt: -2,
  },
  /* 14 — Layout E */ {
    layout: 'sparkle',
    photo: '12149836-5C87-46C8-831F-93DB257A1176.jpg',
    title: 'Sadəcə sən',
    caption: 'Dünyanın bütün rəngləri sənin gözlərində toplanıb.',
  },
  /* 15 — Quote */ {
    layout: 'quote',
    quote: 'Gözəllik əşyalarda deyil, ona baxan gözlərdədir — sən isə hər ikisisən.',
    author: 'Bizim Hekayəmiz',
    note: '...həmişə belə parılda.',
  },
  /* 16 — Mosaic */ {
    layout: 'mosaic',
    photos: ['12149836-5C87-46C8-831F-93DB257A1176.jpg', 'IMG_0218.jpg', 'IMG_0814.jpg', 'IMG_1945.jpg'],
    title: 'Sənin kiçik kainatın',
    caption: 'Hər kadrında parlayan bir ulduzsan.',
  },
  /* 17 — Tribute */ {
    layout: 'tribute',
    text: 'Bu albomdakı hər şəkil sənin nə qədər özəl və gözəl olduğunun sadəcə kiçik bir hissəsidir.',
  },
  /* 18 — Day 7 gateway */ {
    layout: 'finale',
    text: 'Hekayəmiz hələ bitməyib... Əsl böyük final və həftənin son sirri sabah — 7-ci gün açılacaq. Bu gecə bütün yorğunluğunu burax və sadəcə dincəl. Səninlə həmişə fəxr edirəm ❤️',
    seal: 'GÜN 7: TEZLİKLƏ',
  },
];
