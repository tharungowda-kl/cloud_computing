const bcrypt = require('bcryptjs');

// Pre-hashed passwords for instant instant demo login:
// admin123 -> $2a$10$wE0iO7H2G3vXFhT9m5x2Le1Z9Q7h6x4N3p5M6r8s9t0u1v2w3x4y5
// citizen123 -> $2a$10$7R9Kq1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y
const salt = bcrypt.genSaltSync(10);
const adminHashed = bcrypt.hashSync('admin123', salt);
const citizenHashed = bcrypt.hashSync('citizen123', salt);

const initialUsers = [
  {
    _id: 'usr_admin_001',
    name: 'District Administrator',
    email: 'admin@rural.gov',
    password: adminHashed,
    phone: '9876543210',
    district: 'Central Administrative District',
    role: 'admin',
    createdAt: new Date().toISOString()
  },
  {
    _id: 'usr_citizen_001',
    name: 'Ramesh Kumar',
    email: 'citizen@rural.gov',
    password: citizenHashed,
    phone: '9845012345',
    district: 'Mandya Rural',
    role: 'citizen',
    createdAt: new Date().toISOString()
  }
];

const initialSchemes = [
  {
    _id: 'scm_001',
    name: 'PM-Kisan Samman Nidhi Yojana',
    department: 'Ministry of Agriculture & Farmers Welfare',
    category: 'Agriculture',
    description: 'Provides direct financial support of ₹6,000 per year in three equal instalments of ₹2,000 to all small and marginal landholding farmer families across India.',
    eligibility: 'All landholding farmer families having cultivable landholding in their names. Excludes institutional landholders and tax-paying professionals.',
    benefits: '₹6,000 annual direct cash transfer credited into farmer bank accounts via DBT.',
    documentsRequired: ['Aadhaar Card', 'Land Ownership Records (RTC/Pahani)', 'Bank Account Passbook'],
    deadline: 'Open round the year',
    applicationLink: 'https://pmkisan.gov.in'
  },
  {
    _id: 'scm_002',
    name: 'Ayushman Bharat (PM-JAY)',
    department: 'National Health Authority (NHA)',
    category: 'Healthcare',
    description: 'The world\'s largest government-funded healthcare assurance scheme, offering comprehensive cashless secondary and tertiary hospitalization care.',
    eligibility: 'Families identified based on SECC 2011 rural deprivation criteria and active rural ration cards.',
    benefits: 'Up to ₹5,00,000 per family per year for secondary and tertiary care hospitalization across impanelled public and private hospitals.',
    documentsRequired: ['Aadhaar Card', 'Ration Card (BPL/Antyodaya)', 'Family ID proof'],
    deadline: 'Permanent Ongoing Scheme',
    applicationLink: 'https://mera.pmjay.gov.in'
  },
  {
    _id: 'scm_003',
    name: 'Pradhan Mantri Awas Yojana - Gramin (PMAY-G)',
    department: 'Ministry of Rural Development',
    category: 'Housing',
    description: 'Aims to provide pucca houses with basic amenities like water, sanitation, and electricity to all houseless households and those living in kutcha or dilapidated houses in rural areas.',
    eligibility: 'Houseless families or households living in zero, one, or two-room houses with kutcha walls and kutcha roof in SECC data.',
    benefits: 'Financial assistance of ₹1,20,000 in plains and ₹1,30,000 in hilly/difficult areas, plus 90-95 days of unskilled labour under MGNREGA.',
    documentsRequired: ['Aadhaar Card', 'Bank Account details', 'MGNREGA Job Card', 'Land document / Gram Panchayat NOC'],
    deadline: 'Open round the year via Gram Sabha',
    applicationLink: 'https://pmayg.nic.in'
  },
  {
    _id: 'scm_004',
    name: 'Mahatma Gandhi NREGA (Rural Employment)',
    department: 'Department of Rural Development',
    category: 'Employment',
    description: 'Guarantees at least 100 days of wage employment in a financial year to every rural household whose adult members volunteer to do unskilled manual work.',
    eligibility: 'Any rural resident aged 18 years and above willing to perform unskilled manual labour in their local Gram Panchayat.',
    benefits: 'Guaranteed 100 days wage employment at statutory state rural wage rates deposited directly into bank accounts.',
    documentsRequired: ['Passport photo', 'Aadhaar Card', 'Voter ID', 'Bank Passbook copy'],
    deadline: 'Ongoing enrollment at Gram Panchayat',
    applicationLink: 'https://nrega.nic.in'
  },
  {
    _id: 'scm_005',
    name: 'PM Krishi Sinchayee Yojana (Micro-Irrigation)',
    department: 'Ministry of Jal Shakti & Agriculture',
    category: 'Agriculture',
    description: 'Promotes "Per Drop More Crop" through subsidized micro-irrigation systems (drip and sprinkler) to maximize water use efficiency and crop yield.',
    eligibility: 'All farmers possessing cultivable land with an assured water source (borewell, open well, or canal). Special subsidy for small & marginal farmers.',
    benefits: 'Up to 55% subsidy for small and marginal farmers, and 45% subsidy for other farmers on certified drip/sprinkler equipment.',
    documentsRequired: ['Land RTC / Record of Rights', 'Water source verification certificate', 'Aadhaar Card', 'Bank Passbook'],
    deadline: 'Annual State Batch - Active',
    applicationLink: 'https://pmksy.gov.in'
  },
  {
    _id: 'scm_006',
    name: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
    department: 'Ministry of Agriculture',
    category: 'Agriculture',
    description: 'Comprehensive risk insurance coverage to provide financial support to farmers suffering crop loss or damage arising out of unforeseen natural events.',
    eligibility: 'All farmers growing notified crops in notified areas including sharecroppers and tenant farmers.',
    benefits: 'Low premium (2% for Kharif, 1.5% for Rabi, 5% for commercial/horticultural) with full sum insured payout on verified yield loss.',
    documentsRequired: ['Sowing Certificate from Village Accountant', 'Land RTC', 'Aadhaar', 'Bank Passbook'],
    deadline: 'Before cut-off dates for Kharif & Rabi seasons',
    applicationLink: 'https://pmfby.gov.in'
  }
];

