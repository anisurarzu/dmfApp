/**
 * Wallet → Books — লোকাল মেটাডেটা ও Google Drive ফাইল আইডি।
 * PDF: https://drive.google.com/file/d/1oVUGLgmo-q6QuY7XJNNI9WVEuuza-o7g/view
 */
export const BOOKS = [
  {
    id: 'alokito-pothe-jatra-26',
    title: 'আলোকিত পথে যাত্রা',
    category: 'শিশু শিক্ষা',
    subtitle: 'ক্লাস ২–৫ · ইসলামিক ও আধুনিক শিশু শিক্ষার বই',
    year: '২০২৬',
    cover: require('../../assets/book-alokito-pothe-jatra-26.png'),
    driveFileId: '1oVUGLgmo-q6QuY7XJNNI9WVEuuza-o7g',
    priceBdt: 100,
    author: {
      name: 'আনিসুর রহমান',
      profession: 'সিনিয়র সফটওয়্যার ইঞ্জিনিয়ার',
      extraEducation: 'হাদীস বিষয়ে ডিপ্লোমা – ড্যাফোডিল ইসলামিক সেন্টার',
      roles: [
        'পরিচালক, দারুল মুত্তাক্বীন স্কলারশিপ',
        'সহ-সভাপতি, দারুল মুত্তাক্বীন ফাউন্ডেশন',
      ],
    },
    editor: {
      name: 'সাইফুল্লাহ সাদী',
      roles: ['শিক্ষাবিষয়ক সম্পাদক, দারুল মুত্তাক্বীন ফাউন্ডেশন'],
    },
  },
  {
    id: 'antor-bidhongshi-bishoy',
    title: 'অন্তরের রোগ',
    category: 'আত্মশুদ্ধি',
    subtitle: 'আত্মার ব্যাধি ও তার নিরাময় সম্পর্কিত এক অমূল্য সংকলন',
    description:
      '「অন্তরের রোগ」 গ্রন্থটি বিখ্যাত আলেম ও দাঈ শাইখ সালেহ আল-মুনাজ্জিদ কর্তৃক রচিত একটি হৃদয়স্পর্শী ও গভীর আধ্যাত্মিক গ্রন্থ। লেখক এতে পবিত্র কুরআন ও সহীহ হাদীসের প্রামাণিক আলোকে সেসব আত্মিক রোগ ও নৈতিক দুর্বলতাগুলো বিশ্লেষণ করেছেন, যা মানুষের অন্তরকে কলুষিত করে, নেক আমলকে নষ্ট করে দেয় এবং আল্লাহ সুবহানাহু ওয়া তাআলার নৈকট্য থেকে দূরে সরিয়ে দেয়। আধুনিক জীবনের চ্যালেঞ্জ ও প্রলোভনের মুখে একজন মুসলিমের ঈমানী দৃঢ়তা বজায় রাখার জন্য এটি এক অপরিহার্য দিকনির্দেশনা। এটি অন্তরকে পরিশুদ্ধ করার জন্য একটি বিস্তারিত গাইডলাইন, যা প্রমাণ করে যে, শরীরের সুস্থতার চেয়ে আত্মার সুস্থতা অধিক গুরুত্বপূর্ণ।',
    cover: require('../../assets/book-antor-bidhongshi.png'),
    driveFileId: '146-zJQHpGzGYGLf2ZzdurA3O9M9p7hQF',
    priceBdt: 100,
    author: {
      name: 'শাইখ সালেহ আল-মুনাজ্জিদ',
      profession: 'বিশিষ্ট আলেম, লেখক ও ইসলামী গবেষক',
      extraEducation: 'কুরআন ও সুন্নাহ ভিত্তিক আধুনিক ফতোয়া ও দাওয়াহ ক্ষেত্রে স্বীকৃত পণ্ডিত',
      roles: ['ইসলাম প্রশ্নোত্তর (islamqa.info) প্রতিষ্ঠাতা ও পরিচালক'],
    },
  },
  {
    id: 'hadiser-name-jaliyat',
    title: 'হাদীসের নামে জালিয়াতি',
    category: 'হাদীস',
    subtitle: 'প্রচলিত মিথ্যা হাদীস ও ভিত্তিহীন কথা',
    description:
      'এই গ্রন্থে ড. খোন্দকার আব্দুল্লাহ জাহাঙ্গীর (রাহিমাহুল্লাহ) হাদীসের নামে ছড়িয়ে পড়া জালিয়াতি, প্রচলিত মিথ্যা হাদীস ও ভিত্তিহীন কথাবার্তা চিহ্নিত করেছেন। পাঠক সঠিক ও ভুলের মধ্যে পার্থক্য বুঝতে পারবেন এবং ইসলামী জীবনে প্রমাণভিত্তিক জ্ঞানের গুরুত্ব উপলব্ধি করবেন।',
    cover: require('../../assets/book-hadiser-name-jaliyat.png'),
    driveFileId: '1KeY0QHHI1rJ00_ImicEYD0GC4o5LW2Nn',
    priceBdt: 100,
    author: {
      name: 'ড. খোন্দকার আব্দুল্লাহ জাহাঙ্গীর (রাহিমাহুল্লাহ)',
      profession: 'অধ্যাপক, আল-হাদীস বিভাগ, ইসলামী বিশ্ববিদ্যালয়, কুষ্টিয়া',
      extraEducation: 'পি-এইচ. ডি. (রিয়াদ), এম. এ. (রিয়াদ), এম.এম. (ঢাকা)',
      roles: ['প্রকাশক: আস-সুন্নাহ পাবলিকেশন্স, ঝিনাইদহ, বাংলাদেশ', 'www.assunnahtrust.com'],
    },
  },
  {
    id: 'islami-akida',
    title: 'ইসলামী আকীদা',
    category: 'আকীদা',
    subtitle: 'কুরআন-সুন্নাহর আলোকে',
    description:
      'এই গ্রন্থে ড. খোন্দকার আব্দুল্লাহ জাহাঙ্গীর (রাহিমাহুল্লাহ) ইসলামী আকীদার মৌলিক বিষয়গুলো পবিত্র কুরআন ও সহীহ সুন্নাহর আলোকে সুসংগঠিতভাবে উপস্থাপন করেছেন। সালাফে সালিহীনের পথ অনুসরণ করে আধুনিক প্রশ্ন ও ভ্রান্ত ধারণা থেকে মুক্ত থাকার জন্য এটি একটি গুরুত্বপূর্ণ পাঠ্যসূচি।',
    cover: require('../../assets/book-islami-akida.png'),
    driveFileId: '1Jl6iQJVOWDZ-Ekyot0dJjyXOxOq3l-h4',
    priceBdt: 100,
    author: {
      name: 'ড. খোন্দকার আব্দুল্লাহ জাহাঙ্গীর (রাহিমাহুল্লাহ)',
      profession: 'সহযোগী অধ্যাপক, আল-হাদীস বিভাগ, ইসলামী বিশ্ববিদ্যালয়, কুষ্টিয়া',
      extraEducation: 'পি-এইচ. ডি. (রিয়াদ), এম. এ. (রিয়াদ), এম.এম. (ঢাকা)',
      roles: ['প্রকাশক: আস-সুন্নাহ পাবলিকেশন্স, ঝিনাইদহ, বাংলাদেশ', 'www.assunnahtrust.com'],
    },
  },
  {
    id: 'salatur-rasul',
    title: 'ছালাতুর রাসূল (ছাঃ)',
    category: 'নামাজ ও সালাত',
    subtitle: 'রাসূলুল্লাহ ﷺ-এর সালাত সম্পর্কিত গ্রন্থ',
    description:
      'মুহাম্মাদ আসাদুল্লাহ আল-গালিব রচিত এই গ্রন্থে রাসূলুল্লাহ ﷺ-এর সালাতের বর্ণনা, বৈশিষ্ট্য ও অনুসরণীয়তা বিষয়ক আলোচনা উপস্থাপিত হয়েছে। সালাতকে কেন্দ্র করে সুন্নাহ ভিত্তিক বোঝাপড়া গড়ে তুলতে এটি পাঠকদের জন্য উপকারী।',
    cover: require('../../assets/book-salatur-rasul.png'),
    driveFileId: '1z-gxTqVKWpBrrQcWRHbqd3WbYzMDX9dA',
    priceBdt: 100,
    author: {
      name: 'মুহাম্মাদ আসাদুল্লাহ আল-গালিব',
      profession: 'লেখক ও ইসলামী চিন্তাবিদ',
    },
  },
  {
    id: 'seeratur-rasul',
    title: 'সীরাতুর রাসূল (ছাঃ)',
    category: 'সীরাত',
    subtitle: 'নবীদের কাহিনী-৩',
    description:
      'মুহাম্মাদ আসাদুল্লাহ আল-গালিব রচিত 「নবীদের কাহিনী」 সিরিজের এই খণ্ডে রাসূলুল্লাহ ﷺ-এর জীবন, চরিত্র ও সীরাত বিষয়ক আলোচনা উপস্থাপিত হয়েছে। পাঠক সঠিক সূত্র ও প্রেক্ষাপটে নবীজী ﷺ-কে জানতে ও অনুসরণ করতে পারবেন।',
    cover: require('../../assets/book-seeratur-rasul.png'),
    driveFileId: '1xnnlOssdgwTxl9Vy6rsojVpqtmqeDDqD',
    priceBdt: 100,
    author: {
      name: 'মুহাম্মাদ আসাদুল্লাহ আল-গালিব',
      profession: 'লেখক ও ইসলামী চিন্তাবিদ',
      roles: ['প্রকাশ: হাদীছ ফাউণ্ডেশন বাংলাদেশ'],
    },
  },
];

export const BOOKS_BY_ID = Object.fromEntries(BOOKS.map((b) => [b.id, b]));

export function drivePreviewUrl(fileId) {
  return `https://drive.google.com/file/d/${fileId}/preview`;
}

export function driveDownloadUrl(fileId) {
  return `https://drive.google.com/uc?export=download&id=${fileId}`;
}
