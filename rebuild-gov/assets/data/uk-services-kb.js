/* ==========================================================================
   uk-services-kb.js — Uttarakhand Government (Apuni Sarkar / e-Sewa)
   Comprehensive Knowledge Base & AI Issue-to-Scheme Reasoning Matrix
   ========================================================================== */

(function (global) {
  'use strict';

  // Comprehensive catalogue of Uttarakhand Citizen Services & Schemes
  const UK_GOV_SERVICES = [
    {
      id: "ES09",
      slug: "income-certificate",
      title: "Income Certificate (आय प्रमाण पत्र)",
      titleHi: "आय प्रमाण पत्र",
      dept: "Revenue Department",
      deptHi: "राजस्व विभाग",
      deptSlug: "revenue",
      category: "Certificates",
      icon: "💰",
      fee: "₹40",
      feeNum: 40,
      slaDays: 15,
      rtsGuaranteed: true,
      officer: "Tehsildar / Nayab Tehsildar",
      officerHi: "तहसीलदार / नायब तहसीलदार",
      appealOfficer: "Sub-Divisional Magistrate (SDM)",
      appealOfficerHi: "उपजिलाधिकारी (एसडीएम)",
      validity: "6 Months from issue date",
      validityHi: "जारी होने की तिथि से 6 माह",
      voiceSummary: "The Income Certificate is issued by the Revenue Department within 15 working days for ₹40. You need your Aadhaar card, photo, address proof, and self-declaration. It is mandatory for scholarships and subsidies.",
      voiceSummaryHi: "आय प्रमाण पत्र राजस्व विभाग द्वारा 15 दिनों में ₹40 के शुल्क पर जारी किया जाता है। इसके लिए आधार कार्ड, फोटो और आय घोषणा आवश्यक है।",
      description: "Official legal document certifying annual family income. Essential for scholarships, fee concessions, and government welfare benefits.",
      descriptionHi: "परिवार की कुल वार्षिक आय को प्रमाणित करने वाला आधिकारिक दस्तावेज।",
      mandatoryDocs: [
        { name: "Aadhaar Card (UIDAI)", nameHi: "आधार कार्ड", required: true, digilocker: true, note: "Identity proof" },
        { name: "Passport Size Photograph", nameHi: "पासपोर्ट फोटो", required: true, digilocker: false, note: "Color photo" },
        { name: "Copy of Pariwar Register / Ration Card", nameHi: "परिवार रजिस्टर / राशन कार्ड", required: true, digilocker: true, note: "Family proof" },
        { name: "Self Declaration of Income", nameHi: "स्व-घोषणा पत्र", required: true, digilocker: false, note: "Auto-generated" }
      ],
      optionalDocs: [
        { name: "Salary Slip / Form 16", nameHi: "वेतन पर्ची", required: false, digilocker: false }
      ],
      voiceForm: [
        { id: "applicantName", label: "Full Name", labelHi: "पूरा नाम", ask: "What is your full name?", askHi: "आपका पूरा नाम क्या है?", prefill: "Ramesh Negi" },
        { id: "fatherName", label: "Father's Name", labelHi: "पिता का नाम", ask: "What is your father's name?", askHi: "आपके पिता का नाम क्या है?", prefill: "Bhagwan Singh Negi" },
        { id: "aadhaar", label: "Aadhaar Number", labelHi: "आधार संख्या", ask: "State your Aadhaar number.", askHi: "अपना आधार नंबर बोलिए।", prefill: "4728 9102 3841" },
        { id: "district", label: "District", labelHi: "जनपद", ask: "Which district?", askHi: "कौन सा जनपद?", prefill: "Dehradun" },
        { id: "annualIncome", label: "Annual Income (₹)", labelHi: "वार्षिक आय (₹)", ask: "What is your total annual family income in rupees?", askHi: "पारिवारिक वार्षिक आय कितनी है?", prefill: "₹95,000" }
      ],
      keywords: ["income", "salary", "income certificate", "aay", "earn", "scholarship", "fee concession", "tehsildar", "annual income", "आय", "आय प्रमाण पत्र", "आमदनी"]
    },
    {
      id: "ES01",
      slug: "domicile-certificate",
      title: "Permanent Resident / Domicile Certificate (स्थाई निवास)",
      titleHi: "स्थाई निवास प्रमाण पत्र (मूल निवास)",
      dept: "Revenue Department",
      deptHi: "राजस्व विभाग",
      deptSlug: "revenue",
      category: "Certificates",
      icon: "🏠",
      fee: "₹40",
      feeNum: 40,
      slaDays: 15,
      rtsGuaranteed: true,
      officer: "Sub-Divisional Magistrate (SDM) / Tehsildar",
      officerHi: "उपजिलाधिकारी / तहसीलदार",
      appealOfficer: "District Magistrate (DM)",
      appealOfficerHi: "जिलाधिकारी (डीएम)",
      validity: "Lifetime",
      validityHi: "आजीवन वैध",
      voiceSummary: "The Domicile or Permanent Resident Certificate is delivered within 15 working days for ₹40. You need proof of 15 years residence in Uttarakhand, land records, 10th marksheet, and Aadhaar.",
      voiceSummaryHi: "स्थाई निवास प्रमाण पत्र 15 दिनों में ₹40 में जारी किया जाता है। इसके लिए 15 वर्ष का निवास प्रमाण, 10वीं की अंकतालिका और आधार आवश्यक है।",
      description: "Certifies permanent residency in Uttarakhand. Required for state government jobs, UKPSC exams, and admissions.",
      descriptionHi: "नागरिक के उत्तराखंड का स्थाई निवासी होने का प्रमाण पत्र।",
      mandatoryDocs: [
        { name: "Aadhaar Card", nameHi: "आधार कार्ड", required: true, digilocker: true, note: "Identity proof" },
        { name: "Applicant Photograph", nameHi: "फोटो", required: true, digilocker: false, note: "Recent photo" },
        { name: "15-Year Residence Proof / Land Registry", nameHi: "15 वर्ष का निवास प्रमाण / रजिस्ट्री", required: true, digilocker: true, note: "15+ years proof" },
        { name: "High School (10th) Marksheet", nameHi: "10वीं की अंकतालिका", required: true, digilocker: true, note: "Uttarakhand board" }
      ],
      optionalDocs: [],
      voiceForm: [
        { id: "applicantName", label: "Full Name", labelHi: "पूरा नाम", ask: "What is your full name?", askHi: "आपका पूरा नाम क्या है?", prefill: "Ramesh Negi" },
        { id: "fatherName", label: "Father's Name", labelHi: "पिता का नाम", ask: "What is your father's name?", askHi: "आपके पिता का नाम क्या है?", prefill: "Bhagwan Singh Negi" },
        { id: "aadhaar", label: "Aadhaar Number", labelHi: "आधार संख्या", ask: "State your Aadhaar number.", askHi: "अपना आधार नंबर बोलिए।", prefill: "4728 9102 3841" },
        { id: "district", label: "District", labelHi: "जनपद", ask: "Which district?", askHi: "कौन सा जनपद?", prefill: "Dehradun" }
      ],
      keywords: ["domicile", "permanent resident", "mool niwas", "sthai niwas", "residence", "residency", "uk domicile", "state quota", "मूल निवास", "स्थाई निवास"]
    },
    {
      id: "ES90",
      slug: "old-age-pension",
      title: "Old Age Pension Scheme (वृद्धावस्था पेंशन)",
      titleHi: "वृद्धावस्था पेंशन योजना (₹1,500/माह)",
      dept: "Social Welfare Department",
      deptHi: "समाज कल्याण विभाग",
      deptSlug: "social-welfare",
      category: "Social Welfare & Pensions",
      icon: "👴",
      fee: "₹0 (Free of Cost)",
      feeNum: 0,
      slaDays: 15,
      rtsGuaranteed: true,
      benefit: "₹1,500 per month DBT into bank account",
      benefitHi: "₹1,500 प्रति माह सीधे बैंक खाते में (DBT)",
      officer: "District Social Welfare Officer (DSWO)",
      officerHi: "जिला समाज कल्याण अधिकारी",
      appealOfficer: "Chief Development Officer (CDO)",
      appealOfficerHi: "मुख्य विकास अधिकारी",
      voiceSummary: "Old Age Pension provides ₹1,500 monthly to senior citizens aged 60 and above below poverty line. Application is completely free with a 15-day SLA.",
      voiceSummaryHi: "वृद्धावस्था पेंशन 60 वर्ष या अधिक आयु के वरिष्ठ नागरिकों को ₹1,500 प्रति माह की आर्थिक सहायता प्रदान करती है। यह सेवा निशुल्क है।",
      description: "Direct financial benefit providing ₹1,500 per month to elderly citizens aged 60+ living in rural or urban Uttarakhand.",
      descriptionHi: "60 वर्ष से अधिक आयु के वरिष्ठ नागरिकों को ₹1,500 मासिक पेंशन।",
      mandatoryDocs: [
        { name: "Aadhaar Card", nameHi: "आधार कार्ड", required: true, digilocker: true, note: "Age & Identity proof" },
        { name: "Bank Account Passbook (Aadhaar Seeded)", nameHi: "आधार लिंक बैंक पासबुक", required: true, digilocker: false, note: "For direct deposit" },
        { name: "Income Certificate / BPL Card", nameHi: "आय प्रमाण पत्र / BPL कार्ड", required: true, digilocker: true, note: "Income under ₹48,000/yr" }
      ],
      optionalDocs: [],
      voiceForm: [
        { id: "applicantName", label: "Full Name", labelHi: "पूरा नाम", ask: "What is your full name?", askHi: "आपका पूरा नाम क्या है?", prefill: "Ramesh Negi" },
        { id: "age", label: "Age (Years)", labelHi: "आयु (वर्ष)", ask: "What is your age?", askHi: "आपकी उम्र कितनी है?", prefill: "63 Years" },
        { id: "bankAccount", label: "Bank Account Number", labelHi: "बैंक खाता संख्या", ask: "State your bank account number.", askHi: "अपना बैंक खाता नंबर बोलिए।", prefill: "5010048291038" },
        { id: "district", label: "District", labelHi: "जनपद", ask: "Which district?", askHi: "कौन सा जनपद?", prefill: "Dehradun" }
      ],
      keywords: ["old age", "pension", "vridha", "senior citizen", "elderly", "60 years", "monthly assistance", "social welfare", "dbt", "वृद्धावस्था पेंशन", "बुढ़ापा पेंशन"]
    },
    {
      id: "SCH_GAURA",
      slug: "gaura-devi-kanyadhan",
      title: "Gaura Devi Kanyadhan / Nanda Gaura Scheme (नंदा गौरा योजना)",
      titleHi: "नंदा गौरा योजना (₹51,000 आर्थिक सहायता)",
      dept: "Women & Child Development",
      deptHi: "महिला सशक्तिकरण एवं बाल विकास विभाग",
      deptSlug: "women-child",
      category: "Women & Girl Child",
      icon: "👧",
      fee: "₹0 (Free)",
      feeNum: 0,
      slaDays: 30,
      rtsGuaranteed: true,
      benefit: "₹11,000 at birth + ₹51,000 after 12th pass for girl child higher education",
      benefitHi: "बालिका के जन्म पर ₹11,000 तथा 12वीं पास करने पर ₹51,000 की वित्तीय सहायता",
      officer: "District Program Officer (DPO)",
      officerHi: "जिला कार्यक्रम अधिकारी",
      voiceSummary: "The Nanda Gaura scheme provides ₹51,000 to girl students who pass Class 12 from Uttarakhand to support higher education. Family annual income must be under ₹72,000.",
      voiceSummaryHi: "नंदा गौरा योजना के तहत 12वीं पास बालिकाओं को उच्च शिक्षा हेतु ₹51,000 की वित्तीय सहायता दी जाती है। पारिवारिक आय ₹72,000 से कम होनी चाहिए।",
      description: "Financial grant providing ₹51,000 to eligible girl students from economically weaker sections upon clearing Intermediate (Class 12) to pursue college degrees or vocational education.",
      descriptionHi: "12वीं उत्तीर्ण बालिकाओं को उच्च शिक्षा हेतु ₹51,000 का एकमुश्त अनुदान।",
      mandatoryDocs: [
        { name: "Aadhaar Card of Girl & Mother", nameHi: "बालिका व माता का आधार कार्ड", required: true, digilocker: true, note: "Identity proof" },
        { name: "12th Marksheet & Admit Card", nameHi: "12वीं की अंकतालिका व प्रवेश पत्र", required: true, digilocker: true, note: "Uttarakhand board" },
        { name: "Income Certificate (< ₹72,000/yr)", nameHi: "आय प्रमाण पत्र (< ₹72,000)", required: true, digilocker: true, note: "Income verification" },
        { name: "Bank Account Passbook of Girl", nameHi: "बालिका की बैंक पासबुक", required: true, digilocker: false, note: "Direct bank deposit" },
        { name: "Unmarried Affidavit", nameHi: "अविवाहित होने का शपथ पत्र", required: true, digilocker: false, note: "Mandatory affidavit" }
      ],
      optionalDocs: [],
      voiceForm: [
        { id: "applicantName", label: "Girl's Name", labelHi: "बालिका का नाम", ask: "What is the girl's full name?", askHi: "बालिका का पूरा नाम क्या है?", prefill: "Pooja Negi" },
        { id: "motherName", label: "Mother's Name", labelHi: "माता का नाम", ask: "What is mother's name?", askHi: "माता का नाम क्या है?", prefill: "Sunita Negi" },
        { id: "schoolName", label: "12th School Name", labelHi: "12वीं स्कूल का नाम", ask: "Name of the school where 12th was completed?", askHi: "12वीं किस स्कूल से पास की?", prefill: "GIC Dehradun" },
        { id: "bankAccount", label: "Bank Account", labelHi: "बैंक खाता", ask: "State the girl's bank account number.", askHi: "बालिका का बैंक खाता नंबर बोलिए।", prefill: "5010098412891" }
      ],
      keywords: ["nanda gaura", "gaura devi", "kanyadhan", "girl child", "daughter", "12th pass", "51000", "girl scholarship", "wedding grant", "बेटी", "कन्यादान", "नंदा गौरा", "गौरा देवी", "लड़की की पढ़ाई"]
    },
    {
      id: "SCH_MSY",
      slug: "mukhyamantri-swarojgar-yojana",
      title: "Mukhyamantri Swarojgar Yojana - MSY (मुख्यमंत्री स्वरोजगार योजना)",
      titleHi: "मुख्यमंत्री स्वरोजगार योजना (₹25 लाख तक ऋण + 25% सब्सिडी)",
      dept: "MSME & Industries Department",
      deptHi: "उद्योग विभाग (MSME)",
      deptSlug: "industry",
      category: "Youth & Employment",
      icon: "💼",
      fee: "₹0 (Free)",
      feeNum: 0,
      slaDays: 20,
      rtsGuaranteed: true,
      benefit: "Up to ₹25 Lakh project loan with 15% to 25% Government Subsidy (Margin Money)",
      benefitHi: "₹25 लाख तक का ऋण जिसमें 25% (पर्वतीय क्षेत्र) व 15% (मैदानी क्षेत्र) सरकारी सब्सिडी",
      officer: "General Manager, District Industries Centre (DIC)",
      officerHi: "महाप्रबंधक, जिला उद्योग केंद्र (DIC)",
      voiceSummary: "Mukhyamantri Swarojgar Yojana helps unemployed youth start manufacturing, tourism, homestay, or business with bank loans up to ₹25 Lakhs and up to 25% government subsidy.",
      voiceSummaryHi: "मुख्यमंत्री स्वरोजगार योजना के तहत युवाओं को अपना उद्योग, होमस्टे या व्यवसाय शुरू करने हेतु ₹25 लाख तक का लोन और 25% तक सरकारी सब्सिडी मिलती है।",
      description: "Flagship self-employment scheme encouraging local entrepreneurship in tourism, homestays, manufacturing, and service sector across Uttarakhand with subsidized credit.",
      descriptionHi: "युवाओं को अपना व्यापार, होमस्टे या उद्योग लगाने हेतु 25% सरकारी सब्सिडी युक्त स्वरोजगार योजना।",
      mandatoryDocs: [
        { name: "Aadhaar Card", nameHi: "आधार कार्ड", required: true, digilocker: true, note: "Identity proof" },
        { name: "Uttarakhand Domicile / Mool Niwas", nameHi: "मूल निवास प्रमाण पत्र", required: true, digilocker: true, note: "State resident proof" },
        { name: "Project Report / DPR", nameHi: "प्रोजेक्ट रिपोर्ट (DPR)", required: true, digilocker: false, note: "Business summary" },
        { name: "Educational Qualification (10th/12th/Degree)", nameHi: "शैक्षिक योग्यता", required: true, digilocker: true, note: "Education marksheet" }
      ],
      optionalDocs: [],
      voiceForm: [
        { id: "applicantName", label: "Full Name", labelHi: "पूरा नाम", ask: "What is your full name?", askHi: "आपका पूरा नाम क्या है?", prefill: "Ramesh Negi" },
        { id: "projectType", label: "Business/Project Idea", labelHi: "व्यवसाय/प्रोजेक्ट का प्रकार", ask: "What business or project do you plan to start? E.g. Homestay, Dairy, Shop, Manufacturing?", askHi: "आप कौन सा व्यवसाय या प्रोजेक्ट शुरू करना चाहते हैं? जैसे होमस्टे, डेयरी, दुकान?", prefill: "Eco Homestay & Tourism" },
        { id: "estimatedCost", label: "Estimated Project Cost (₹)", labelHi: "अनुमानित प्रोजेक्ट लागत (₹)", ask: "What is the estimated cost of your project?", askHi: "प्रोजेक्ट की अनुमानित लागत कितनी है?", prefill: "₹10,00,000" },
        { id: "district", label: "District", labelHi: "जनपद", ask: "Which district?", askHi: "कौन सा जनपद?", prefill: "Dehradun" }
      ],
      keywords: ["msy", "swarojgar", "self employment", "business loan", "homestay", "startup", "subsidy", "unemployed", "job seeker", "loan", "स्वरोजगार", "उद्योग लोन", "बिजनेस", "दुकान", "सब्सिडी"]
    },
    {
      id: "SCH_AYUSHMAN",
      slug: "atal-ayushman-uttarakhand",
      title: "Atal Ayushman Uttarakhand Yojana (अटल आयुष्मान योजना)",
      titleHi: "अटल आयुष्मान उत्तराखंड योजना (₹5 लाख कैशलेस इलाज)",
      dept: "Health & Family Welfare",
      deptHi: "चिकित्सा स्वास्थ्य एवं परिवार कल्याण विभाग",
      deptSlug: "health",
      category: "Healthcare",
      icon: "🏥",
      fee: "₹0 (Free Card)",
      feeNum: 0,
      slaDays: 1,
      rtsGuaranteed: true,
      benefit: "₹5,00,000 free cashless hospital treatment per family per year across 5,000+ hospitals",
      benefitHi: "प्रति परिवार प्रति वर्ष ₹5,00,000 तक का मुफ्त कैशलेस इलाज",
      officer: "State Health Agency (SHA Uttarakhand)",
      officerHi: "राज्य स्वास्थ्य एजेंसी",
      voiceSummary: "Atal Ayushman Uttarakhand covers 100% of state families for ₹5 Lakhs free hospitalization per year. You just need your Ration card and Aadhaar card to generate the Golden Card instantly.",
      voiceSummaryHi: "अटल आयुष्मान योजना के तहत राज्य के प्रत्येक परिवार को प्रतिवर्ष ₹5 लाख तक का निशुल्क इलाज मिलता है। राशन कार्ड और आधार द्वारा गोल्डन कार्ड तुरंत बनता है।",
      description: "Universal healthcare scheme providing ₹5 Lakh annual cashless treatment for secondary and tertiary hospitalization to all residents of Uttarakhand.",
      descriptionHi: "उत्तराखंड के सभी परिवारों को ₹5 लाख तक का निःशुल्क कैशलेस अस्पताल उपचार।",
      mandatoryDocs: [
        { name: "Ration Card (NFSA or State White/Yellow Card)", nameHi: "राशन कार्ड", required: true, digilocker: true, note: "Family ID proof" },
        { name: "Aadhaar Card of all family members", nameHi: "सभी सदस्यों का आधार कार्ड", required: true, digilocker: true, note: "Biometric eKYC" }
      ],
      optionalDocs: [],
      voiceForm: [],
      keywords: ["ayushman", "atal ayushman", "health card", "golden card", "hospital", "medical treatment", "free treatment", "doctor", "5 lakh", "आयुष्मान", "इलाज", "अस्पताल", "गोल्डन कार्ड", "स्वास्थ्य"]
    },
    {
      id: "GRIEVANCE_1905",
      slug: "cm-helpline-1905",
      title: "CM Helpline 1905 - Public Grievance Redressal (मुख्यमंत्री हेल्पलाइन 1905)",
      titleHi: "मुख्यमंत्री हेल्पलाइन 1905 (जन शिकायत निवारण)",
      dept: "Chief Minister's Office & ITDA",
      deptHi: "मुख्यमंत्री कार्यालय एवं आईटीडीए",
      deptSlug: "grievance",
      category: "Public Grievances",
      icon: "📣",
      fee: "₹0 (Free)",
      feeNum: 0,
      slaDays: 7,
      rtsGuaranteed: true,
      benefit: "Direct escalation to District Magistrate & department heads with SMS tracking",
      benefitHi: "जिलाधिकारी व विभागाध्यक्षों को सीधी शिकायत प्रेषण एवं त्वरित निस्तारण",
      officer: "Designated Nodal Officer & District Magistrate",
      officerHi: "नोडल अधिकारी एवं जिलाधिकारी",
      voiceSummary: "You can register any civic issue, broken street light, water supply breakdown, road pothole, or corrupt official complaint directly on CM Helpline 1905. We will file your ticket right now.",
      voiceSummaryHi: "पानी, बिजली, सड़क, राशन या किसी भी सरकारी विभाग की समस्या की सीधी शिकायत मुख्यमंत्री हेल्पलाइन 1905 पर दर्ज करें। हम आपका टिकट अभी बना रहे हैं।",
      description: "Unified public grievance portal directly monitored by the Chief Minister's Office. Guarantees time-bound resolution of citizen complaints with SMS tracking.",
      descriptionHi: "मुख्यमंत्री कार्यालय द्वारा प्रत्यक्ष रूप से मॉनिटर की जाने वाली जन शिकायत निवारण प्रणाली।",
      mandatoryDocs: [
        { name: "Complainant Mobile Number", nameHi: "मोबाइल नंबर", required: true, digilocker: false, note: "For SMS updates" },
        { name: "Location / District / Tehsil", nameHi: "स्थान / जनपद / तहसील", required: true, digilocker: false, note: "Incident location" },
        { name: "Complaint Summary", nameHi: "शिकायत का विवरण", required: true, digilocker: false, note: "Issue details" }
      ],
      optionalDocs: [],
      voiceForm: [
        { id: "applicantName", label: "Your Name", labelHi: "आपका नाम", ask: "What is your full name?", askHi: "आपका पूरा नाम क्या है?", prefill: "Ramesh Negi" },
        { id: "mobile", label: "Mobile Number", labelHi: "मोबाइल नंबर", ask: "Please state your 10-digit mobile number for SMS tracking.", askHi: "SMS ट्रैकिंग हेतु अपना 10 अंकों का मोबाइल नंबर बोलिए।", prefill: "9412345678" },
        { id: "grievanceDept", label: "Department / Issue Type", labelHi: "विभाग / समस्या का प्रकार", ask: "Which department is this complaint about? E.g. Water, Electricity, Road, Sanitation, Revenue?", askHi: "शिकायत किस विभाग से संबंधित है? जैसे जल संस्थान, बिजली, सड़क, सफाई?", prefill: "Water Department (Jal Sansthan)" },
        { id: "district", label: "District & Area", labelHi: "जनपद व क्षेत्र", ask: "What is the exact location or area?", askHi: "स्थान या क्षेत्र का नाम क्या है?", prefill: "Rajpur Road, Dehradun" },
        { id: "complaintDetails", label: "Issue Description", labelHi: "समस्या का विवरण", ask: "Please briefly describe the problem.", askHi: "कृपया समस्या का संक्षिप्त विवरण बताइए।", prefill: "Drinking water pipeline leakage on main road for 4 days without repair." }
      ],
      keywords: ["complaint", "grievance", "cm helpline", "1905", "problem", "broken pipe", "no electricity", "water problem", "pothole", "officer not listening", "शिकायत", "समस्या", "पानी नहीं आ रहा", "बिजली गुल", "सड़क खराब", "हेल्पलाइन 1905"]
    },
    {
      id: "ES11",
      slug: "copy-family-register",
      title: "Copy of Pariwar Register (परिवार रजिस्टर नकल)",
      titleHi: "परिवार रजिस्टर प्रतिलिपि (नकल)",
      dept: "Panchayati Raj Department",
      deptHi: "पंचायतीराज विभाग",
      deptSlug: "panchayati-raj",
      category: "Panchayati Raj",
      icon: "👨‍👩‍👧",
      fee: "₹40",
      feeNum: 40,
      slaDays: 3,
      rtsGuaranteed: true,
      officer: "Village Panchayat Development Officer (VPDO)",
      officerHi: "ग्राम पंचायत विकास अधिकारी (VPDO)",
      appealOfficer: "Block Development Officer (BDO)",
      appealOfficerHi: "खंड विकास अधिकारी (BDO)",
      voiceSummary: "A certified copy of the Pariwar Register is issued in 3 working days by the Panchayati Raj Department for ₹40.",
      voiceSummaryHi: "परिवार रजिस्टर की नकल 3 कार्य दिवसों में ₹40 में जारी की जाती है।",
      description: "Official certified record maintained by Gram Panchayat detailing family members.",
      descriptionHi: "ग्राम पंचायत द्वारा संधारित परिवार के सभी सदस्यों का प्रमाणित विवरण।",
      mandatoryDocs: [
        { name: "Aadhaar Card of Applicant", nameHi: "आधार कार्ड", required: true, digilocker: true, note: "Identity proof" }
      ],
      optionalDocs: [],
      voiceForm: [
        { id: "applicantName", label: "Full Name", labelHi: "पूरा नाम", ask: "What is your full name?", askHi: "आपका पूरा नाम क्या है?", prefill: "Ramesh Negi" },
        { id: "headOfFamily", label: "Head of Family", labelHi: "परिवार के मुखिया का नाम", ask: "What is head of family name?", askHi: "परिवार के मुखिया का नाम?", prefill: "Bhagwan Singh Negi" },
        { id: "gramPanchayat", label: "Gram Panchayat", labelHi: "ग्राम पंचायत", ask: "Which Gram Panchayat?", askHi: "ग्राम पंचायत का नाम?", prefill: "Rajpur Gram Panchayat" }
      ],
      keywords: ["pariwar register", "family register", "kutumb", "gram panchayat", "vpdo", "family copy", "nakkal", "परिवार रजिस्टर", "कुटुंब रजिस्टर", "नकल"]
    },
    {
      id: "TR02",
      slug: "apply-for-driving-license",
      title: "Driving License & Learner License (ड्राइविंग लाइसेंस)",
      titleHi: "ड्राइविंग लाइसेंस / लर्निंग लाइसेंस",
      dept: "Transport Department (Parivahan)",
      deptHi: "परिवहन विभाग",
      deptSlug: "transport",
      category: "Transport",
      icon: "🚗",
      fee: "₹200 (LL) / ₹1,000 (DL)",
      feeNum: 200,
      slaDays: 15,
      rtsGuaranteed: false,
      isExternal: true,
      externalUrl: "https://sarathi.parivahan.gov.in/sarathiservice/stateSelection.do",
      externalSteps: [
        "Step 1: Select 'Uttarakhand' on the Sarathi portal.",
        "Step 2: Click 'Apply for Learner License' or 'Apply for Driving License'.",
        "Step 3: Authenticate with Aadhaar e-KYC for instant online test."
      ],
      externalStepsHi: [
        "चरण 1: सारथी पोर्टल पर 'Uttarakhand' राज्य चुनें।",
        "चरण 2: 'Apply for Learner License' पर क्लिक करें।",
        "चरण 3: आधार ई-केवाईसी द्वारा ऑनलाइन टेस्ट दें।"
      ],
      officer: "Regional Transport Officer (RTO / ARTO)",
      officerHi: "संभागीय परिवहन अधिकारी (RTO)",
      voiceSummary: "To get a Driving License in Uttarakhand, you start with a Learner's License for ₹200 via Parivahan Sarathi. We will guide you directly to the official Sarathi portal.",
      voiceSummaryHi: "उत्तराखंड में ड्राइविंग लाइसेंस के लिए सारथी परिवहन पोर्टल से ₹200 में ऑनलाइन आवेदन किया जाता है।",
      description: "Official driving authorization permitting individuals to operate vehicles on public roads.",
      descriptionHi: "वाहनों को सार्वजनिक सड़कों पर चलाने हेतु आधिकारिक ड्राइविंग लाइसेंस।",
      mandatoryDocs: [
        { name: "Aadhaar Card", nameHi: "आधार कार्ड", required: true, digilocker: true, note: "Identity and Address proof" },
        { name: "Age Proof (10th Marksheet / Birth Certificate)", nameHi: "आयु प्रमाण", required: true, digilocker: true, note: "Age verification" }
      ],
      optionalDocs: [],
      voiceForm: [],
      keywords: ["driving", "license", "dl", "learning license", "rto", "parivahan", "car", "bike", "sarathi", "ड्राइविंग लाइसेंस", "लाइसेंस"]
    },
    {
      id: "HD67",
      slug: "online-fir-police-complaint",
      title: "Online FIR & Lost Article Report (ई-एफआईआर)",
      titleHi: "ऑनलाइन ई-एफआईआर / पुलिस शिकायत",
      dept: "Home Department (Uttarakhand Police)",
      deptHi: "गृह विभाग (उत्तराखंड पुलिस)",
      deptSlug: "home",
      category: "Police & Security",
      icon: "🚨",
      fee: "₹0 (Free)",
      feeNum: 0,
      slaDays: 1,
      rtsGuaranteed: false,
      isExternal: true,
      externalUrl: "https://uttarakhandpolice.uk.gov.in/",
      externalSteps: [
        "Step 1: Open Uttarakhand Police CCTNS citizen portal.",
        "Step 2: Choose 'Report Lost Property' or 'File e-FIR'.",
        "Step 3: Enter date, time, IMEI/Device details, and download digital FIR receipt."
      ],
      externalStepsHi: [
        "चरण 1: उत्तराखंड पुलिस CCTNS पोर्टल खोलें।",
        "चरण 2: 'Report Lost Property' या 'e-FIR' चुनें।",
        "चरण 3: घटना का विवरण भरें और तुरंत डिजिटल एफआईआर रसीद प्राप्त करें।"
      ],
      officer: "Station House Officer (SHO)",
      officerHi: "थानाध्यक्ष (SHO)",
      voiceSummary: "Filing an online police complaint or lost article report in Uttarakhand is completely free with immediate digital receipt.",
      voiceSummaryHi: "उत्तराखंड पुलिस में ऑनलाइन ई-एफआईआर या खोई वस्तु की रिपोर्ट दर्ज करना पूरी तरह निशुल्क है।",
      description: "Allows citizens to report theft, lost property, or non-emergency civic complaints online.",
      descriptionHi: "खोए मोबाइल, दस्तावेज अथवा चोरी की ऑनलाइन शिकायत सीधे उत्तराखंड पुलिस में दर्ज करें।",
      mandatoryDocs: [
        { name: "Aadhaar Card / Government Photo ID", nameHi: "पहचान पत्र", required: true, digilocker: true, note: "Identity" }
      ],
      optionalDocs: [],
      voiceForm: [],
      keywords: ["fir", "police", "complaint", "lost phone", "theft", "stolen", "lost document", "police report", "crime", "एफआईआर", "पुलिस शिकायत", "खोया फोन"]
    }
  ];

  // AI Reasoning Issue Patterns: Translates real-life citizen problem statements into matching government interventions
  const AI_ISSUE_DIAGNOSTICS = [
    {
      triggers: ["lost job", "unemployed", "start business", "need money for shop", "homestay", "self employment", "no work", "बेरोजगार", "व्यापार", "दुकान खोलनी है", "लोन चाहिए", "काम नहीं है"],
      matchSvcId: "SCH_MSY",
      gptReplyEn: "I understand your situation. If you are looking for self-employment or starting a new business/homestay, the Uttarakhand Government offers the **Mukhyamantri Swarojgar Yojana (MSY)**. You can get a project loan up to ₹25 Lakhs with a **25% Government Subsidy** (margin money grant). Would you like to check eligibility or start the application?",
      gptReplyHi: "मैं आपकी स्थिति समझता हूँ। यदि आप नया व्यवसाय, दुकान या होमस्टे शुरू करना चाहते हैं, तो उत्तराखंड सरकार की **'मुख्यमंत्री स्वरोजगार योजना (MSY)'** आपके लिए सबसे उपयुक्त है। इसमें ₹25 लाख तक का लोन और **25% सरकारी सब्सिडी** मिलती है। क्या आप आवेदन शुरू करना चाहते हैं?"
    },
    {
      triggers: ["daughter", "girl child", "passed 12th", "college fee for girl", "daughter marriage", "kanyadhan", "बेटी", "लड़की", "12वीं पास की", "कॉलेज की फीस", "कन्यादान", "नंदा गौरा"],
      matchSvcId: "SCH_GAURA",
      gptReplyEn: "Congratulations to your daughter! Under the **Nanda Gaura Scheme (Gaura Devi Kanyadhan)**, the Uttarakhand Government provides a direct financial grant of **₹51,000** for girl students passing Class 12 to pursue higher education. I can help you prepare the application right now.",
      gptReplyHi: "आपकी बेटी को बहुत-बहुत बधाई! उत्तराखंड सरकार की **'नंदा गौरा योजना'** के तहत 12वीं पास बालिकाओं को उच्च शिक्षा हेतु **₹51,000** की एकमुश्त वित्तीय सहायता दी जाती है। क्या आप अभी आवेदन भरना चाहते हैं?"
    },
    {
      triggers: ["father is 65", "mother is 60", "old age", "elderly financial help", "senior citizen", "बुजुर्ग", "पिताजी 60 साल के हैं", "माताजी वृद्ध हैं", "बुढ़ापा पेंशन", "वृद्ध"],
      matchSvcId: "ES90",
      gptReplyEn: "For your elderly family member, the **Old Age Pension Scheme** provides a guaranteed **₹1,500 every month** directly transferred to their bank account via DBT. The application is completely free and processed in 15 days under the Right to Service Act.",
      gptReplyHi: "वरिष्ठ नागरिकों के लिए उत्तराखंड सरकार की **'वृद्धावस्था पेंशन योजना'** है, जिसके तहत प्रतिमाह **₹1,500** सीधे बैंक खाते में (DBT) भेजे जाते हैं। यह सेवा 15 दिनों में निशुल्क स्वीकृत होती है।"
    },
    {
      triggers: ["hospital", "medical bills", "treatment cost", "surgery", "medicine", "illness", "sick", "अस्पताल", "दवा", "इलाज", "बीमारी", "ऑपरेशन", "पैसा नहीं है इलाज के लिए"],
      matchSvcId: "SCH_AYUSHMAN",
      gptReplyEn: "For medical treatment support, every family in Uttarakhand is covered under the **Atal Ayushman Yojana**, providing **₹5,00,000 free cashless hospital treatment** every year across empanelled hospitals. You only need your Ration card and Aadhaar to generate the card instantly.",
      gptReplyHi: "इलाज के खर्च हेतु उत्तराखंड के प्रत्येक परिवार के लिए **'अटल आयुष्मान योजना'** है, जिसमें प्रतिवर्ष **₹5,00,000** तक का निशुल्क कैशलेस इलाज मिलता है। राशन कार्ड व आधार से गोल्डन कार्ड तुरंत बन जाता है।"
    },
    {
      triggers: ["broken pipe", "water leakage", "no water", "electricity cut", "pothole", "garbage", "corrupt", "problem in colony", "पानी की पाइप टूट गई", "बिजली नहीं आ रही", "सड़क में गड्ढे", "अधिकारी नहीं सुन रहा", "शिकायत करनी है"],
      matchSvcId: "GRIEVANCE_1905",
      gptReplyEn: "For civic and public service grievances, you can file a direct complaint on the **CM Helpline 1905**. It is monitored directly by the Chief Minister's Office and District Magistrate with a strict 7-day resolution timeline. I can log your complaint ticket right now.",
      gptReplyHi: "नागरिक समस्याओं (पानी, बिजली, सड़क, सफाई) के त्वरित समाधान हेतु **'मुख्यमंत्री हेल्पलाइन 1905'** है। यह सीधे मुख्यमंत्री कार्यालय द्वारा मॉनिटर की जाती है। मैं अभी आपकी शिकायत दर्ज कर सकता हूँ।"
    }
  ];

  const MOCK_APPLICATIONS = {
    "UK-REV-2026-8942": {
      id: "UK-REV-2026-8942",
      serviceName: "Income Certificate (आय प्रमाण पत्र)",
      serviceNameHi: "आय प्रमाण पत्र",
      applicant: "Ramesh Negi",
      applicantHi: "रमेश नेगी",
      appliedOn: "10 Aug 2026",
      targetDate: "25 Aug 2026 (15 Days RTS)",
      status: "In Progress",
      statusHi: "प्रक्रियाधीन",
      statusCode: "in_progress",
      timeline: [
        { title: "Application Submitted Online", titleHi: "आवेदन ऑनलाइन जमा हुआ", date: "10 Aug 2026", done: true },
        { title: "Field Verification by Patwari", titleHi: "पटवारी द्वारा स्थलीय सत्यापन पूर्ण", date: "14 Aug 2026", done: true },
        { title: "Revenue Inspector (RI) Forwarded", titleHi: "राजस्व निरीक्षक द्वारा अग्रसारित", date: "16 Aug 2026", done: true },
        { title: "Tehsildar Digital Signature & Issue", titleHi: "तहसीलदार डिजिटल हस्ताक्षर", date: "Pending (Expected 18 Aug)", done: false }
      ]
    }
  };

  const SAMPLE_QUESTIONS_EN = [
    { text: "I lost my job and want to start a homestay, is there any government scheme?", tag: "💼 Business Loan", isIssue: true },
    { text: "My daughter passed 12th class, can she get financial help for college?", tag: "👧 ₹51,000 Grant", isIssue: true },
    { text: "My father is 65 years old, what pension can he receive?", tag: "👴 ₹1,500 Pension", isIssue: true },
    { text: "Drinking water pipe is broken on my road, how to lodge complaint?", tag: "📣 CM 1905 Helpline", isIssue: true },
    { text: "What documents do I need for Income Certificate?", tag: "💰 Income Cert", svcId: "ES09" },
    { text: "How much is the fee and SLA for Domicile Certificate?", tag: "🏠 Domicile", svcId: "ES01" },
    { text: "Track application UK-REV-2026-8942", tag: "🔍 Status Track", isTrack: true, trackId: "UK-REV-2026-8942" }
  ];

  const SAMPLE_QUESTIONS_HI = [
    { text: "मेरी नौकरी छूट गई है और मुझे नया काम शुरू करना है, कोई सरकारी योजना है?", tag: "💼 स्वरोजगार लोन", isIssue: true },
    { text: "मेरी बेटी ने 12वीं पास की है, क्या उसे कॉलेज के लिए पैसे मिलेंगे?", tag: "👧 ₹51,000 सहायता", isIssue: true },
    { text: "मेरे पिताजी 65 वर्ष के हैं, उन्हें कौन सी पेंशन मिल सकती है?", tag: "👴 ₹1,500 पेंशन", isIssue: true },
    { text: "हमारे मोहल्ले में पानी की पाइप टूटी है, सीधी शिकायत कैसे करें?", tag: "📣 सीएम हेल्पलाइन 1905", isIssue: true },
    { text: "मुझे आय प्रमाण पत्र बनवाना है, क्या दस्तावेज चाहिए?", tag: "💰 आय प्रमाण", svcId: "ES09" },
    { text: "मूल निवास प्रमाण पत्र की फीस और कितने दिन लगेंगे?", tag: "🏠 मूल निवास", svcId: "ES01" },
    { text: "आवेदन स्थिति जांचें UK-REV-2026-8942", tag: "🔍 स्टेटस", isTrack: true, trackId: "UK-REV-2026-8942" }
  ];

  const DEPARTMENTS = [
    { id: "all", name: "All Schemes & Services", nameHi: "सभी योजनाएं व सेवाएं", icon: "🏛️", count: UK_GOV_SERVICES.length },
    { id: "revenue", name: "Revenue & Certificates", nameHi: "राजस्व व प्रमाण पत्र", icon: "📜", count: 2 },
    { id: "social-welfare", name: "Pensions & Welfare", nameHi: "पेंशन व समाज कल्याण", icon: "🤝", count: 1 },
    { id: "women-child", name: "Women & Girl Child", nameHi: "महिला व बालिका", icon: "👧", count: 1 },
    { id: "industry", name: "Employment & MSME", nameHi: "उद्योग व स्वरोजगार", icon: "💼", count: 1 },
    { id: "health", name: "Health & Ayushman", nameHi: "स्वास्थ्य व आयुष्मान", icon: "🏥", count: 1 },
    { id: "grievance", name: "Public Grievances (1905)", nameHi: "जन शिकायत (1905)", icon: "📣", count: 1 }
  ];

  global.UK_KB = {
    services: UK_GOV_SERVICES,
    issueDiagnostics: AI_ISSUE_DIAGNOSTICS,
    questionsEn: SAMPLE_QUESTIONS_EN,
    questionsHi: SAMPLE_QUESTIONS_HI,
    departments: DEPARTMENTS,
    mockApplications: MOCK_APPLICATIONS,

    // Deep GPT Semantic & Problem-Inference Engine
    reasonCitizenIssue: function (query) {
      if (!query || typeof query !== 'string') return null;
      const q = query.toLowerCase().trim();

      // Check for greeting
      if (q === "hi" || q === "hello" || q === "hey" || q === "namaste" || q === "नमस्ते" || q === "help" || q === "मदद") {
        return {
          isGreeting: true,
          replyEn: "Hello! I am your **Uttarakhand AI Citizen Copilot**. I can help you find government welfare schemes, check your eligibility, guide you through certificates, or auto-fill official applications by voice. What issue or service can I assist you with today?",
          replyHi: "नमस्ते! मैं आपका **उत्तराखंड AI नागरिक सहायक** हूँ। मैं सरकारी कल्याणकारी योजनाओं को खोजने, आपकी पात्रता जांचने, प्रमाण पत्रों की जानकारी देने एवं बोलकर ऑनलाइन आवेदन भरने में आपकी सहायता कर सकता हूँ। आज मैं आपकी क्या मदद करूँ?"
        };
      }

      // Check for application tracking
      if (q.includes("uk-rev-2026-8942") || q.includes("8942") || (q.includes("track") || q.includes("status") || q.includes("स्थिति"))) {
        return { isTracking: true, trackId: "UK-REV-2026-8942" };
      }

      // 1. Check Issue Diagnostics Matrix (Real life problems)
      for (const diag of AI_ISSUE_DIAGNOSTICS) {
        for (const trig of diag.triggers) {
          if (q.includes(trig.toLowerCase())) {
            const matchedSvc = UK_GOV_SERVICES.find(s => s.id === diag.matchSvcId);
            return {
              isIssueMatch: true,
              matchedService: matchedSvc,
              replyEn: diag.gptReplyEn,
              replyHi: diag.gptReplyHi
            };
          }
        }
      }

      // 2. Fallback to Direct Service Matcher
      let bestMatch = null;
      let highestScore = 0;

      for (const svc of UK_GOV_SERVICES) {
        let score = 0;
        for (const kw of svc.keywords) {
          if (q.includes(kw.toLowerCase())) score += (kw.length > 4) ? 5 : 3;
        }
        if (q.includes(svc.dept.toLowerCase())) score += 2;
        if (q.includes(svc.category.toLowerCase())) score += 2;

        if (score > highestScore) {
          highestScore = score;
          bestMatch = svc;
        }
      }

      if (highestScore >= 3 && bestMatch) {
        return {
          isDirectService: true,
          matchedService: bestMatch
        };
      }

      return null;
    }
  };

})(typeof window !== 'undefined' ? window : this);