const initialScholarships = [
  {
    _id: 'sch_001',
    name: 'Post-Matric Scholarship for Rural & SC/ST/OBC Students',
    provider: 'Ministry of Social Justice and Empowerment',
    category: 'Post-Matric',
    eligibility: 'Students studying in Class 11, 12, ITI, Diploma, Undergraduate or Postgraduate with family annual income less than ₹2.5 Lakhs.',
    amount: '₹12,000 to ₹45,000 per year + Full College Tuition Fee Reversal',
    deadline: '30 November 2026',
    applicationLink: 'https://scholarships.gov.in',
    description: 'Enables meritorious rural youth from disadvantaged backgrounds to complete higher and professional education without financial burden.'
  },
  {
    _id: 'sch_002',
    name: 'National Means-cum-Merit Scholarship Scheme (NMMSS)',
    provider: 'Department of School Education and Literacy',
    category: 'Pre-Matric',
    eligibility: 'Students studying in Class 9 who scored at least 55% in Class 8 from government or aided rural schools. Parental income below ₹3.5 Lakhs.',
    amount: '₹12,000 per year (₹1,000 per month from Class 9 to 12)',
    deadline: '15 December 2026',
    applicationLink: 'https://scholarships.gov.in',
    description: 'Aimed at arresting the dropout rate among meritorious rural students after Class 8 and supporting their high school education.'
  },
  {
    _id: 'sch_003',
    name: 'AICTE Pragati Scholarship for Girls in Technical Education',
    provider: 'All India Council for Technical Education (AICTE)',
    category: 'Girls Education',
    eligibility: 'Girl students admitted to 1st year of Diploma or Degree technical programs in AICTE-approved institutions with family income below ₹8 Lakhs.',
    amount: '₹50,000 per annum for tuition, equipment, and books',
    deadline: '31 December 2026',
    applicationLink: 'https://www.aicte-pragati-saksham-gov.in',
    description: 'Empowers young rural women to pursue engineering, polytechnic, and technical courses with complete financial autonomy.'
  },
  {
    _id: 'sch_004',
    name: 'PM YASASVI Pre- & Post-Matric Scholarship',
    provider: 'National Testing Agency / Ministry of Social Justice',
    category: 'Merit-Based',
    eligibility: 'OBC, EBC, and DNT students studying in Class 9 or 11 in identified top rural schools with annual family income below ₹2.5 Lakhs.',
    amount: 'Up to ₹75,000 per year for Class 9-10; ₹1,25,000 for Class 11-12',
    deadline: '20 January 2027',
    applicationLink: 'https://yet.nta.ac.in',
    description: 'Competitive merit scholarship recognizing high academic potential in underserved semi-urban and rural areas.'
  },
  {
    _id: 'sch_005',
    name: 'Central Sector Scheme of Scholarships for University Students',
    provider: 'Department of Higher Education (MHRD)',
    category: 'Higher Education',
    eligibility: 'Students above 80th percentile in relevant stream in Class 12 pursuing regular degree courses. Family income under ₹4.5 Lakhs.',
    amount: '₹12,000 per year at Graduation; ₹20,000 per year at Post-Graduation',
    deadline: '15 January 2027',
    applicationLink: 'https://scholarships.gov.in',
    description: 'Direct financial assistance to top rural board performers pursuing regular bachelor degree programs.'
  }
];

