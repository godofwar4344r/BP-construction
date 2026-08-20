/* =============================================================================
   kb.js — Ek Sawal knowledge base
   Uttarakhand citizen services, life-event indexed.

   DATA HONESTY RULE
   Every record carries `src`, one of:
     'portal'  — service exists and is listed on eservices.uk.gov.in (verified
                 live, 16 Aug 2026). Fee / SLA copied from the department RTS
                 notification where known.
     'known'   — widely published scheme figures. Confirm against the current
                 GO before any citizen sees them.
     'draft'   — placeholder. Never shown to a citizen without a warning band.

   The UI renders the provenance. We would rather show "confirm this figure"
   than show a confident wrong number — that is the failure mode that sends a
   person on a 60 km bus ride for nothing.
   ============================================================================= */

(function (global) {
  'use strict';

  /* ---------------------------------------------------------------- documents
     Declared once, referenced by id. One edit fixes every service. */
  const DOC = {
    aadhaar:   { hi: 'आधार कार्ड',                       en: 'Aadhaar card',                    digilocker: true },
    photo:     { hi: 'पासपोर्ट साइज़ फोटो',              en: 'Passport size photo',             digilocker: false },
    pariwar:   { hi: 'परिवार रजिस्टर की नकल',            en: 'Copy of Pariwar Register',        digilocker: true },
    ration:    { hi: 'राशन कार्ड',                        en: 'Ration card',                     digilocker: true },
    income:    { hi: 'आय प्रमाण पत्र',                    en: 'Income certificate',              digilocker: true },
    swaghosh:  { hi: 'स्व-घोषणा पत्र (फॉर्म के साथ मिलेगा)', en: 'Self-declaration (given with the form)', digilocker: false },
    bank:      { hi: 'बैंक पासबुक (आधार से जुड़ी)',       en: 'Bank passbook (Aadhaar-linked)',  digilocker: false },
    tenth:     { hi: '10वीं की अंकतालिका',                en: 'Class 10 marksheet',              digilocker: true },
    twelfth:   { hi: '12वीं की अंकतालिका',                en: 'Class 12 marksheet',              digilocker: true },
    nivas15:   { hi: '15 साल से उत्तराखंड में रहने का सबूत (रजिस्ट्री / खतौनी / स्कूल TC)', en: '15-year residence proof (registry / khatauni / school TC)', digilocker: true },
    khatauni:  { hi: 'ज़मीन की खतौनी',                    en: 'Land record (khatauni)',          digilocker: true },
    caste:     { hi: 'पिता या दादा का जाति प्रमाण पत्र (अगर हो)', en: "Father's or grandfather's caste certificate (if available)", digilocker: true },
    mobile:    { hi: 'चालू मोबाइल नंबर',                  en: 'Working mobile number',           digilocker: false },
    death:     { hi: 'मृत्यु प्रमाण पत्र',                en: 'Death certificate',               digilocker: true },
    hospital:  { hi: 'अस्पताल का जन्म पर्चा',             en: 'Hospital birth slip',             digilocker: false },
    dpr:       { hi: 'बिज़नेस का सादा प्लान (कितना खर्च, क्या काम)', en: 'Simple business plan (cost and activity)', digilocker: false },
    marks:     { hi: 'पढ़ाई का कोई भी सर्टिफिकेट',        en: 'Any education certificate',       digilocker: true },
    disab:     { hi: 'दिव्यांगता प्रमाण पत्र (40% या ज़्यादा)', en: 'Disability certificate (40%+)', digilocker: true },
    affidavit: { hi: 'शपथ पत्र (नोटरी से)',               en: 'Affidavit (notarised)',           digilocker: false },
    property:  { hi: 'ज़मीन/मकान के कागज़',                en: 'Property papers',                 digilocker: true },
    /* Certificates that are themselves prerequisites for another service.
       Caught by the self-test: these were referenced before they existed. */
    character: { hi: 'चरित्र प्रमाण पत्र',                 en: 'Character certificate',           digilocker: true },
    domicile:  { hi: 'मूल निवास प्रमाण पत्र',              en: 'Domicile certificate',            digilocker: true }
  };

  /* --------------------------------------------------------------- offices */
  const WHERE = {
    csc:      { hi: 'नज़दीकी CSC / जन सेवा केंद्र, या खुद ऑनलाइन', en: 'Nearest CSC / Jan Seva Kendra, or online yourself' },
    tehsil:   { hi: 'तहसील कार्यालय',                    en: 'Tehsil office' },
    panchayat:{ hi: 'ग्राम पंचायत कार्यालय',              en: 'Gram Panchayat office' },
    block:    { hi: 'ब्लॉक कार्यालय / समाज कल्याण विभाग', en: 'Block office / Social Welfare dept' },
    dic:      { hi: 'जिला उद्योग केंद्र (DIC)',           en: 'District Industries Centre (DIC)' },
    hospital: { hi: 'कोई भी सरकारी या सूचीबद्ध अस्पताल',  en: 'Any government or empanelled hospital' },
    phone:    { hi: 'फोन पर — 1905 डायल कीजिए',           en: 'By phone — dial 1905' },
    online:   { hi: 'पूरी तरह ऑनलाइन, घर से',             en: 'Fully online, from home' }
  };

  const P_ESERV = 'https://eservices.uk.gov.in/';

  /* -------------------------------------------------------------- services */
  const SERVICES = [
    /* ---- Revenue: the 14 listed live on eservices.uk.gov.in --------------- */
    {
      id: 'income', icon: '💰', src: 'portal',
      hi: 'आय प्रमाण पत्र', en: 'Income Certificate',
      deptHi: 'राजस्व विभाग', deptEn: 'Revenue Department',
      fee: 40, days: 15, rts: true,
      plainHi: 'यह कागज़ बताता है कि आपके घर की साल भर की कमाई कितनी है। छात्रवृत्ति, फीस माफी और ज़्यादातर सरकारी मदद के लिए यही सबसे पहले माँगा जाता है।',
      plainEn: 'This paper states your family\'s yearly income. It is the first thing asked for scholarships, fee waivers and most government help.',
      docs: ['aadhaar', 'photo', 'pariwar', 'swaghosh'],
      signedByHi: 'तहसीलदार', signedByEn: 'Tehsildar',
      appealHi: 'उपजिलाधिकारी (SDM)', appealEn: 'Sub-Divisional Magistrate (SDM)',
      validHi: '6 महीने', validEn: '6 months',
      where: 'csc', url: P_ESERV,
      terms: ['आय', 'आय प्रमाण', 'आमदनी', 'कमाई', 'income', 'income certificate', 'aay', 'aay praman patra', 'salary certificate', 'earning'],
      needs: ['छात्रवृत्ति', 'scholarship', 'fee waiver', 'फीस माफी', 'admission']
    },
    {
      id: 'domicile', icon: '🏠', src: 'portal',
      hi: 'स्थाई निवास प्रमाण पत्र (मूल निवास)', en: 'Domicile / Permanent Resident Certificate',
      deptHi: 'राजस्व विभाग', deptEn: 'Revenue Department',
      fee: 40, days: 15, rts: true,
      plainHi: 'यह साबित करता है कि आप उत्तराखंड के पक्के निवासी हैं। राज्य की सरकारी नौकरी, UKPSC और राज्य कोटे से पढ़ाई के लिए ज़रूरी है।',
      plainEn: 'Proves you are a permanent resident of Uttarakhand. Needed for state government jobs, UKPSC exams and state-quota admissions.',
      docs: ['aadhaar', 'photo', 'nivas15', 'tenth'],
      signedByHi: 'उपजिलाधिकारी (SDM) / तहसीलदार', signedByEn: 'SDM / Tehsildar',
      appealHi: 'जिलाधिकारी (DM)', appealEn: 'District Magistrate (DM)',
      validHi: 'जीवन भर', validEn: 'Lifetime',
      where: 'csc', url: P_ESERV,
      terms: ['मूल निवास', 'स्थाई निवास', 'निवास प्रमाण', 'domicile', 'permanent resident', 'mool niwas', 'sthai niwas', 'residence certificate'],
      needs: ['सरकारी नौकरी', 'government job', 'ukpsc', 'state quota', 'भर्ती']
    },
    {
      id: 'caste', icon: '📋', src: 'portal',
      hi: 'जाति प्रमाण पत्र', en: 'Caste Certificate',
      deptHi: 'राजस्व विभाग', deptEn: 'Revenue Department',
      fee: 40, days: 15, rts: true,
      plainHi: 'SC, ST या OBC वर्ग का सरकारी प्रमाण। स्कूल-कॉलेज में दाखिला, छात्रवृत्ति और नौकरी में आरक्षण के लिए ज़रूरी है।',
      plainEn: 'Official proof of SC, ST or OBC category. Required for school and college admission, scholarships and reservation in jobs.',
      docs: ['aadhaar', 'photo', 'pariwar', 'caste', 'swaghosh'],
      signedByHi: 'तहसीलदार', signedByEn: 'Tehsildar',
      appealHi: 'उपजिलाधिकारी (SDM)', appealEn: 'Sub-Divisional Magistrate (SDM)',
      validHi: 'जीवन भर (OBC के लिए आय वाला हिस्सा 3 साल)', validEn: 'Lifetime (income portion of OBC: 3 years)',
      where: 'csc', url: P_ESERV,
      terms: ['जाति', 'जाति प्रमाण', 'कास्ट', 'sc', 'st', 'obc', 'caste', 'caste certificate', 'jati', 'jati praman patra', 'reservation', 'आरक्षण'],
      needs: ['आरक्षण', 'reservation', 'scholarship', 'छात्रवृत्ति']
    },
    {
      id: 'parvatiya', icon: '⛰️', src: 'portal',
      hi: 'पर्वतीय प्रमाण पत्र', en: 'Hill Resident Certificate',
      deptHi: 'राजस्व विभाग', deptEn: 'Revenue Department',
      fee: 40, days: 15, rts: true,
      plainHi: 'साबित करता है कि आप पहाड़ी क्षेत्र के निवासी हैं। कुछ भर्तियों और योजनाओं में पहाड़ के लोगों को अलग लाभ मिलता है।',
      plainEn: 'Proves you belong to a hill area. Some recruitments and schemes give hill residents a separate benefit.',
      docs: ['aadhaar', 'photo', 'nivas15', 'khatauni'],
      signedByHi: 'तहसीलदार', signedByEn: 'Tehsildar',
      appealHi: 'उपजिलाधिकारी (SDM)', appealEn: 'Sub-Divisional Magistrate (SDM)',
      validHi: 'जीवन भर', validEn: 'Lifetime',
      where: 'csc', url: P_ESERV,
      terms: ['पर्वतीय', 'पहाड़ी प्रमाण', 'parvatiya', 'hill certificate', 'hill resident', 'pahadi'],
      needs: []
    },
    {
      id: 'character', icon: '🤝', src: 'portal',
      hi: 'चरित्र प्रमाण पत्र', en: 'Character Certificate',
      deptHi: 'राजस्व विभाग', deptEn: 'Revenue Department',
      fee: 40, days: 15, rts: true,
      plainHi: 'बताता है कि आप पर कोई आपराधिक मामला दर्ज नहीं है। नौकरी, ठेके और कई फॉर्म में माँगा जाता है।',
      plainEn: 'States that no criminal case is registered against you. Asked for jobs, contracts and many application forms.',
      docs: ['aadhaar', 'photo', 'swaghosh'],
      signedByHi: 'तहसीलदार', signedByEn: 'Tehsildar',
      appealHi: 'उपजिलाधिकारी (SDM)', appealEn: 'Sub-Divisional Magistrate (SDM)',
      validHi: '6 महीने', validEn: '6 months',
      where: 'csc', url: P_ESERV,
      terms: ['चरित्र', 'चरित्र प्रमाण', 'character', 'character certificate', 'charitra', 'police verification', 'पुलिस वेरिफिकेशन'],
      /* Deliberately NOT the bare word "job": it is too generic and used to drag
         unrelated questions here. Only phrases that really mean this document. */
      needs: ['character certificate for job', 'नौकरी के लिए चरित्र', 'ठेका', 'contract']
    },
    {
      id: 'haisiyat', icon: '🏦', src: 'portal',
      hi: 'हैसियत प्रमाण पत्र', en: 'Solvency Certificate',
      deptHi: 'राजस्व विभाग', deptEn: 'Revenue Department',
      fee: null, days: 30, rts: true,
      plainHi: 'बताता है कि आपकी संपत्ति कितने की है। बड़े ठेके, ज़मानत और बैंक गारंटी के लिए माँगा जाता है।',
      plainEn: 'States the value of your property. Asked for large contracts, bail and bank guarantees.',
      docs: ['aadhaar', 'photo', 'property', 'khatauni', 'affidavit'],
      signedByHi: 'उपजिलाधिकारी (SDM)', signedByEn: 'Sub-Divisional Magistrate (SDM)',
      appealHi: 'जिलाधिकारी (DM)', appealEn: 'District Magistrate (DM)',
      validHi: '1 साल', validEn: '1 year',
      where: 'tehsil', url: P_ESERV,
      terms: ['हैसियत', 'haisiyat', 'solvency', 'solvency certificate', 'net worth', 'संपत्ति प्रमाण'],
      needs: ['ठेका', 'contract', 'tender', 'bank guarantee']
    },
    {
      id: 'ews', icon: '📄', src: 'portal',
      hi: 'EWS — आय एवं संपत्ति प्रमाण पत्र', en: 'EWS Income & Asset Certificate',
      deptHi: 'राजस्व विभाग', deptEn: 'Revenue Department',
      fee: 40, days: 15, rts: true,
      plainHi: 'सामान्य वर्ग के गरीब परिवारों के लिए। नौकरी और दाखिले में 10% EWS आरक्षण इसी से मिलता है।',
      plainEn: 'For economically weaker families in the general category. The 10% EWS reservation in jobs and admissions runs on this.',
      docs: ['aadhaar', 'photo', 'pariwar', 'khatauni', 'swaghosh'],
      signedByHi: 'तहसीलदार', signedByEn: 'Tehsildar',
      appealHi: 'उपजिलाधिकारी (SDM)', appealEn: 'Sub-Divisional Magistrate (SDM)',
      validHi: '1 वित्तीय वर्ष', validEn: '1 financial year',
      where: 'csc', url: P_ESERV,
      terms: ['ews', 'ई डब्ल्यू एस', 'आय एवं संपत्ति', 'income and asset', 'economically weaker', 'general category reservation', 'सामान्य वर्ग आरक्षण'],
      needs: ['आरक्षण', 'reservation', 'admission']
    },
    {
      id: 'uttarjeevi', icon: '🕊️', src: 'portal',
      hi: 'उत्तरजीवी प्रमाण पत्र', en: 'Survivor Certificate',
      deptHi: 'राजस्व विभाग', deptEn: 'Revenue Department',
      fee: 40, days: 15, rts: true,
      plainHi: 'किसी की मृत्यु के बाद यह बताता है कि परिवार में कौन-कौन जीवित उत्तराधिकारी है। पेंशन, बैंक और ज़मीन के नाम बदलने में लगता है।',
      plainEn: 'After a death, states who the surviving heirs are. Needed for pension, bank claims and transferring land records.',
      docs: ['aadhaar', 'death', 'pariwar', 'affidavit'],
      signedByHi: 'तहसीलदार', signedByEn: 'Tehsildar',
      appealHi: 'उपजिलाधिकारी (SDM)', appealEn: 'Sub-Divisional Magistrate (SDM)',
      validHi: 'जीवन भर', validEn: 'Lifetime',
      where: 'tehsil', url: P_ESERV,
      terms: ['उत्तरजीवी', 'उत्तराधिकारी', 'वारिस', 'survivor', 'legal heir', 'succession', 'uttarjeevi', 'warish'],
      needs: ['मृत्यु के बाद', 'after death', 'pension transfer', 'बैंक क्लेम']
    },
    {
      id: 'minority', icon: '🕌', src: 'portal',
      hi: 'अल्पसंख्यक प्रमाण पत्र', en: 'Minority Certificate',
      deptHi: 'राजस्व विभाग', deptEn: 'Revenue Department',
      fee: 40, days: 15, rts: true,
      plainHi: 'मुस्लिम, सिख, ईसाई, बौद्ध, जैन और पारसी समुदाय के लिए। अल्पसंख्यक छात्रवृत्ति और योजनाओं में लगता है।',
      plainEn: 'For Muslim, Sikh, Christian, Buddhist, Jain and Parsi communities. Used for minority scholarships and schemes.',
      docs: ['aadhaar', 'photo', 'pariwar', 'swaghosh'],
      signedByHi: 'तहसीलदार', signedByEn: 'Tehsildar',
      appealHi: 'उपजिलाधिकारी (SDM)', appealEn: 'Sub-Divisional Magistrate (SDM)',
      validHi: 'जीवन भर', validEn: 'Lifetime',
      where: 'csc', url: P_ESERV,
      terms: ['अल्पसंख्यक', 'minority', 'minority certificate', 'alpsankhyak'],
      needs: ['छात्रवृत्ति', 'scholarship']
    },
    {
      id: 'freedom', icon: '🎖️', src: 'portal',
      hi: 'स्वतंत्रता संग्राम सेनानी प्रमाण पत्र', en: 'Freedom Fighter Certificate',
      deptHi: 'राजस्व विभाग', deptEn: 'Revenue Department',
      fee: null, days: 30, rts: true,
      plainHi: 'स्वतंत्रता सेनानी या उनके आश्रित परिवार के लिए। पेंशन और आरक्षण का लाभ इसी से मिलता है।',
      plainEn: 'For freedom fighters or their dependants. Pension and reservation benefits run on this.',
      docs: ['aadhaar', 'photo', 'pariwar', 'affidavit'],
      signedByHi: 'जिलाधिकारी (DM)', signedByEn: 'District Magistrate (DM)',
      appealHi: 'मंडलायुक्त', appealEn: 'Divisional Commissioner',
      validHi: 'जीवन भर', validEn: 'Lifetime',
      where: 'tehsil', url: P_ESERV,
      terms: ['स्वतंत्रता सेनानी', 'freedom fighter', 'swatantrata senani'],
      needs: []
    },
    {
      id: 'lic-sahukari', icon: '🧾', src: 'portal',
      hi: 'साहूकारी व्यवसाय लाइसेंस', en: 'Moneylender Licence',
      deptHi: 'राजस्व विभाग', deptEn: 'Revenue Department',
      fee: null, days: 30, rts: true,
      plainHi: 'ब्याज पर पैसा उधार देने का कानूनी लाइसेंस। बिना इसके यह काम करना गैर-कानूनी है।',
      plainEn: 'Legal licence to lend money on interest. Doing this without one is illegal.',
      docs: ['aadhaar', 'photo', 'property', 'affidavit'],
      signedByHi: 'उपजिलाधिकारी (SDM)', signedByEn: 'Sub-Divisional Magistrate (SDM)',
      appealHi: 'जिलाधिकारी (DM)', appealEn: 'District Magistrate (DM)',
      validHi: 'नवीनीकरण ज़रूरी', validEn: 'Renewal required',
      where: 'tehsil', url: P_ESERV,
      terms: ['साहूकारी', 'sahukari', 'moneylender', 'money lender licence', 'ब्याज पर पैसा'],
      needs: []
    },
    {
      id: 'lic-stamp', icon: '🖊️', src: 'portal',
      hi: 'स्टाम्प विक्रेता लाइसेंस', en: 'Stamp Vendor Licence',
      deptHi: 'राजस्व विभाग', deptEn: 'Revenue Department',
      fee: null, days: 30, rts: true,
      plainHi: 'सरकारी स्टाम्प पेपर बेचने का लाइसेंस।',
      plainEn: 'Licence to sell government stamp paper.',
      docs: ['aadhaar', 'photo', 'character', 'affidavit'],
      signedByHi: 'जिलाधिकारी (DM)', signedByEn: 'District Magistrate (DM)',
      appealHi: 'मंडलायुक्त', appealEn: 'Divisional Commissioner',
      validHi: 'नवीनीकरण ज़रूरी', validEn: 'Renewal required',
      where: 'tehsil', url: P_ESERV,
      terms: ['स्टाम्प विक्रेता', 'stamp vendor', 'stamp licence', 'स्टाम्प पेपर बेचना'],
      needs: []
    },
    {
      id: 'lic-arayaj', icon: '✍️', src: 'portal',
      hi: 'अरायज नवीश लाइसेंस', en: 'Deed Writer Licence',
      deptHi: 'राजस्व विभाग', deptEn: 'Revenue Department',
      fee: null, days: 30, rts: true,
      plainHi: 'तहसील में कानूनी कागज़ और अर्ज़ी लिखने का लाइसेंस।',
      plainEn: 'Licence to write legal deeds and applications at the tehsil.',
      docs: ['aadhaar', 'photo', 'marks', 'affidavit'],
      signedByHi: 'जिलाधिकारी (DM)', signedByEn: 'District Magistrate (DM)',
      appealHi: 'मंडलायुक्त', appealEn: 'Divisional Commissioner',
      validHi: 'नवीनीकरण ज़रूरी', validEn: 'Renewal required',
      where: 'tehsil', url: P_ESERV,
      terms: ['अरायज नवीश', 'arayaj', 'deed writer', 'अर्ज़ी नवीस'],
      needs: []
    },
    {
      id: 'character-thekedari', icon: '🏗️', src: 'portal',
      hi: 'चरित्र प्रमाण पत्र (ठेकेदारी हेतु)', en: 'Character Certificate (for contractors)',
      deptHi: 'राजस्व विभाग', deptEn: 'Revenue Department',
      fee: 40, days: 15, rts: true,
      plainHi: 'सरकारी ठेका लेने के लिए अलग से बनने वाला चरित्र प्रमाण पत्र।',
      plainEn: 'A separate character certificate issued for taking government contracts.',
      docs: ['aadhaar', 'photo', 'affidavit'],
      signedByHi: 'तहसीलदार', signedByEn: 'Tehsildar',
      appealHi: 'उपजिलाधिकारी (SDM)', appealEn: 'Sub-Divisional Magistrate (SDM)',
      validHi: '6 महीने', validEn: '6 months',
      where: 'tehsil', url: P_ESERV,
      terms: ['ठेकेदारी चरित्र', 'contractor character', 'thekedari'],
      needs: ['ठेका', 'tender']
    },

    /* ---- Panchayati Raj ---------------------------------------------------- */
    {
      id: 'pariwar-register', icon: '👨‍👩‍👧', src: 'portal',
      hi: 'परिवार रजिस्टर की नकल', en: 'Copy of Pariwar Register',
      deptHi: 'पंचायती राज विभाग', deptEn: 'Panchayati Raj Department',
      fee: 40, days: 3, rts: true,
      plainHi: 'गाँव की पंचायत में रखा वह रजिस्टर जिसमें आपके परिवार के सब सदस्यों के नाम दर्ज हैं। बाकी कई कागज़ों के लिए यही आधार बनता है।',
      plainEn: 'The register kept at your Gram Panchayat listing every member of your family. It is the base document for many others.',
      docs: ['aadhaar'],
      signedByHi: 'ग्राम पंचायत विकास अधिकारी (VPDO)', signedByEn: 'Village Panchayat Development Officer (VPDO)',
      appealHi: 'खंड विकास अधिकारी (BDO)', appealEn: 'Block Development Officer (BDO)',
      validHi: '6 महीने', validEn: '6 months',
      where: 'panchayat', url: P_ESERV,
      terms: ['परिवार रजिस्टर', 'कुटुंब रजिस्टर', 'नकल', 'family register', 'pariwar register', 'kutumb', 'nakal'],
      needs: []
    },

    /* ---- Birth & Death ---------------------------------------------------- */
    {
      id: 'birth', icon: '👶', src: 'known',
      hi: 'जन्म प्रमाण पत्र', en: 'Birth Certificate',
      deptHi: 'पंचायती राज / नगर निकाय', deptEn: 'Panchayati Raj / Urban Local Body',
      fee: 0, days: 7, rts: true,
      plainHi: 'बच्चे के जन्म का सरकारी कागज़। स्कूल में दाखिले, आधार और पासपोर्ट के लिए सबसे पहले यही चाहिए। जन्म के 21 दिन के अंदर मुफ़्त बनता है।',
      plainEn: 'Official record of a child\'s birth. The first thing needed for school admission, Aadhaar and passport. Free if registered within 21 days.',
      docs: ['hospital', 'aadhaar', 'pariwar'],
      signedByHi: 'ग्राम पंचायत अधिकारी / नगर निकाय रजिस्ट्रार', signedByEn: 'Panchayat Officer / Municipal Registrar',
      appealHi: 'खंड विकास अधिकारी (BDO)', appealEn: 'Block Development Officer (BDO)',
      validHi: 'जीवन भर', validEn: 'Lifetime',
      where: 'panchayat', url: 'https://crsorgi.gov.in/',
      terms: ['जन्म प्रमाण', 'जन्म प्रमाण पत्र', 'बच्चे का सर्टिफिकेट', 'birth', 'birth certificate', 'janam praman patra', 'newborn'],
      needs: ['स्कूल में दाखिला', 'school admission', 'आधार', 'passport']
    },
    {
      id: 'death', icon: '🕯️', src: 'known',
      hi: 'मृत्यु प्रमाण पत्र', en: 'Death Certificate',
      deptHi: 'पंचायती राज / नगर निकाय', deptEn: 'Panchayati Raj / Urban Local Body',
      fee: 0, days: 7, rts: true,
      plainHi: 'किसी की मृत्यु का सरकारी कागज़। बीमा, पेंशन, बैंक खाता और ज़मीन के नाम बदलने के लिए ज़रूरी है। 21 दिन के अंदर मुफ़्त।',
      plainEn: 'Official record of a death. Needed for insurance, pension, bank accounts and transferring land. Free within 21 days.',
      docs: ['aadhaar', 'pariwar'],
      signedByHi: 'ग्राम पंचायत अधिकारी / नगर निकाय रजिस्ट्रार', signedByEn: 'Panchayat Officer / Municipal Registrar',
      appealHi: 'खंड विकास अधिकारी (BDO)', appealEn: 'Block Development Officer (BDO)',
      validHi: 'जीवन भर', validEn: 'Lifetime',
      where: 'panchayat', url: 'https://crsorgi.gov.in/',
      terms: ['मृत्यु प्रमाण', 'मृत्यु प्रमाण पत्र', 'death', 'death certificate', 'mrityu praman patra'],
      needs: ['बीमा', 'insurance', 'pension transfer']
    },

    /* ---- Social Welfare: pensions ----------------------------------------- */
    {
      id: 'pension-old', icon: '👴', src: 'known',
      hi: 'वृद्धावस्था पेंशन', en: 'Old Age Pension',
      deptHi: 'समाज कल्याण विभाग', deptEn: 'Social Welfare Department',
      fee: 0, days: 15, rts: true,
      money: { hi: '₹1,500 हर महीने, सीधे बैंक खाते में', en: '₹1,500 every month, straight to the bank account' },
      plainHi: '60 साल से ऊपर के बुज़ुर्गों को हर महीने पेंशन। आवेदन बिल्कुल मुफ़्त है — किसी को पैसे देने की ज़रूरत नहीं।',
      plainEn: 'A monthly pension for people above 60. Applying is completely free — nobody needs to be paid.',
      docs: ['aadhaar', 'bank', 'income', 'pariwar'],
      eligHi: ['उम्र 60 साल या ज़्यादा', 'परिवार की सालाना आय तय सीमा से कम', 'उत्तराखंड का निवासी'],
      eligEn: ['Age 60 or above', 'Family yearly income below the notified limit', 'Resident of Uttarakhand'],
      signedByHi: 'जिला समाज कल्याण अधिकारी (DSWO)', signedByEn: 'District Social Welfare Officer (DSWO)',
      appealHi: 'मुख्य विकास अधिकारी (CDO)', appealEn: 'Chief Development Officer (CDO)',
      validHi: 'हर साल सत्यापन', validEn: 'Yearly verification',
      where: 'block', url: 'https://socialwelfare.uk.gov.in/',
      terms: ['वृद्धावस्था पेंशन', 'बुढ़ापा पेंशन', 'बुज़ुर्ग पेंशन', 'old age pension', 'vridha pension',
              'senior citizen pension', 'elderly pension', 'pension', 'पेंशन'],
      needs: ['पिताजी बुज़ुर्ग', 'माताजी बुज़ुर्ग', 'father old', 'mother old', '60 साल', '65 साल', '70 साल',
              'बुज़ुर्ग', 'बुजुर्ग', 'senior citizen', 'old age', 'budhape mein']
    },
    {
      id: 'pension-widow', icon: '🤍', src: 'known',
      hi: 'विधवा पेंशन', en: 'Widow Pension',
      deptHi: 'समाज कल्याण विभाग', deptEn: 'Social Welfare Department',
      fee: 0, days: 15, rts: true,
      money: { hi: 'हर महीने पेंशन, सीधे बैंक खाते में', en: 'A monthly pension, straight to the bank account' },
      plainHi: 'पति की मृत्यु के बाद महिलाओं के लिए हर महीने की पेंशन। यह वृद्धावस्था पेंशन से अलग योजना है — उम्र 60 से कम हो तब भी मिल सकती है।',
      plainEn: 'A monthly pension for women after a husband\'s death. This is a separate scheme from old age pension — it can apply below 60 too.',
      docs: ['aadhaar', 'bank', 'death', 'income', 'pariwar'],
      eligHi: ['पति की मृत्यु का प्रमाण पत्र', 'परिवार की आय तय सीमा से कम', 'दोबारा विवाह न हुआ हो'],
      eligEn: ['Husband\'s death certificate', 'Family income below the notified limit', 'Not remarried'],
      signedByHi: 'जिला समाज कल्याण अधिकारी (DSWO)', signedByEn: 'District Social Welfare Officer (DSWO)',
      appealHi: 'मुख्य विकास अधिकारी (CDO)', appealEn: 'Chief Development Officer (CDO)',
      validHi: 'हर साल सत्यापन', validEn: 'Yearly verification',
      where: 'block', url: 'https://socialwelfare.uk.gov.in/',
      terms: ['विधवा पेंशन', 'widow pension', 'vidhwa pension', 'पति की मृत्यु पेंशन', 'pension', 'पेंशन'],
      needs: ['पति नहीं रहे', 'husband died', 'विधवा', 'widow', 'vidhwa', 'पति की मृत्यु', 'husband passed away']
    },
    {
      id: 'pension-divyang', icon: '♿', src: 'known',
      hi: 'दिव्यांग पेंशन', en: 'Disability Pension',
      deptHi: 'समाज कल्याण विभाग', deptEn: 'Social Welfare Department',
      fee: 0, days: 15, rts: true,
      money: { hi: 'हर महीने पेंशन, सीधे बैंक खाते में', en: 'A monthly pension, straight to the bank account' },
      plainHi: '40% या उससे ज़्यादा दिव्यांगता वाले लोगों के लिए हर महीने की पेंशन। पहले सरकारी अस्पताल से दिव्यांगता प्रमाण पत्र बनवाना होता है।',
      plainEn: 'A monthly pension for people with 40% or more disability. A disability certificate from a government hospital is needed first.',
      docs: ['aadhaar', 'bank', 'disab', 'income'],
      eligHi: ['दिव्यांगता 40% या ज़्यादा', 'सरकारी अस्पताल का प्रमाण पत्र', 'परिवार की आय तय सीमा से कम'],
      eligEn: ['Disability of 40% or more', 'Certificate from a government hospital', 'Family income below the notified limit'],
      signedByHi: 'जिला समाज कल्याण अधिकारी (DSWO)', signedByEn: 'District Social Welfare Officer (DSWO)',
      appealHi: 'मुख्य विकास अधिकारी (CDO)', appealEn: 'Chief Development Officer (CDO)',
      validHi: 'हर साल सत्यापन', validEn: 'Yearly verification',
      where: 'block', url: 'https://socialwelfare.uk.gov.in/',
      terms: ['दिव्यांग पेंशन', 'विकलांग पेंशन', 'disability pension', 'divyang pension', 'handicap pension',
              'दिव्यांगता', 'pension', 'पेंशन'],
      needs: ['दिव्यांग', 'विकलांग', 'disabled', 'handicapped', 'disability', 'चल नहीं सकते', 'देख नहीं सकते']
    },

    /* ---- Women & Child ----------------------------------------------------- */
    {
      id: 'nanda-gaura', icon: '👧', src: 'known',
      hi: 'नंदा गौरा योजना', en: 'Nanda Gaura Scheme',
      deptHi: 'महिला सशक्तिकरण एवं बाल विकास', deptEn: 'Women Empowerment & Child Development',
      fee: 0, days: 30, rts: true,
      money: { hi: 'बेटी के जन्म पर ₹11,000 और 12वीं पास करने पर ₹51,000', en: '₹11,000 at a girl\'s birth and ₹51,000 on passing Class 12' },
      plainHi: 'बेटी के जन्म पर और 12वीं पास करने पर सरकार सीधे पैसे देती है, ताकि आगे की पढ़ाई न रुके। पैसा बेटी के अपने बैंक खाते में आता है।',
      plainEn: 'The state pays money directly at a girl\'s birth and again when she passes Class 12, so her studies do not stop. It goes into the girl\'s own bank account.',
      docs: ['aadhaar', 'twelfth', 'income', 'bank', 'affidavit'],
      eligHi: ['बेटी ने उत्तराखंड से 12वीं पास की हो', 'परिवार की सालाना आय तय सीमा से कम', 'आवेदन के समय अविवाहित'],
      eligEn: ['The girl passed Class 12 from Uttarakhand', 'Family yearly income below the notified limit', 'Unmarried at the time of applying'],
      signedByHi: 'जिला कार्यक्रम अधिकारी (DPO)', signedByEn: 'District Programme Officer (DPO)',
      appealHi: 'मुख्य विकास अधिकारी (CDO)', appealEn: 'Chief Development Officer (CDO)',
      validHi: 'एक बार का लाभ', validEn: 'One-time benefit',
      where: 'block', url: 'https://wecd.uk.gov.in/',
      terms: ['नंदा गौरा', 'गौरा देवी', 'कन्याधन', 'नंदा देवी', 'nanda gaura', 'gaura devi', 'kanyadhan', 'girl child scheme'],
      needs: ['बेटी', 'लड़की', 'daughter', 'girl', '12वीं पास', 'passed 12th', 'कॉलेज की फीस', 'college fee',
              'बेटी की पढ़ाई', 'beti ki padhai', 'daughter studies', 'बेटी की शिक्षा', 'girl education help',
              'बेटी के लिए मदद']
    },

    /* ---- Employment -------------------------------------------------------- */
    {
      id: 'msy', icon: '💼', src: 'known',
      hi: 'मुख्यमंत्री स्वरोजगार योजना (MSY)', en: 'Mukhyamantri Swarojgar Yojana (MSY)',
      deptHi: 'उद्योग विभाग (MSME)', deptEn: 'MSME & Industries Department',
      fee: 0, days: 20, rts: true,
      money: { hi: 'बैंक से ₹25 लाख तक का लोन, जिसमें 15% से 25% सरकार की सब्सिडी', en: 'A bank loan up to ₹25 lakh, with 15%–25% government subsidy' },
      plainHi: 'अपना काम शुरू करने के लिए — दुकान, होमस्टे, डेयरी, छोटा उद्योग। बैंक लोन देता है और सरकार उसका एक हिस्सा सब्सिडी के तौर पर माफ़ करती है। पहाड़ी ज़िलों में सब्सिडी ज़्यादा है।',
      plainEn: 'For starting your own work — a shop, homestay, dairy, small unit. The bank gives the loan and the government writes off a part as subsidy. Hill districts get the higher rate.',
      docs: ['aadhaar', 'domicile', 'dpr', 'marks', 'bank'],
      eligHi: ['उत्तराखंड का स्थाई निवासी', 'उम्र आमतौर पर 18 साल से ऊपर', 'किसी बैंक का डिफॉल्टर न हो'],
      eligEn: ['Permanent resident of Uttarakhand', 'Usually above 18 years of age', 'Not a defaulter with any bank'],
      signedByHi: 'महाप्रबंधक, जिला उद्योग केंद्र (DIC)', signedByEn: 'General Manager, District Industries Centre (DIC)',
      appealHi: 'निदेशक, उद्योग निदेशालय', appealEn: 'Director, Directorate of Industries',
      validHi: 'लोन मंज़ूरी तक', validEn: 'Until loan sanction',
      where: 'dic', url: 'https://msy.uk.gov.in/',
      terms: ['स्वरोजगार', 'मुख्यमंत्री स्वरोजगार', 'msy', 'swarojgar', 'self employment', 'business loan',
              'homestay loan', 'दुकान खोलनी', 'बिज़नेस लोन', 'अपना काम', 'dukan kholni', 'apna kaam',
              'dukan kholni hai', 'business shuru'],
      needs: ['नौकरी चली गई', 'बेरोज़गार', 'lost job', 'unemployed', 'start business', 'दुकान', 'होमस्टे',
              'डेयरी', 'shop', 'startup', 'lost my job', 'job is gone', 'job gone', 'no work', 'बेरोजगार',
              'open a shop', 'start a shop', 'dukan', 'homestay', 'dairy', 'naukri chali gayi',
              'काम नहीं है', 'रोज़गार', 'rozgar', 'loan for business']
    },

    /* ---- Health ------------------------------------------------------------ */
    {
      id: 'ayushman', icon: '🏥', src: 'known',
      hi: 'अटल आयुष्मान उत्तराखंड योजना', en: 'Atal Ayushman Uttarakhand Yojana',
      deptHi: 'चिकित्सा स्वास्थ्य विभाग', deptEn: 'Medical Health & Family Welfare',
      fee: 0, days: 1, rts: true,
      money: { hi: 'हर परिवार को साल में ₹5 लाख तक का मुफ़्त इलाज', en: 'Up to ₹5 lakh of free treatment per family per year' },
      plainHi: 'भर्ती होकर इलाज कराने पर पैसे नहीं देने पड़ते — सरकार सीधे अस्पताल को देती है। कार्ड मुफ़्त बनता है और आमतौर पर उसी दिन मिल जाता है।',
      plainEn: 'You pay nothing for hospital treatment — the state pays the hospital directly. The card is free and is usually issued the same day.',
      docs: ['ration', 'aadhaar'],
      eligHi: ['उत्तराखंड का निवासी परिवार', 'राशन कार्ड में नाम दर्ज हो'],
      eligEn: ['A family resident in Uttarakhand', 'Name listed on the ration card'],
      signedByHi: 'राज्य स्वास्थ्य प्राधिकरण (SHA)', signedByEn: 'State Health Authority (SHA)',
      appealHi: 'मुख्य चिकित्सा अधिकारी (CMO)', appealEn: 'Chief Medical Officer (CMO)',
      validHi: 'हर साल नवीनीकरण', validEn: 'Renewed yearly',
      where: 'hospital', url: 'https://ayushmanuttarakhand.org/',
      terms: ['आयुष्मान', 'अटल आयुष्मान', 'गोल्डन कार्ड', 'ayushman', 'golden card', 'health card', 'मुफ्त इलाज', 'free treatment'],
      needs: ['अस्पताल', 'इलाज', 'ऑपरेशन', 'बीमारी', 'hospital', 'surgery', 'medical bill', 'treatment cost',
              'दवा का खर्च', 'hospital bill', 'इलाज का खर्च', 'operation ka kharcha', 'ilaj', 'admit',
              'भर्ती करना', 'cannot afford treatment', 'पैसे नहीं इलाज']
    },

    /* ---- Food & Civil Supplies --------------------------------------------- */
    {
      id: 'ration', icon: '🌾', src: 'known',
      hi: 'राशन कार्ड (नया / सुधार)', en: 'Ration Card (new / correction)',
      deptHi: 'खाद्य एवं नागरिक आपूर्ति विभाग', deptEn: 'Food & Civil Supplies Department',
      fee: 0, days: 30, rts: true,
      money: { hi: 'सस्ता अनाज हर महीने, और आयुष्मान कार्ड इसी से बनता है', en: 'Subsidised grain every month, and the Ayushman card runs off it' },
      plainHi: 'राशन कार्ड से हर महीने सस्ता अनाज मिलता है। यह सिर्फ़ अनाज के लिए नहीं — आयुष्मान कार्ड, छात्रवृत्ति और कई योजनाओं में परिवार का सबूत यही बनता है।',
      plainEn: 'A ration card gets you subsidised grain every month. It is not only for grain — it is also the family proof used for the Ayushman card, scholarships and many schemes.',
      docs: ['aadhaar', 'photo', 'pariwar', 'bank'],
      eligHi: ['उत्तराखंड का निवासी परिवार', 'किसी और राज्य में राशन कार्ड न हो'],
      eligEn: ['A family resident in Uttarakhand', 'No ration card in another state'],
      signedByHi: 'क्षेत्रीय खाद्य अधिकारी / पूर्ति निरीक्षक', signedByEn: 'Regional Food Officer / Supply Inspector',
      appealHi: 'जिला पूर्ति अधिकारी (DSO)', appealEn: 'District Supply Officer (DSO)',
      validHi: 'नवीनीकरण पर', validEn: 'Until renewal',
      where: 'csc', url: 'https://fcs.uk.gov.in/',
      terms: ['राशन कार्ड', 'ration card', 'ration', 'राशन', 'खाद्य सुरक्षा', 'food security card',
              'नया राशन कार्ड', 'यूनिट जुड़वानी', 'apl', 'bpl', 'nfsa'],
      needs: ['सस्ता अनाज', 'गेहूँ चावल', 'राशन नहीं मिल रहा', 'नाम जुड़वाना', 'add name in ration',
              'cheap grain', 'subsidised food']
    },

    /* ---- Agriculture -------------------------------------------------------- */
    {
      id: 'kisan', icon: '🚜', src: 'known',
      hi: 'किसान क्रेडिट कार्ड एवं पीएम-किसान', en: 'Kisan Credit Card & PM-KISAN',
      deptHi: 'कृषि विभाग', deptEn: 'Agriculture Department',
      fee: 0, days: 15, rts: true,
      money: { hi: 'खेती के लिए सस्ता लोन (4% ब्याज तक), और पीएम-किसान से साल में ₹6,000', en: 'Cheap crop loan (interest as low as 4%), plus ₹6,000 a year under PM-KISAN' },
      plainHi: 'खेती के लिए बीज, खाद और मज़दूरी का खर्च उठाने को सस्ता बैंक लोन। साथ में पीएम-किसान से साल के ₹6,000 सीधे खाते में तीन किस्तों में आते हैं।',
      plainEn: 'A cheap bank loan for seed, fertiliser and labour costs. Alongside it, PM-KISAN pays ₹6,000 a year straight into the account in three instalments.',
      docs: ['aadhaar', 'khatauni', 'bank', 'photo'],
      eligHi: ['अपने नाम या परिवार के नाम खेती की ज़मीन', 'बैंक खाता आधार से जुड़ा हो'],
      eligEn: ['Farm land in your own or family name', 'Bank account linked to Aadhaar'],
      signedByHi: 'बैंक शाखा प्रबंधक / कृषि अधिकारी', signedByEn: 'Bank Branch Manager / Agriculture Officer',
      appealHi: 'मुख्य कृषि अधिकारी (CAO)', appealEn: 'Chief Agriculture Officer (CAO)',
      validHi: '5 साल, हर साल नवीनीकरण', validEn: '5 years, renewed annually',
      where: 'block', url: 'https://pmkisan.gov.in/',
      terms: ['किसान क्रेडिट कार्ड', 'kcc', 'kisan credit card', 'पीएम किसान', 'pm kisan', 'pm-kisan',
              'खेती का लोन', 'farmer loan', 'crop loan', 'किसान लोन', 'kisan samman nidhi'],
      needs: ['खेती', 'फसल', 'बीज खाद', 'farming', 'crop', 'खेत', 'किसान', 'farmer', 'agriculture help']
    },

    /* ---- Grievance --------------------------------------------------------- */
    {
      id: 'helpline-1905', icon: '📣', src: 'known',
      hi: 'मुख्यमंत्री हेल्पलाइन 1905', en: 'CM Helpline 1905',
      deptHi: 'मुख्यमंत्री कार्यालय एवं ITDA', deptEn: 'Chief Minister\'s Office & ITDA',
      fee: 0, days: 7, rts: true,
      plainHi: 'पानी, बिजली, सड़क, राशन, सफाई — किसी भी सरकारी विभाग की शिकायत। बस 1905 डायल कीजिए। कोई कागज़ नहीं चाहिए, सिर्फ़ आपका मोबाइल नंबर।',
      plainEn: 'Water, electricity, roads, ration, sanitation — a complaint about any government department. Just dial 1905. No documents needed, only your mobile number.',
      docs: ['mobile'],
      signedByHi: 'नोडल अधिकारी एवं जिलाधिकारी', signedByEn: 'Nodal Officer and District Magistrate',
      appealHi: 'मुख्यमंत्री कार्यालय', appealEn: 'Chief Minister\'s Office',
      validHi: '—', validEn: '—',
      where: 'phone', url: 'https://cmhelpline.uk.gov.in/',
      phone: '1905',
      terms: ['शिकायत', 'हेल्पलाइन', '1905', 'complaint', 'grievance', 'helpline', 'शिकायत दर्ज'],
      needs: ['पानी नहीं आ रहा', 'पाइप टूटी', 'बिजली नहीं', 'सड़क खराब', 'गड्ढा', 'कचरा', 'अधिकारी नहीं सुन रहा', 'no water', 'broken pipe', 'no electricity', 'pothole', 'garbage', 'road bad', 'रिश्वत माँगी']
    },

    /* ---- Police ------------------------------------------------------------ */
    {
      id: 'efir', icon: '🚨', src: 'known',
      hi: 'ऑनलाइन FIR / खोई वस्तु की रिपोर्ट', en: 'Online FIR / Lost Article Report',
      deptHi: 'गृह विभाग (उत्तराखंड पुलिस)', deptEn: 'Home Department (Uttarakhand Police)',
      fee: 0, days: 1, rts: false,
      plainHi: 'मोबाइल, कागज़ या सामान खो जाए तो थाने जाए बिना ऑनलाइन रिपोर्ट दर्ज कीजिए। रसीद तुरंत मिल जाती है। पूरी तरह मुफ़्त है।',
      plainEn: 'If a phone, documents or belongings are lost, file the report online without going to the police station. The receipt is immediate. Completely free.',
      docs: ['aadhaar', 'mobile'],
      signedByHi: 'थानाध्यक्ष (SHO)', signedByEn: 'Station House Officer (SHO)',
      appealHi: 'पुलिस अधीक्षक (SP)', appealEn: 'Superintendent of Police (SP)',
      validHi: '—', validEn: '—',
      where: 'online', url: 'https://uttarakhandpolice.uk.gov.in/',
      terms: ['fir', 'एफआईआर', 'पुलिस रिपोर्ट', 'खोया', 'चोरी', 'police complaint', 'lost phone', 'theft', 'stolen', 'lost documents'],
      needs: ['मोबाइल खो गया', 'phone lost', 'चोरी हो गई', 'कागज़ खो गए', 'mobile kho gaya',
              'lost my phone', 'documents lost', 'पर्स खो गया', 'चोरी']
    },

    /* ---- Transport --------------------------------------------------------- */
    {
      id: 'dl', icon: '🚗', src: 'known',
      hi: 'ड्राइविंग लाइसेंस / लर्निंग लाइसेंस', en: 'Driving Licence / Learner Licence',
      deptHi: 'परिवहन विभाग', deptEn: 'Transport Department',
      fee: 200, days: 15, rts: false,
      plainHi: 'पहले लर्निंग लाइसेंस बनता है (ऑनलाइन टेस्ट), फिर एक महीने बाद पक्का ड्राइविंग लाइसेंस। यह सेवा भारत सरकार के सारथी पोर्टल पर है।',
      plainEn: 'First a learner licence (online test), then the permanent driving licence a month later. This service runs on the central Sarathi portal.',
      docs: ['aadhaar', 'tenth', 'photo'],
      signedByHi: 'संभागीय परिवहन अधिकारी (RTO)', signedByEn: 'Regional Transport Officer (RTO)',
      appealHi: 'उप परिवहन आयुक्त', appealEn: 'Deputy Transport Commissioner',
      validHi: 'लर्निंग 6 महीने, DL 20 साल', validEn: 'Learner 6 months, DL 20 years',
      where: 'online', url: 'https://sarathi.parivahan.gov.in/',
      terms: ['ड्राइविंग लाइसेंस', 'लाइसेंस', 'लर्निंग', 'driving licence', 'driving license', 'learner licence', 'dl', 'rto', 'sarathi'],
      needs: ['गाड़ी चलाना', 'बाइक चलाना', 'drive car', 'ride bike']
    }
  ];

  /* ------------------------------------------------------- life-event routes
     Plain-language situations, in the words a person actually uses. Each maps
     to one service and carries a sentence that answers the *situation*, not
     just the service. This is what the front page offers instead of a
     department list. */
  const SITUATIONS = [
    {
      id: 'sit-job', icon: '💼', to: 'msy',
      hi: 'नौकरी चली गई, अपना काम शुरू करना है',
      en: 'Lost my job, want to start my own work',
      sayHi: 'अपना काम शुरू करने के लिए सरकार बैंक लोन दिलाती है और उसका 15% से 25% हिस्सा सब्सिडी में माफ़ कर देती है। पहाड़ी ज़िलों में सब्सिडी ज़्यादा मिलती है।',
      sayEn: 'To start your own work the state arranges a bank loan and writes off 15%–25% of it as subsidy. Hill districts get the higher rate.'
    },
    {
      id: 'sit-daughter', icon: '👧', to: 'nanda-gaura',
      hi: 'बेटी ने 12वीं पास की, आगे की पढ़ाई का खर्च',
      en: 'Daughter passed Class 12, need help with her studies',
      sayHi: 'बेटी के 12वीं पास करने पर सरकार सीधे ₹51,000 उसके अपने बैंक खाते में देती है। आवेदन मुफ़्त है।',
      sayEn: 'When a girl passes Class 12 the state pays ₹51,000 straight into her own bank account. Applying is free.'
    },
    {
      id: 'sit-elder', icon: '👴', to: 'pension-old',
      hi: 'घर में कोई बुज़ुर्ग है, पेंशन चाहिए',
      en: 'Someone elderly at home, need a pension',
      sayHi: '60 साल से ऊपर के बुज़ुर्गों को हर महीने ₹1,500 पेंशन मिलती है, सीधे बैंक खाते में। आवेदन पूरी तरह मुफ़्त है — किसी को पैसे मत दीजिए।',
      sayEn: 'People above 60 get ₹1,500 every month straight into the bank account. Applying is completely free — do not pay anyone.'
    },
    {
      id: 'sit-widow', icon: '🤍', to: 'pension-widow',
      hi: 'पति नहीं रहे, गुज़ारे के लिए मदद चाहिए',
      en: 'Husband has passed away, need support',
      sayHi: 'विधवा पेंशन एक अलग योजना है और उम्र 60 से कम होने पर भी मिल सकती है। इसके लिए पति का मृत्यु प्रमाण पत्र ज़रूरी है।',
      sayEn: 'Widow pension is a separate scheme and can apply even below age 60. The husband\'s death certificate is required.'
    },
    {
      id: 'sit-hospital', icon: '🏥', to: 'ayushman',
      hi: 'इलाज का खर्च नहीं उठा पा रहे',
      en: 'Cannot afford medical treatment',
      sayHi: 'अटल आयुष्मान कार्ड से साल में ₹5 लाख तक का इलाज मुफ़्त होता है। कार्ड मुफ़्त बनता है — बस राशन कार्ड और आधार चाहिए।',
      sayEn: 'The Atal Ayushman card covers up to ₹5 lakh of treatment a year, free. The card itself is free — you only need a ration card and Aadhaar.'
    },
    {
      id: 'sit-complaint', icon: '📣', to: 'helpline-1905',
      hi: 'पानी, बिजली या सड़क की शिकायत करनी है',
      en: 'Want to complain about water, power or roads',
      sayHi: '1905 पर फोन कीजिए। कोई कागज़ नहीं चाहिए, कोई फीस नहीं। शिकायत सीधे मुख्यमंत्री कार्यालय की निगरानी में जाती है और 7 दिन में निपटानी होती है।',
      sayEn: 'Dial 1905. No documents, no fee. The complaint goes under the Chief Minister\'s Office watch and must be settled in 7 days.'
    },
    {
      id: 'sit-scholarship', icon: '🎓', to: 'income',
      hi: 'बच्चे की छात्रवृत्ति का फॉर्म भरना है',
      en: 'Need to fill a scholarship form for my child',
      sayHi: 'छात्रवृत्ति के लिए सबसे पहले आय प्रमाण पत्र चाहिए, और अगर SC/ST/OBC हैं तो जाति प्रमाण पत्र भी। दोनों तहसील से ₹40 में 15 दिन के अंदर बनते हैं।',
      sayEn: 'A scholarship needs an income certificate first, and a caste certificate too if you are SC/ST/OBC. Both come from the tehsil at ₹40 within 15 days.'
    },
    {
      id: 'sit-newborn', icon: '👶', to: 'birth',
      hi: 'घर में बच्चा हुआ है',
      en: 'A baby has been born at home',
      sayHi: 'जन्म के 21 दिन के अंदर जन्म प्रमाण पत्र मुफ़्त बनता है। देर होने पर फीस और कागज़ी काम दोनों बढ़ जाते हैं — इसलिए जल्दी बनवा लीजिए।',
      sayEn: 'A birth certificate is free if registered within 21 days. Delay adds both a fee and paperwork — so do it early.'
    },
    {
      id: 'sit-death', icon: '🕯️', to: 'death',
      hi: 'परिवार में किसी की मृत्यु हुई है',
      en: 'Someone in the family has passed away',
      sayHi: 'सबसे पहले मृत्यु प्रमाण पत्र बनवाइए — 21 दिन के अंदर मुफ़्त है। उसके बाद बैंक, बीमा, पेंशन और ज़मीन के नाम बदलने के लिए उत्तरजीवी प्रमाण पत्र लगेगा।',
      sayEn: 'Get the death certificate first — free within 21 days. After that a survivor certificate is needed for bank, insurance, pension and land transfer.'
    },
    {
      id: 'sit-job-apply', icon: '📝', to: 'domicile',
      hi: 'सरकारी नौकरी का फॉर्म भरना है',
      en: 'Applying for a government job',
      sayHi: 'राज्य की भर्ती के लिए मूल निवास प्रमाण पत्र चाहिए, और आरक्षण का दावा कर रहे हैं तो जाति प्रमाण पत्र भी। दोनों ₹40 में 15 दिन के अंदर।',
      sayEn: 'State recruitment needs a domicile certificate, and a caste certificate too if you are claiming reservation. Both ₹40, within 15 days.'
    },
    {
      id: 'sit-lost', icon: '📱', to: 'efir',
      hi: 'मोबाइल या कागज़ खो गए हैं',
      en: 'Phone or documents are lost',
      sayHi: 'थाने जाने की ज़रूरत नहीं — ऑनलाइन रिपोर्ट दर्ज कीजिए और रसीद तुरंत मिल जाएगी। यह मुफ़्त है और नया सिम या डुप्लीकेट कागज़ लेने में यही रसीद काम आती है।',
      sayEn: 'No need to visit the station — file online and the receipt is immediate. It is free, and that receipt is what you need for a new SIM or duplicate documents.'
    },
    {
      id: 'sit-divyang', icon: '♿', to: 'pension-divyang',
      hi: 'घर में कोई दिव्यांग है',
      en: 'Someone at home has a disability',
      sayHi: '40% या ज़्यादा दिव्यांगता पर हर महीने पेंशन मिलती है। पहले सरकारी अस्पताल से दिव्यांगता प्रमाण पत्र बनवाना होगा — वह भी मुफ़्त है।',
      sayEn: 'A disability of 40% or more qualifies for a monthly pension. The disability certificate from a government hospital comes first — that is free too.'
    }
  ];

  /* Distinct things people confuse. Shown when a query is ambiguous. */
  const CLARIFY = {
    pension: {
      hi: 'पेंशन कई तरह की होती है। किसके लिए चाहिए?',
      en: 'There are several kinds of pension. Who is it for?',
      options: ['pension-old', 'pension-widow', 'pension-divyang']
    },
    certificate: {
      hi: 'प्रमाण पत्र कई तरह के होते हैं। कौन सा चाहिए?',
      en: 'There are many kinds of certificate. Which one do you need?',
      options: ['income', 'domicile', 'caste', 'character']
    }
  };

  global.KB = {
    DOC: DOC,
    WHERE: WHERE,
    services: SERVICES,
    situations: SITUATIONS,
    clarify: CLARIFY,
    byId: function (id) { return SERVICES.find(function (s) { return s.id === id; }); }
  };

})(typeof window !== 'undefined' ? window : this);
