/* =============================================================================
   i18n.js — languages for एक सवाल · Ek Sawal

   Uttarakhand is not a one-language state. Hindi is official, but a citizen in
   Pauri speaks Garhwali, in Almora Kumaoni, and the Terai belt carries large
   Punjabi, Urdu, Bengali and Nepali speaking populations.

   THREE TIERS, stated plainly, because a government department must know
   exactly what it is signing off:

     tier 1  full    UI, service content and voice complete.
     tier 2  spoken  Voice input + interface. Garhwali and Kumaoni are spoken
                     languages whose readers read Devanagari, so answers appear
                     in Hindi. No ASR model exists for either, so speech uses
                     the Hindi model and the matcher carries regional words.
     tier 3  draft   Interface translated, voice native. Service content falls
                     back to Hindi. STRINGS NEED NATIVE REVIEW before launch —
                     flagged in the UI and in HANDOVER.md.

   Adding a language = adding one object here. Nothing else changes.
   ============================================================================= */

(function (global) {
  'use strict';

  /* `live: false` parks a language without deleting anything. Its string table
     below stays intact, so switching it back on is this one flag — nothing else
     in the codebase changes.

     Punjabi, Urdu, Bengali and Nepali are parked for now: their strings were
     drafted but never checked by a native speaker, and shipping unreviewed
     text to citizens in a government service is not a risk worth taking.
     Turn them on once a reviewer has signed each one off. */
  var LANGS = [
    { code: 'hi',  name: 'हिन्दी',   en: 'Hindi',    asr: 'hi-IN', tts: 'hi-IN', tier: 1, dir: 'ltr', live: true },
    { code: 'en',  name: 'English',  en: 'English',  asr: 'en-IN', tts: 'en-IN', tier: 1, dir: 'ltr', live: true },
    { code: 'gbm', name: 'गढ़वळी',    en: 'Garhwali', asr: 'hi-IN', tts: 'hi-IN', tier: 2, dir: 'ltr', content: 'hi', live: true },
    { code: 'kfy', name: 'कुमाऊँनी',  en: 'Kumaoni',  asr: 'hi-IN', tts: 'hi-IN', tier: 2, dir: 'ltr', content: 'hi', live: true },

    /* ---- parked: awaiting native review. Strings are written and kept. ---- */
    { code: 'pa',  name: 'ਪੰਜਾਬੀ',    en: 'Punjabi',  asr: 'pa-IN', tts: 'pa-IN', tier: 3, dir: 'ltr', content: 'hi', live: false },
    { code: 'ur',  name: 'اردو',     en: 'Urdu',     asr: 'ur-IN', tts: 'ur-IN', tier: 3, dir: 'rtl', content: 'hi', live: false },
    { code: 'bn',  name: 'বাংলা',     en: 'Bengali',  asr: 'bn-IN', tts: 'bn-IN', tier: 3, dir: 'ltr', content: 'hi', live: false },
    { code: 'ne',  name: 'नेपाली',    en: 'Nepali',   asr: 'ne-NP', tts: 'ne-NP', tier: 3, dir: 'ltr', content: 'hi', live: false }
  ];

  function liveLangs() { return LANGS.filter(function (l) { return l.live; }); }

  var STR = {};

  STR.hi = {
    eyebrow: 'नागरिक सेवा',
    h1: 'आपको क्या चाहिए?',
    sub: 'विभाग का नाम जानने की ज़रूरत नहीं। बताइए दिक्कत क्या है — हम बताएँगे कौन सा कागज़, कितना खर्च, कितने दिन और कहाँ जाना है।',
    ph: 'जैसे: बेटी की पढ़ाई के लिए मदद चाहिए',
    mic: 'बोलिए', go: 'पूछिए',
    sith: 'या अपनी स्थिति चुनिए', sitsub: 'सबसे ज़्यादा पूछी जाने वाली बातें',
    b1: 'एक सवाल', b2: 'Ek Sawal',
    langPick: 'भाषा चुनिए', langLabel: 'भाषा', close: 'बंद कीजिए',
    nomic: 'इस ब्राउज़र में बोलकर पूछने की सुविधा नहीं है। ऊपर लिखकर पूछिए या नीचे से अपनी स्थिति चुनिए — सब वैसे ही काम करेगा।',
    listening: 'सुन रहे हैं… अब बोलिए।',
    micDenied: 'माइक की अनुमति नहीं मिली। नीचे लिखकर पूछ सकते हैं।',
    micUnclear: 'आवाज़ साफ़ नहीं आई। दोबारा कोशिश कीजिए या लिखकर पूछिए।',
    micNoLang: 'इस भाषा में बोलना इस फ़ोन पर उपलब्ध नहीं है — हिन्दी में सुना जा रहा है।',

    plainWords: 'सीधी बात', docsRequired: 'क्या-क्या साथ ले जाना है',
    whoCanGet: 'कौन ले सकता है', otherThings: 'और ज़रूरी बातें',
    cost: 'खर्च', days: 'कितने दिन', whereToGo: 'कहाँ जाना है',
    free: 'मुफ़्त', ask: 'पूछें', noFees: 'कोई फीस नहीं', dayUnit: 'दिन',
    guaranteed: 'सेवा का अधिकार', documents: 'कागज़',
    whoSigns: 'कौन साइन करता है', ifLate: 'समय पर न मिले तो',
    appealHere: 'इनसे शिकायत कीजिए, यह आपका कानूनी हक़ है',
    howLongValid: 'कब तक चलेगा',
    printList: 'यह लिस्ट प्रिंट कीजिए', officialPortal: 'सरकारी पोर्टल',
    askElse: 'कुछ और पूछिए', callNow: 'पर अभी फोन कीजिए',
    readyAll: 'सब कुछ तैयार है — अब जा सकते हैं ✓', readyN: 'तैयार',
    digilocker: '"DigiLocker" लिखे कागज़ फोन में पहले से रखे जा सकते हैं — फोटोकॉपी की ज़रूरत नहीं।',
    softNote: 'शायद आपका मतलब यह है। सही न हो तो नीचे "कुछ और पूछिए" दबाइए।',

    needIdHead: 'आवेदन संख्या चाहिए',
    needIdBody: 'स्थिति देखने के लिए वह नंबर चाहिए जो आपकी रसीद पर लिखा है — जैसे UK-REV-2026-8942। वह नंबर ऊपर लिखकर दोबारा पूछिए।',
    needIdNote: 'रसीद नहीं मिल रही? 1905 पर फोन कीजिए — वहाँ आपके मोबाइल नंबर से भी बताया जा सकता है।',
    status: 'स्थिति',
    trackBody: 'यह नंबर सही बना हुआ है। एक सवाल अभी सरकारी डेटाबेस से नहीं जुड़ा है, इसलिए हम स्थिति खुद नहीं बता सकते — और अंदाज़ा नहीं लगाएँगे। नीचे का बटन दबाइए: आधिकारिक पेज खुलेगा और नंबर कॉपी हो चुका है।',
    openStatus: 'आधिकारिक स्थिति पेज खोलिए',
    nothingGuessed: 'कोई अनुमान नहीं लगाया गया। स्थिति सिर्फ़ सरकारी पोर्टल ही बता सकता है।',

    chooseHead: 'इनमें से कौन सा?',
    chooseSub: 'आपकी बात एक से ज़्यादा सेवाओं से मिलती है। सही वाला चुनिए।',
    unknownHead: 'यह बात पूरी तरह समझ नहीं आई',
    unknownSub: 'गलत जवाब देने से अच्छा है कि पूछ लें। नीचे से चुनिए, या अपनी बात दूसरे शब्दों में कहिए।',
    tellMore: 'थोड़ा और बताइए', youAsked: 'आपने पूछा: ',

    greetHead: 'नमस्ते',
    greeting: 'नमस्ते। अपनी बात अपने शब्दों में बताइए — जैसे "बेटी की पढ़ाई के लिए मदद चाहिए" या "पानी की शिकायत करनी है"। विभाग का नाम जानने की ज़रूरत नहीं है।',

    srcPortal: 'यह सेवा eservices.uk.gov.in पर सूचीबद्ध है। शुल्क और समय-सीमा विभाग की RTS अधिसूचना से।',
    srcKnown: 'सार्वजनिक रूप से प्रकाशित योजना जानकारी। नवीनतम शासनादेश से पुष्टि करें।',
    srcWarn: 'इस योजना की रकम और शर्तें बदलती रहती हैं। आवेदन से पहले 1905 पर एक बार पुष्टि कर लीजिए।',
    printFooter: 'यह सूची एक सवाल से बनी है। यह सरकारी रसीद नहीं है और कोई आवेदन जमा नहीं हुआ है।',

    f1: 'एक सवाल एक प्रस्ताव है, सरकारी सेवा नहीं।',
    f2: 'यहाँ कोई आवेदन जमा नहीं होता और कोई रसीद जारी नहीं होती। हम बताते हैं कि क्या चाहिए और कहाँ जाना है, फिर आपको आधिकारिक पोर्टल पर भेज देते हैं।',
    f3: 'आधिकारिक सेवाएँ:', f4: 'पूरा पेज 42 KB · कोई लॉगिन नहीं · कोई कुकी नहीं',
    proto1: 'प्रस्तावित प्रोटोटाइप', proto2: 'यह आधिकारिक सरकारी वेबसाइट नहीं है',
    draftWarn: 'इस भाषा का अनुवाद अभी जाँचा जाना बाकी है। जानकारी हिन्दी में दिखाई जा रही है।',
    offline: 'इंटरनेट नहीं है — पहले खोली गई जानकारी अब भी काम कर रही है।'
  };

  STR.en = {
    eyebrow: 'Citizen Services',
    h1: 'What do you need?',
    sub: 'You do not need to know the department. Say what the problem is — we will tell you which paper, what it costs, how many days and where to go.',
    ph: 'e.g. need help for my daughter’s studies',
    mic: 'Speak', go: 'Ask',
    sith: 'Or pick your situation', sitsub: 'The things people ask about most',
    b1: 'Ek Sawal', b2: 'एक सवाल',
    langPick: 'Choose a language', langLabel: 'Language', close: 'Close',
    nomic: 'This browser cannot listen. Type your question above or pick a situation below — everything works the same way.',
    listening: 'Listening… speak now.',
    micDenied: 'Microphone permission was refused. You can type your question below.',
    micUnclear: 'That was not clear. Try again, or type your question.',
    micNoLang: 'Speaking this language is not available on this phone — listening in Hindi instead.',

    plainWords: 'In plain words', docsRequired: 'Documents Required',
    whoCanGet: 'Who can get this', otherThings: 'Other things to know',
    cost: 'Cost', days: 'Processing Time', whereToGo: 'Where to Apply',
    free: 'FREE', ask: 'ASK', noFees: 'No Fees', dayUnit: 'DAYS',
    guaranteed: 'Guaranteed', documents: 'documents',
    whoSigns: 'Who signs it', ifLate: 'If it is late',
    appealHere: 'appeal here — this is your legal right',
    howLongValid: 'How long it is valid',
    printList: 'Print this list', officialPortal: 'Official portal',
    askElse: 'Ask something else', callNow: 'Call now on',
    readyAll: 'Everything is ready — you can go now ✓', readyN: 'ready',
    digilocker: 'Documents marked "DigiLocker" can already be on your phone — no photocopies needed.',
    softNote: 'This may be what you meant. If it is not right, press "Ask something else" below.',

    needIdHead: 'The application number is needed',
    needIdBody: 'To check a status we need the number printed on your receipt — for example UK-REV-2026-8942. Type that number above and ask again.',
    needIdNote: 'Cannot find the receipt? Dial 1905 — they can also look it up from your mobile number.',
    status: 'Status',
    trackBody: 'The number is correctly formed. Ek Sawal is not connected to the government database yet, so we cannot report the status ourselves — and we will not guess. Press the button below: the official page opens and the number is already copied.',
    openStatus: 'Open the official status page',
    nothingGuessed: 'Nothing was guessed. Only the government portal can report a real status.',

    chooseHead: 'Which one of these?',
    chooseSub: 'Your question matches more than one service. Pick the right one.',
    unknownHead: 'I did not fully understand that',
    unknownSub: 'Better to ask than to answer wrongly. Pick one below, or say it in different words.',
    tellMore: 'Tell me a little more', youAsked: 'You asked: ',

    greetHead: 'Hello',
    greeting: 'Hello. Tell me your situation in your own words — like "need help for my daughter’s studies" or "want to complain about water". You do not need to know the department.',

    srcPortal: 'Listed on eservices.uk.gov.in. Fee and time limit from the department RTS notification.',
    srcKnown: 'Publicly published scheme information. Confirm against the latest government order.',
    srcWarn: 'Amounts and conditions for this scheme change. Confirm once on 1905 before applying.',
    printFooter: 'This list was produced by Ek Sawal. It is not a government receipt and no application has been submitted.',

    f1: 'Ek Sawal is a proposal, not a government service.',
    f2: 'No application is submitted here and no receipt is issued. We tell you what is needed and where to go, then hand you to the official portal.',
    f3: 'Official services:', f4: 'Whole page 42 KB · no login · no cookies',
    proto1: 'Proposed prototype', proto2: 'not an official Government of Uttarakhand website',
    draftWarn: 'This language is awaiting native review. Information is shown in Hindi.',
    offline: 'No internet — information you already opened still works.'
  };

  /* ---- tier 2: Garhwali. Spoken input is the point; answers stay in Hindi. */
  STR.gbm = {
    eyebrow: 'नागरिक सेवा',
    h1: 'तुमुथैं क्या चयेणु च?',
    sub: 'विभाग कु नौं जाणनै जरवत नीच। बस बता द्या क्या दिक्कत च — हम बतौंला कु कागज़ चयेणु, कतुक खर्च, कतुक दिन अर कख जाण।',
    ph: 'जन: नौनी की पढ़ै कु मदद चयेणि च',
    mic: 'बोल्या', go: 'पूछा',
    sith: 'या अपणि बात चुन्या', sitsub: 'सबसे ज्यादा पूछे जाणि बात',
    b1: 'एक सवाल', b2: 'Ek Sawal',
    langPick: 'भाषा चुन्या', langLabel: 'भाषा',
    listening: 'सुणणा छंवां… अब बोल्या।',
    printList: 'यु लिस्ट प्रिंट कारा', askElse: 'कुछ अर पूछा',
    greetHead: 'नमस्कार',
    greeting: 'नमस्कार। अपणि बात अपणा शब्दुं मां बता द्या — जन "नौनी की पढ़ै कु मदद चयेणि च" या "पाणि की शिकायत कारण च"। विभाग कु नौं जाणनै जरवत नीच।'
  };

  /* ---- tier 2: Kumaoni */
  STR.kfy = {
    eyebrow: 'नागरिक सेवा',
    h1: 'तुमकैं के चैंछ?',
    sub: 'विभाग कि नाम जाणनैकि जरवत न्हैति। बस बताओ के दिक्कत छ — हम बतूंल कै कागज चैंछ, केतुक खर्च, केतुक दिन और कां जाण।',
    ph: 'जस: चेली कि पढ़ाई कि मदद चैंछ',
    mic: 'बोलो', go: 'पुछो',
    sith: 'या आपणि बात चुनो', sitsub: 'सबन बटे ज्यादे पुछी जाणी बात',
    b1: 'एक सवाल', b2: 'Ek Sawal',
    langPick: 'भाषा चुनो', langLabel: 'भाषा',
    listening: 'सुणणा छ्यां… अब बोलो।',
    printList: 'यो लिस्ट प्रिंट करो', askElse: 'कुछ और पुछो',
    greetHead: 'नमस्कार',
    greeting: 'नमस्कार। आपणि बात आपण शब्दों में बताओ — जस "चेली कि पढ़ाई कि मदद चैंछ" या "पाणि कि शिकायत करणि छ"। विभाग कि नाम जाणनैकि जरवत न्हैति।'
  };

  /* ---- tier 3: interface only, awaiting native review ------------------- */
  STR.pa = {
    eyebrow: 'ਨਾਗਰਿਕ ਸੇਵਾ', h1: 'ਤੁਹਾਨੂੰ ਕੀ ਚਾਹੀਦਾ ਹੈ?',
    sub: 'ਵਿਭਾਗ ਦਾ ਨਾਮ ਜਾਣਨ ਦੀ ਲੋੜ ਨਹੀਂ। ਦੱਸੋ ਕੀ ਮੁਸ਼ਕਲ ਹੈ — ਅਸੀਂ ਦੱਸਾਂਗੇ ਕਿਹੜਾ ਕਾਗਜ਼, ਕਿੰਨਾ ਖਰਚ, ਕਿੰਨੇ ਦਿਨ ਅਤੇ ਕਿੱਥੇ ਜਾਣਾ ਹੈ।',
    ph: 'ਜਿਵੇਂ: ਧੀ ਦੀ ਪੜ੍ਹਾਈ ਲਈ ਮਦਦ ਚਾਹੀਦੀ ਹੈ',
    mic: 'ਬੋਲੋ', go: 'ਪੁੱਛੋ',
    sith: 'ਜਾਂ ਆਪਣੀ ਹਾਲਤ ਚੁਣੋ', sitsub: 'ਸਭ ਤੋਂ ਵੱਧ ਪੁੱਛੀਆਂ ਜਾਣ ਵਾਲੀਆਂ ਗੱਲਾਂ',
    b1: 'ਇੱਕ ਸਵਾਲ', b2: 'Ek Sawal',
    langPick: 'ਭਾਸ਼ਾ ਚੁਣੋ', langLabel: 'ਭਾਸ਼ਾ',
    listening: 'ਸੁਣ ਰਹੇ ਹਾਂ… ਹੁਣ ਬੋਲੋ।',
    printList: 'ਇਹ ਸੂਚੀ ਛਾਪੋ', askElse: 'ਕੁਝ ਹੋਰ ਪੁੱਛੋ',
    greetHead: 'ਸਤ ਸ੍ਰੀ ਅਕਾਲ',
    greeting: 'ਸਤ ਸ੍ਰੀ ਅਕਾਲ। ਆਪਣੀ ਗੱਲ ਆਪਣੇ ਸ਼ਬਦਾਂ ਵਿੱਚ ਦੱਸੋ। ਵਿਭਾਗ ਦਾ ਨਾਮ ਜਾਣਨ ਦੀ ਲੋੜ ਨਹੀਂ।'
  };

  STR.ur = {
    eyebrow: 'شہری خدمات', h1: 'آپ کو کیا چاہیے؟',
    sub: 'محکمے کا نام جاننے کی ضرورت نہیں۔ بتائیے مسئلہ کیا ہے — ہم بتائیں گے کون سا کاغذ، کتنا خرچ، کتنے دن اور کہاں جانا ہے۔',
    ph: 'مثلاً: بیٹی کی پڑھائی کے لیے مدد چاہیے',
    mic: 'بولیے', go: 'پوچھیے',
    sith: 'یا اپنی صورتحال چنیے', sitsub: 'سب سے زیادہ پوچھی جانے والی باتیں',
    b1: 'ایک سوال', b2: 'Ek Sawal',
    langPick: 'زبان چنیے', langLabel: 'زبان',
    listening: 'سن رہے ہیں… اب بولیے۔',
    printList: 'یہ فہرست پرنٹ کیجیے', askElse: 'کچھ اور پوچھیے',
    greetHead: 'السلام علیکم',
    greeting: 'السلام علیکم۔ اپنی بات اپنے الفاظ میں بتائیے۔ محکمے کا نام جاننے کی ضرورت نہیں۔'
  };

  STR.bn = {
    eyebrow: 'নাগরিক সেবা', h1: 'আপনার কী প্রয়োজন?',
    sub: 'দপ্তরের নাম জানার দরকার নেই। সমস্যাটা বলুন — আমরা বলে দেব কোন কাগজ, কত খরচ, কত দিন আর কোথায় যেতে হবে।',
    ph: 'যেমন: মেয়ের পড়াশোনার জন্য সাহায্য দরকার',
    mic: 'বলুন', go: 'জিজ্ঞাসা করুন',
    sith: 'অথবা আপনার অবস্থা বেছে নিন', sitsub: 'সবচেয়ে বেশি জিজ্ঞাসিত বিষয়',
    b1: 'এক সওয়াল', b2: 'Ek Sawal',
    langPick: 'ভাষা বাছুন', langLabel: 'ভাষা',
    listening: 'শুনছি… এখন বলুন।',
    printList: 'এই তালিকা প্রিন্ট করুন', askElse: 'আরও কিছু জিজ্ঞাসা করুন',
    greetHead: 'নমস্কার',
    greeting: 'নমস্কার। আপনার কথা নিজের ভাষায় বলুন। দপ্তরের নাম জানার দরকার নেই।'
  };

  STR.ne = {
    eyebrow: 'नागरिक सेवा', h1: 'तपाईंलाई के चाहिन्छ?',
    sub: 'विभागको नाम थाहा पाउनु पर्दैन। समस्या के हो भन्नुहोस् — हामी भन्नेछौं कुन कागज, कति खर्च, कति दिन र कहाँ जाने।',
    ph: 'जस्तै: छोरीको पढाइका लागि मद्दत चाहियो',
    mic: 'बोल्नुहोस्', go: 'सोध्नुहोस्',
    sith: 'वा आफ्नो अवस्था छान्नुहोस्', sitsub: 'सबैभन्दा बढी सोधिने कुरा',
    b1: 'एक सवाल', b2: 'Ek Sawal',
    langPick: 'भाषा छान्नुहोस्', langLabel: 'भाषा',
    listening: 'सुन्दै छौं… अब बोल्नुहोस्।',
    printList: 'यो सूची प्रिन्ट गर्नुहोस्', askElse: 'अरू केही सोध्नुहोस्',
    greetHead: 'नमस्कार',
    greeting: 'नमस्कार। आफ्नो कुरा आफ्नै शब्दमा भन्नुहोस्। विभागको नाम थाहा पाउनु पर्दैन।'
  };

  /* --------------------------------------------------- application flow
     Added for the end-to-end journey. Garhwali and Kumaoni inherit these from
     Hindi through the fallback chain, which is correct — the flow is
     transactional language, and Hindi is what is printed on the forms. */
  Object.assign(STR.hi, {
    stLocker: 'डिजिलॉकर', stDetails: 'आपका विवरण', stDocs: 'कागज़', stVisit: 'मुलाक़ात', stReview: 'जाँच लें',
    back: 'पीछे', next: 'आगे बढ़िए', choose: 'चुनिए', required: 'यह भरना ज़रूरी है',
    fromLocker: 'डिजिलॉकर से', changeIt: 'बदलिए',
    applyNow: 'यहीं आवेदन कीजिए', myApps: 'मेरे आवेदन', noApps: 'अभी कोई आवेदन नहीं है',

    aiRead: 'समझा गया', aiWhy: 'इसीलिए यह सेवा',

    lkTitle: 'डिजिलॉकर जोड़िए, फ़ॉर्म अपने आप भर जाएगा',
    lkBody: 'सरकार के पास आपके जो कागज़ पहले से हैं, वही अपने आप भर देंगे। जो सरकार को पहले से पता है, वह दोबारा पूछना ठीक नहीं।',
    lkFills: 'खाने अपने आप भरेंगे',
    lkDemo: 'यह डेमो डिजिलॉकर है — एक काल्पनिक नागरिक का डेटा। असली आधार या खाता नंबर कहीं नहीं है।',
    lkConnect: 'डिजिलॉकर जोड़िए', lkSkip: 'बिना जोड़े भरूँगा', lkWait: 'जोड़ा जा रहा है…',
    lkOn: 'डिजिलॉकर जुड़ गया', lkFilled: 'खाने अपने आप भर गए', lkDocs: 'आपके लॉकर के कागज़',
    lkMissing: 'ये कागज़ लॉकर में नहीं हैं, साथ ले जाने होंगे:',

    dtLeadOn: 'ज़्यादातर जानकारी भर दी गई है। सिर्फ़ बाक़ी बचे खाने भरिए — किसी भी खाने पर 🎙️ दबाकर बोल भी सकते हैं।',
    dtLeadOff: 'सारी जानकारी भरिए। किसी भी खाने पर 🎙️ दबाकर बोल भी सकते हैं।',

    dcLead: 'जो कागज़ डिजिलॉकर में मिल गए वे अपने आप लग गए। बाकी साथ ले जाइए।',
    dcHave: 'लॉकर से लग गया', dcBring: 'साथ ले जाइए',
    dcCarry: 'ऊपर लिखे कागज़ मुलाक़ात के दिन साथ ले जाइए।',
    dcAll: 'सारे कागज़ लॉकर से लग गए — कुछ साथ ले जाने की ज़रूरत नहीं।',

    vsLead: 'सत्यापन के लिए एक बार जाना होगा —', vsTime: 'समय चुनिए', vsFull: 'भरा है',
    vsNote: 'चुने हुए समय पर जाइए, लाइन में लगने की ज़रूरत नहीं। बदलना हो तो 1905 पर फोन कीजिए।',

    rvLead: 'जमा करने से पहले एक बार देख लीजिए। कुछ गलत हो तो पीछे जाकर बदल सकते हैं।',
    rvVisit: 'आपकी मुलाक़ात', rvBy: 'इस तारीख़ तक मिल जाना चाहिए', rvSave: 'आवेदन सुरक्षित कीजिए',
    rvDemo: 'यह डेमो है। यह आवेदन किसी सरकारी दफ़्तर में जमा नहीं होगा — यह सिर्फ़ आपके फ़ोन में सुरक्षित रहेगा।',

    dnTitle: 'सुरक्षित हो गया', dnHead: 'आपका आवेदन तैयार है',
    dnDemo: 'यह डेमो संख्या है, सरकारी आवेदन संख्या नहीं। असली आवेदन के लिए नीचे दिए सरकारी पोर्टल पर जाइए।',
    dnReal: 'असली पोर्टल पर जाइए', dnClose: 'ठीक है',
    tl1: 'आवेदन तैयार हुआ', tl2: 'दफ़्तर में सत्यापन', tl3: 'प्रमाण पत्र मिलना चाहिए'
  });

  Object.assign(STR.en, {
    stLocker: 'DigiLocker', stDetails: 'Your details', stDocs: 'Documents', stVisit: 'Visit', stReview: 'Check',
    back: 'Back', next: 'Continue', choose: 'Choose', required: 'This one is needed',
    fromLocker: 'from DigiLocker', changeIt: 'Change',
    applyNow: 'Apply right here', myApps: 'My applications', noApps: 'No applications yet',

    aiRead: 'Understood', aiWhy: 'so this is the service',

    lkTitle: 'Connect DigiLocker and the form fills itself',
    lkBody: 'The documents the state already holds for you fill the form. What the government already knows, it should not ask you twice.',
    lkFills: 'fields filled automatically',
    lkDemo: 'This is a demo DigiLocker holding one fictional citizen. No real Aadhaar or account number exists here.',
    lkConnect: 'Connect DigiLocker', lkSkip: 'Fill it in myself', lkWait: 'Connecting…',
    lkOn: 'DigiLocker connected', lkFilled: 'fields filled automatically', lkDocs: 'Documents in your locker',
    lkMissing: 'Not in the locker, so carry these:',

    dtLeadOn: 'Most of it is already filled. Answer only what is left — press 🎙️ on any field to speak instead.',
    dtLeadOff: 'Fill in your details. Press 🎙️ on any field to speak instead.',

    dcLead: 'Documents found in DigiLocker are attached already. Carry the rest.',
    dcHave: 'attached from locker', dcBring: 'carry this one',
    dcCarry: 'Carry the documents marked above on the day of your visit.',
    dcAll: 'Every document came from the locker — nothing to carry.',

    vsLead: 'One visit is needed for verification —', vsTime: 'Pick a time', vsFull: 'full',
    vsNote: 'Arrive at your chosen time; no queue. To change it, call 1905.',

    rvLead: 'Check it once before saving. Go back to correct anything.',
    rvVisit: 'Your visit', rvBy: 'Should be issued by', rvSave: 'Save this application',
    rvDemo: 'This is a demo. It will not be filed with any government office — it is saved only on your phone.',

    dnTitle: 'Saved', dnHead: 'Your application is ready',
    dnDemo: 'This is a demo reference, not a government application number. Use the official portal below to file it for real.',
    dnReal: 'Go to the real portal', dnClose: 'Done',
    tl1: 'Application prepared', tl2: 'Verification at the office', tl3: 'Certificate should be issued'
  });

  /* ------------------------------------------------------------------ API */
  var current = 'hi';

  function meta(code) {
    for (var i = 0; i < LANGS.length; i++) if (LANGS[i].code === (code || current)) return LANGS[i];
    return LANGS[0];
  }

  /* Missing key falls back to Hindi, then English. A half-translated language
     shows correct Hindi rather than a blank or a raw key name. */
  function s(key, code) {
    var c = code || current;
    if (STR[c] && STR[c][key] != null) return STR[c][key];
    if (STR.hi[key] != null) return STR.hi[key];
    return STR.en[key] != null ? STR.en[key] : key;
  }

  /* Which language should SERVICE CONTENT be rendered in? Only hi and en carry
     content; every other language reads Hindi. */
  function contentLang(code) {
    return meta(code).code === 'en' ? 'en' : 'hi';
  }

  global.I18N = {
    /* `langs` is what the picker renders: live languages only. `all` exposes
       the parked ones for tooling and the self-test. */
    langs: liveLangs(),
    all: LANGS,
    get: function () { return current; },
    /* A parked code is refused rather than honoured, so a stale localStorage
       value or an old ?lang= link cannot show unreviewed text to a citizen. */
    set: function (code) {
      var m = meta(code);
      if (m.code === code && m.live) current = code;
      return current;
    },
    meta: meta,
    s: s,
    contentLang: contentLang,
    isDraft: function (code) { return meta(code).tier === 3; },
    strings: STR
  };

})(typeof window !== 'undefined' ? window : this);