const initialAgriculture = [
  {
    _id: 'agr_001',
    title: 'Modern Drip Irrigation Practices for Water Scarcity Regions',
    category: 'Irrigation Methods',
    cropType: 'Horticulture, Cotton, Sugarcane',
    season: 'All Seasons',
    summary: 'How to save 40-60% irrigation water while increasing crop yield by 30% using low-cost pressure compensated drip emitters.',
    content: 'Drip irrigation delivers water directly to the plant root zone via a network of valves, pipes, tubing, and emitters. For rural farmers facing depleting borewell levels, drip irrigation reduces weed growth, prevents fertilizer leaching, and permits uniform fertigation. Regular acid treatment (1-2 times a season) prevents emitter clogging from hard borewell water.',
    tips: [
      'Install a 120-mesh disk filter at the pump outlet to prevent silt clogging.',
      'Operate drip lines during early morning or evening to reduce evaporation.',
      'Apply water-soluble fertilizers directly through venturi injectors for 35% better uptake.'
    ]
  },
  {
    _id: 'agr_002',
    title: 'Organic Soil Health Improvement via Vermicompost and Jeevamrutha',
    category: 'Soil Health & Fertilizer',
    cropType: 'Paddy, Pulses, Vegetables',
    season: 'Pre-Sowing & Kharif',
    summary: 'A step-by-step practical guide to preparing Jeevamrutha bio-fertilizer and vermicompost using farm yard manure and indigenous cow dung.',
    content: 'Healthy soil contains millions of beneficial microbes that break down organic matter into easily absorbable plant nutrients. Jeevamrutha is prepared by fermenting 10kg desi cow dung, 10L cow urine, 2kg jaggery, 2kg pulse flour, and a handful of fertile virgin soil in 200L water for 48 hours. When applied with irrigation water, it restores soil microflora without expensive chemical fertilizers.',
    tips: [
      'Stir the Jeevamrutha barrel twice daily in clockwise direction for aeration.',
      'Apply within 7 days of fermentation for maximum microbial density.',
      'Top-dress with vermicompost (2 tonnes per acre) during secondary tillage.'
    ]
  },
  {
    _id: 'agr_003',
    title: 'Integrated Pest Management for Paddy and Millets without Excessive Pesticides',
    category: 'Pest & Disease Control',
    cropType: 'Paddy, Ragi, Bajra',
    season: 'Kharif',
    summary: 'Cost-effective methods using yellow sticky traps, neem oil spray (10,000 ppm), and trichogramma egg parasitoids to protect crops.',
    content: 'Over-reliance on synthetic pesticides kills natural predators like spiders, ladybird beetles, and dragonflies, triggering pest resurgence. Integrated Pest Management (IPM) combines cultural controls (clean bunds, crop rotation), mechanical traps (pheromone traps at 5 per acre), and botanical extracts (5% neem seed kernel extract) to manage brown planthopper, stem borer, and armyworms effectively.',
    tips: [
      'Install bird perches at 20 per acre to attract insect-eating birds naturally.',
      'Spray 5ml/litre Neem Oil (10,000 ppm) with mild soap emulsifier at first sign of infestation.',
      'Maintain 20cm alleys every 2 metres in paddy to allow sunlight and airflow, suppressing fungal blast.'
    ]
  },
  {
    _id: 'agr_004',
    title: 'High-Yielding Millet Cultivation Guide: Ragi, Jowar & Foxtail Millet',
    category: 'Crop Management',
    cropType: 'Millets (Shree Anna)',
    season: 'Kharif & Rabi',
    summary: 'Millets require 70% less water than rice, withstand harsh heat, and offer guaranteed minimum support price (MSP) in state procurement.',
    content: 'With erratic rainfall patterns, millets are the ideal climate-resilient crop for rainfed rural regions. Improved seed varieties (e.g., GPU-28, ML-365 for Ragi) mature in 100-115 days. Line sowing at 22.5cm spacing followed by intercultivation with cycle weeders reduces labour costs and enhances grain filling.',
    tips: [
      'Treat seeds with Azospirillum and Phosphobacteria (200g/10kg seed) before sowing.',
      'Perform light hoeing at 20 and 40 days after sowing to aerate root systems.',
      'Store harvested grains with 10-12% moisture in dry metallic bins with dried neem leaves.'
    ]
  },
  {
    _id: 'agr_005',
    title: 'Solar Water Pump Subsidy (PM-KUSUM Component-B) Implementation',
    category: 'Modern Tools & Subsidies',
    cropType: 'All Crops',
    season: 'Year-Round',
    summary: 'How rural farmers can get up to 60% government subsidy to install standalone 3HP to 7.5HP solar photovoltaic water pumps.',
    content: 'PM-KUSUM Component-B provides individual farmers support to install standalone solar water pumping systems in off-grid rural areas. The system replaces diesel pumps, eliminating recurring diesel expenses and reducing carbon footprint. The central and state governments each provide 30% subsidy, while the farmer covers 10% and bank loans cover the remaining 30%.',
    tips: [
      'Ensure clear shadow-free ground with South-facing alignment for solar panels.',
      'Clean solar panels with a soft cloth and clean water once a week for peak efficiency.',
      'Apply through the official state renewable energy development agency (e.g., KREDL/MSEDCL).'
    ]
  }
];

