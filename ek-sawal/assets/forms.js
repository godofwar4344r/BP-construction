/* =============================================================================
   forms.js — application forms, and what DigiLocker can fill for you

   The point of this file: a citizen should type as little as possible. Every
   field declares `from`, naming the DigiLocker document field that supplies it.
   When the locker is connected, those fields arrive filled and verified; only
   what the state cannot already know is left to answer.

   For Income Certificate that is 11 fields, of which DigiLocker fills 7.
   ============================================================================= */

(function (global) {
  'use strict';

  var UK_DISTRICTS = [
    'अल्मोड़ा', 'बागेश्वर', 'चमोली', 'चम्पावत', 'देहरादून', 'हरिद्वार', 'नैनीताल',
    'पौड़ी गढ़वाल', 'पिथौरागढ़', 'रुद्रप्रयाग', 'टिहरी गढ़वाल', 'ऊधम सिंह नगर', 'उत्तरकाशी'
  ];
  var UK_DISTRICTS_EN = [
    'Almora', 'Bageshwar', 'Chamoli', 'Champawat', 'Dehradun', 'Haridwar', 'Nainital',
    'Pauri Garhwal', 'Pithoragarh', 'Rudraprayag', 'Tehri Garhwal', 'Udham Singh Nagar', 'Uttarkashi'
  ];

  /* ------------------------------------------------------------ field library
     `from`      — DigiLocker field that fills this automatically
     `validate`  — key into Match.validate (spoken numbers are parsed, not stored raw)
     `mask`      — never render the full value back on screen
     `ask`       — what the voice assistant says when filling by speech          */
  var FIELD = {
    applicantName: {
      hi: 'पूरा नाम', en: 'Full name', type: 'text', from: 'name', req: true,
      askHi: 'आपका पूरा नाम क्या है?', askEn: 'What is your full name?'
    },
    fatherName: {
      hi: 'पिता / पति का नाम', en: "Father's / husband's name", type: 'text', from: 'fatherName', req: true,
      askHi: 'पिता या पति का नाम बताइए।', askEn: "Your father's or husband's name?"
    },
    motherName: {
      hi: 'माता का नाम', en: "Mother's name", type: 'text', req: true,
      askHi: 'माता का नाम बताइए।', askEn: "Your mother's name?"
    },
    dob: {
      hi: 'जन्म तिथि', en: 'Date of birth', type: 'date', from: 'dob', req: true,
      askHi: 'जन्म तिथि बताइए।', askEn: 'Your date of birth?'
    },
    gender: {
      hi: 'लिंग', en: 'Gender', type: 'choice', from: 'gender', req: true,
      choices: [
        { v: 'F', hi: 'महिला', en: 'Female' },
        { v: 'M', hi: 'पुरुष', en: 'Male' },
        { v: 'O', hi: 'अन्य', en: 'Other' }
      ]
    },
    mobile: {
      hi: 'मोबाइल नंबर', en: 'Mobile number', type: 'tel', validate: 'mobile', req: true,
      hintHi: 'SMS से जानकारी इसी नंबर पर आएगी', hintEn: 'Updates come to this number by SMS',
      askHi: 'अपना दस अंकों का मोबाइल नंबर बोलिए।', askEn: 'Say your ten digit mobile number.'
    },
    aadhaar: {
      hi: 'आधार संख्या', en: 'Aadhaar number', type: 'tel', validate: 'aadhaar',
      from: 'aadhaar', mask: true, req: true,
      hintHi: 'पूरा नंबर कहीं दिखाया या भेजा नहीं जाता', hintEn: 'The full number is never displayed or sent anywhere',
      askHi: 'अपना बारह अंकों का आधार नंबर बोलिए।', askEn: 'Say your twelve digit Aadhaar number.'
    },
    district: {
      hi: 'जनपद', en: 'District', type: 'select', from: 'district', req: true,
      options: UK_DISTRICTS, optionsEn: UK_DISTRICTS_EN,
      askHi: 'आप किस जनपद में रहते हैं?', askEn: 'Which district do you live in?'
    },
    tehsil: {
      hi: 'तहसील', en: 'Tehsil', type: 'text', req: true,
      askHi: 'आपकी तहसील कौन सी है?', askEn: 'Which tehsil?'
    },
    village: {
      hi: 'गाँव / मोहल्ला', en: 'Village / locality', type: 'text', from: 'village', req: true,
      askHi: 'गाँव या मोहल्ले का नाम?', askEn: 'Name of your village or locality?'
    },
    address: {
      hi: 'पूरा पता', en: 'Full address', type: 'textarea', from: 'address', req: true,
      askHi: 'अपना पूरा पता बताइए।', askEn: 'Your full address?'
    },
    annualIncome: {
      hi: 'परिवार की सालाना आय (₹)', en: 'Family yearly income (₹)', type: 'tel',
      validate: 'money', req: true,
      hintHi: 'घर के सभी कमाने वालों को मिलाकर', hintEn: 'All earning members together',
      askHi: 'परिवार की सालाना आय कितनी है?', askEn: 'What is your family yearly income?'
    },
    occupation: {
      hi: 'काम / व्यवसाय', en: 'Occupation', type: 'text', req: false,
      askHi: 'आप क्या काम करते हैं?', askEn: 'What work do you do?'
    },
    casteName: {
      hi: 'जाति का नाम', en: 'Caste name', type: 'text', req: true,
      askHi: 'जाति का नाम बताइए।', askEn: 'Name of your caste?'
    },
    casteCategory: {
      hi: 'वर्ग', en: 'Category', type: 'choice', req: true,
      choices: [
        { v: 'SC', hi: 'अनुसूचित जाति (SC)', en: 'Scheduled Caste (SC)' },
        { v: 'ST', hi: 'अनुसूचित जनजाति (ST)', en: 'Scheduled Tribe (ST)' },
        { v: 'OBC', hi: 'अन्य पिछड़ा वर्ग (OBC)', en: 'Other Backward Class (OBC)' }
      ]
    },
    bankAccount: {
      hi: 'बैंक खाता संख्या', en: 'Bank account number', type: 'tel',
      validate: 'account', from: 'bankAccount', mask: true, req: true,
      hintHi: 'पैसा सीधे इसी खाते में आएगा', hintEn: 'Money is paid straight into this account',
      askHi: 'बैंक खाता संख्या बोलिए।', askEn: 'Say your bank account number.'
    },
    ifsc: {
      hi: 'IFSC कोड', en: 'IFSC code', type: 'text', from: 'ifsc', req: true,
      askHi: 'बैंक का IFSC कोड बोलिए।', askEn: 'Say the bank IFSC code.'
    },
    age: {
      hi: 'उम्र (साल)', en: 'Age (years)', type: 'tel', validate: 'age', from: 'age', req: true,
      askHi: 'आपकी उम्र कितनी है?', askEn: 'How old are you?'
    },
    schoolName: {
      hi: '12वीं का स्कूल', en: 'Class 12 school', type: 'text', req: true,
      askHi: 'बारहवीं किस स्कूल से पास की?', askEn: 'Which school did you pass Class 12 from?'
    },
    projectType: {
      hi: 'क्या काम शुरू करना है', en: 'What work will you start', type: 'text', req: true,
      hintHi: 'जैसे होमस्टे, डेयरी, दुकान, सिलाई', hintEn: 'e.g. homestay, dairy, shop, tailoring',
      askHi: 'आप कौन सा काम शुरू करना चाहते हैं?', askEn: 'What work do you want to start?'
    },
    projectCost: {
      hi: 'अनुमानित लागत (₹)', en: 'Estimated cost (₹)', type: 'tel', validate: 'money', req: true,
      askHi: 'अनुमानित लागत कितनी है?', askEn: 'What is the estimated cost?'
    },
    grievanceDept: {
      hi: 'किस विभाग की शिकायत', en: 'Which department', type: 'choice', req: true,
      choices: [
        { v: 'water', hi: 'पानी (जल संस्थान)', en: 'Water' },
        { v: 'power', hi: 'बिजली (UPCL)', en: 'Electricity' },
        { v: 'road', hi: 'सड़क (लोक निर्माण)', en: 'Roads' },
        { v: 'sanitation', hi: 'सफाई / कूड़ा', en: 'Sanitation' },
        { v: 'ration', hi: 'राशन', en: 'Ration' },
        { v: 'other', hi: 'कोई और', en: 'Something else' }
      ]
    },
    grievanceText: {
      hi: 'समस्या क्या है', en: 'What is the problem', type: 'textarea', req: true,
      hintHi: 'कब से है, कहाँ है — दो-तीन लाइन', hintEn: 'Since when, and where — two or three lines',
      askHi: 'समस्या क्या है? दो-तीन लाइन में बताइए।', askEn: 'What is the problem? Two or three lines.'
    },
    deceasedName: {
      hi: 'मृतक का नाम', en: 'Name of the deceased', type: 'text', req: true,
      askHi: 'मृतक का नाम बताइए।', askEn: 'Name of the deceased?'
    },
    childName: {
      hi: 'बच्चे का नाम', en: "Child's name", type: 'text', req: true,
      askHi: 'बच्चे का नाम बताइए।', askEn: "The child's name?"
    },
    birthPlace: {
      hi: 'जन्म स्थान', en: 'Place of birth', type: 'text', req: true,
      askHi: 'बच्चे का जन्म कहाँ हुआ?', askEn: 'Where was the child born?'
    }
  };

  /* --------------------------------------------------------------- form specs
     Only the fields a given service genuinely needs. Shorter is better: every
     extra field is another chance to give up halfway. */
  var COMMON = ['applicantName', 'fatherName', 'dob', 'gender', 'mobile', 'aadhaar'];
  var WHERE  = ['district', 'tehsil', 'village'];

  var FORMS = {
    income:            COMMON.concat(WHERE, ['annualIncome', 'occupation']),
    domicile:          COMMON.concat(WHERE, ['address']),
    caste:             COMMON.concat(WHERE, ['casteName', 'casteCategory']),
    parvatiya:         COMMON.concat(WHERE),
    character:         COMMON.concat(WHERE, ['address']),
    haisiyat:          COMMON.concat(WHERE, ['address']),
    ews:               COMMON.concat(WHERE, ['annualIncome']),
    uttarjeevi:        COMMON.concat(WHERE, ['deceasedName']),
    minority:          COMMON.concat(WHERE),
    freedom:           COMMON.concat(WHERE),
    'lic-sahukari':    COMMON.concat(WHERE, ['address']),
    'lic-stamp':       COMMON.concat(WHERE, ['address']),
    'lic-arayaj':      COMMON.concat(WHERE, ['address']),
    'character-thekedari': COMMON.concat(WHERE, ['address']),
    'pariwar-register': ['applicantName', 'fatherName', 'mobile', 'aadhaar'].concat(WHERE),
    birth:             ['childName', 'dob', 'gender', 'birthPlace', 'applicantName', 'mobile', 'aadhaar'].concat(WHERE),
    death:             ['deceasedName', 'dob', 'applicantName', 'fatherName', 'mobile', 'aadhaar'].concat(WHERE),
    'pension-old':     ['applicantName', 'fatherName', 'age', 'gender', 'mobile', 'aadhaar']
                         .concat(WHERE, ['annualIncome', 'bankAccount', 'ifsc']),
    'pension-widow':   ['applicantName', 'fatherName', 'dob', 'mobile', 'aadhaar']
                         .concat(WHERE, ['deceasedName', 'annualIncome', 'bankAccount', 'ifsc']),
    'pension-divyang': COMMON.concat(WHERE, ['annualIncome', 'bankAccount', 'ifsc']),
    'nanda-gaura':     ['applicantName', 'fatherName', 'motherName', 'dob', 'mobile', 'aadhaar']
                         .concat(WHERE, ['schoolName', 'annualIncome', 'bankAccount', 'ifsc']),
    msy:               COMMON.concat(WHERE, ['projectType', 'projectCost', 'bankAccount', 'ifsc']),
    ayushman:          ['applicantName', 'fatherName', 'dob', 'gender', 'mobile', 'aadhaar'].concat(WHERE),
    'helpline-1905':   ['applicantName', 'mobile', 'grievanceDept'].concat(WHERE, ['grievanceText']),
    efir:              ['applicantName', 'fatherName', 'mobile', 'aadhaar'].concat(WHERE, ['grievanceText']),
    dl:                COMMON.concat(WHERE, ['address'])
  };

  function fieldsFor(serviceId) {
    var ids = FORMS[serviceId] || COMMON.concat(WHERE);
    return ids.map(function (id) {
      var f = FIELD[id];
      return f ? Object.assign({ id: id }, f) : null;
    }).filter(Boolean);
  }

  /* How much of this form can the locker fill? Drives the headline number on
     the DigiLocker step: "7 of 11 filled automatically". */
  function autoFillable(serviceId) {
    return fieldsFor(serviceId).filter(function (f) { return !!f.from; }).length;
  }

  global.FORMS = {
    field: FIELD,
    districts: UK_DISTRICTS,
    districtsEn: UK_DISTRICTS_EN,
    fieldsFor: fieldsFor,
    autoFillable: autoFillable,
    count: function (id) { return fieldsFor(id).length; }
  };

})(typeof window !== 'undefined' ? window : this);