const initialNotifications = [
  {
    _id: 'notif_001',
    title: 'PM-KISAN 17th Installment Release Update',
    message: 'The Ministry has announced the direct benefit transfer for PM-KISAN. Please verify that your bank account is Aadhaar-seeded and e-KYC is completed on the portal.',
    category: 'Schemes',
    priority: 'High',
    readBy: [],
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    _id: 'notif_002',
    title: 'Monsoon Sowing Advisory: Pre-monsoon showers expected',
    message: 'District Agro-meteorology unit advises farmers to complete summer ploughing and prepare farm ponds. Moderate to heavy rainfall predicted across taluks over next 4 days.',
    category: 'Weather',
    priority: 'Urgent',
    readBy: [],
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString()
  },
  {
    _id: 'notif_003',
    title: 'Post-Matric Scholarship Portal Deadline Extended',
    message: 'State welfare board has extended the scholarship application deadline to 30th November 2026. Students can submit income & caste certificates online.',
    category: 'Scholarships',
    priority: 'Normal',
    readBy: [],
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString()
  },
  {
    _id: 'notif_004',
    title: 'Subsidy on Certified Drip Irrigation Units Open',
    message: 'Horticulture Department is inviting online applications for 55% micro-irrigation subsidy. Contact your local Raitha Seva Kendra or apply through our schemes portal.',
    category: 'Agriculture',
    priority: 'Normal',
    readBy: [],
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
  }
];

module.exports = {
  initialUsers,
  initialSchemes,
  initialScholarships,
  initialAgriculture,
  initialNotifications
};
