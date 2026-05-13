export const farmer = {
  id: 'f001',
  name: 'Tinashe Moyo',
  initials: 'TM',
  phone: '+263 77 234 5678',
  email: 'tinashe.moyo@gmail.com',
  farm: 'Moyo Family Farm',
  district: 'Bindura',
  province: 'Mashonaland Central',
  coordinates: { lat: -17.3022, lng: 31.3314 },
  hectares: 5.5,
  crops: ['Maize', 'Soybean'],
  season: '2024/25',
  memberSince: 'March 2024',
  totalScans: 47,
  savedIncome: 1240,
};

export const diseases = [
  {
    id: 1,
    name: 'Gray Leaf Spot',
    pathogen: 'Cercospora zeae-maydis',
    crop: 'Maize',
    confidence: 87,
    severity: 'Moderate',
    severityColor: '#F9A825',
    yieldLoss: '12–18%',
    treatment:
      'Apply Mancozeb (2g/L) or Propiconazole (0.5ml/L). Repeat every 14 days during wet season. Begin treatment at first sign of lesions.',
    prevention: [
      'Use resistant hybrid varieties (SC403, SC513)',
      'Practice 2-year crop rotation with legumes',
      'Ensure adequate plant spacing for airflow (75cm rows)',
    ],
    regionalCases: 47,
    provinces: ['Mashonaland Central', 'Manicaland', 'Midlands'],
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Maize_plant.jpg/320px-Maize_plant.jpg',
    detectedAt: '2 hours ago',
    description:
      'Small tan to gray rectangular lesions with yellow halos. Lesions elongate parallel to leaf veins. Spreads rapidly under humid conditions.',
  },
  {
    id: 2,
    name: 'Northern Corn Leaf Blight',
    pathogen: 'Exserohilum turcicum',
    crop: 'Maize',
    confidence: 92,
    severity: 'Severe',
    severityColor: '#EF6C00',
    yieldLoss: '20–35%',
    treatment:
      'Apply Tebuconazole + Trifloxystrobin at first sign. Two applications 14 days apart. Remove severely infected plant debris.',
    prevention: [
      'Plant resistant varieties with Ht1 gene resistance',
      'Avoid overhead irrigation — use drip systems',
      'Scout fields weekly from V6 stage onwards',
    ],
    regionalCases: 31,
    provinces: ['Manicaland', 'Mashonaland East'],
    image: null,
    detectedAt: '1 day ago',
    description:
      'Long cigar-shaped tan lesions (up to 15cm) that start on lower leaves and progress upward. Heavy infections cause significant leaf death.',
  },
  {
    id: 3,
    name: 'Tobacco Mosaic Virus',
    pathogen: 'TMV (Tobamovirus)',
    crop: 'Tobacco',
    confidence: 79,
    severity: 'Mild',
    severityColor: '#4CAF50',
    yieldLoss: '5–10%',
    treatment:
      'No chemical cure. Remove and destroy infected plants immediately. Disinfect tools with 10% bleach solution. Control aphid vectors with imidacloprid.',
    prevention: [
      'Use certified virus-free transplants',
      'Control tobacco aphids (primary vector)',
      'Wash hands before handling plants — workers are common vectors',
    ],
    regionalCases: 18,
    provinces: ['Mashonaland West', 'Mashonaland Central'],
    image: null,
    detectedAt: '3 days ago',
    description:
      'Mosaic pattern of light and dark green areas on leaves. Leaves may be wrinkled, distorted, or stunted. Affects quality grade significantly.',
  },
  {
    id: 4,
    name: 'Soybean Rust',
    pathogen: 'Phakopsora pachyrhizi',
    crop: 'Soybean',
    confidence: 94,
    severity: 'Critical',
    severityColor: '#B71C1C',
    yieldLoss: '40–80%',
    treatment:
      'URGENT: Apply triazole fungicides (Tebuconazole, Propiconazole) immediately. Three applications 10–14 days apart. Use strobilurin mix for resistance management.',
    prevention: [
      'Plant early (October) to avoid peak spore pressure',
      'Monitor fields twice weekly during pod fill',
      'Eliminate volunteer soybeans — harbor overwintering spores',
    ],
    regionalCases: 63,
    provinces: ['Manicaland', 'Mashonaland East', 'Masvingo'],
    image: null,
    detectedAt: '5 hours ago',
    description:
      'Tan to brown angular lesions on lower leaf surfaces with distinctive rust-colored spore pustules (uredinia). Causes rapid defoliation.',
  },
  {
    id: 5,
    name: 'Maize Streak Virus',
    pathogen: 'MSV (Mastrevirus)',
    crop: 'Maize',
    confidence: 88,
    severity: 'Moderate',
    severityColor: '#F9A825',
    yieldLoss: '15–25%',
    treatment:
      'No cure. Control leafhopper vector with imidacloprid or thiamethoxam seed treatment. Remove heavily infected plants to reduce spread.',
    prevention: [
      'Use MSV-tolerant hybrids (PAN 67, DK8031)',
      'Early planting reduces leafhopper pressure',
      'Avoid planting near old maize stubble',
    ],
    regionalCases: 29,
    provinces: ['Midlands', 'Mashonaland Central', 'Matabeleland North'],
    image: null,
    detectedAt: '2 days ago',
    description:
      'Narrow yellow streaks running parallel to leaf veins. Stunted growth and reduced ear development. Spread by maize leafhopper (Cicadulina mbila).',
  },
];

export const weatherData = {
  current: {
    location: 'Bindura, Mashonaland Central',
    temp: 28,
    feelsLike: 31,
    humidity: 74,
    wind: 12,
    windDir: 'NE',
    uvIndex: 7,
    visibility: 10,
    pressure: 1012,
    rainChance: 40,
    condition: 'Partly Cloudy',
    conditionIcon: 'partly-cloudy',
    updatedAt: '10:45 AM',
  },
  forecast: [
    { day: 'Today', high: 28, low: 18, condition: 'Partly Cloudy', icon: 'partly-cloudy', rain: 40, humidity: 74 },
    { day: 'Thu', high: 26, low: 17, condition: 'Showers', icon: 'rain', rain: 75, humidity: 82 },
    { day: 'Fri', high: 24, low: 16, condition: 'Heavy Rain', icon: 'heavy-rain', rain: 90, humidity: 88 },
    { day: 'Sat', high: 25, low: 17, condition: 'Thunderstorm', icon: 'storm', rain: 85, humidity: 86 },
    { day: 'Sun', high: 27, low: 18, condition: 'Cloudy', icon: 'cloudy', rain: 30, humidity: 70 },
    { day: 'Mon', high: 29, low: 19, condition: 'Sunny', icon: 'sunny', rain: 10, humidity: 58 },
    { day: 'Tue', high: 31, low: 20, condition: 'Sunny', icon: 'sunny', rain: 5, humidity: 52 },
  ],
  weeklyTemp: {
    labels: ['Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Mon', 'Tue'],
    high: [28, 26, 24, 25, 27, 29, 31],
    low: [18, 17, 16, 17, 18, 19, 20],
  },
  weeklyRain: {
    labels: ['Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Mon', 'Tue'],
    data: [8, 22, 35, 28, 5, 0, 0],
  },
  weeklyHumidity: {
    labels: ['Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Mon', 'Tue'],
    data: [74, 82, 88, 86, 70, 58, 52],
  },
  diseaseRiskIndex: {
    score: 72,
    level: 'High',
    color: '#EF6C00',
    message:
      'Sustained humidity above 80% forecast Thursday–Saturday creates favorable conditions for Gray Leaf Spot, NCLB, and Soybean Rust. Scout fields immediately.',
    peakRiskDays: ['Thursday', 'Friday', 'Saturday'],
  },
};

export const zimbabweDistricts = [
  { id: 1, name: 'Harare', province: 'Harare', lat: -17.8292, lng: 31.0522, riskLevel: 'Low', activeAlerts: 3, crop: 'Mixed' },
  { id: 2, name: 'Bindura', province: 'Mashonaland Central', lat: -17.3022, lng: 31.3314, riskLevel: 'High', activeAlerts: 12, crop: 'Maize' },
  { id: 3, name: 'Mutare', province: 'Manicaland', lat: -18.9707, lng: 32.6709, riskLevel: 'Critical', activeAlerts: 19, crop: 'Maize/Soybean' },
  { id: 4, name: 'Gweru', province: 'Midlands', lat: -19.4534, lng: 29.8147, riskLevel: 'Moderate', activeAlerts: 7, crop: 'Maize' },
  { id: 5, name: 'Chinhoyi', province: 'Mashonaland West', lat: -17.3616, lng: 30.2018, riskLevel: 'Moderate', activeAlerts: 8, crop: 'Tobacco' },
  { id: 6, name: 'Masvingo', province: 'Masvingo', lat: -20.0611, lng: 30.8278, riskLevel: 'High', activeAlerts: 11, crop: 'Soybean' },
  { id: 7, name: 'Marondera', province: 'Mashonaland East', lat: -18.1858, lng: 31.5515, riskLevel: 'High', activeAlerts: 14, crop: 'Maize' },
  { id: 8, name: 'Kadoma', province: 'Mashonaland West', lat: -18.3336, lng: 29.9111, riskLevel: 'Low', activeAlerts: 2, crop: 'Cotton' },
  { id: 9, name: 'Hwange', province: 'Matabeleland North', lat: -18.3617, lng: 26.4965, riskLevel: 'Low', activeAlerts: 1, crop: 'Sorghum' },
  { id: 10, name: 'Bulawayo', province: 'Bulawayo', lat: -20.1504, lng: 28.5850, riskLevel: 'Moderate', activeAlerts: 5, crop: 'Mixed' },
  { id: 11, name: 'Beitbridge', province: 'Matabeleland South', lat: -22.2167, lng: 30.0000, riskLevel: 'Low', activeAlerts: 1, crop: 'Wheat' },
  { id: 12, name: 'Chipinge', province: 'Manicaland', lat: -20.1940, lng: 32.6222, riskLevel: 'Critical', activeAlerts: 16, crop: 'Coffee/Banana' },
];

export const outbreaks = [
  {
    id: 1,
    disease: 'Soybean Rust',
    district: 'Mutare',
    province: 'Manicaland',
    severity: 'Critical',
    severityColor: '#B71C1C',
    reportedDate: 'Nov 12, 2024',
    farmersAffected: 127,
    areaAffected: '340 ha',
    trend: 'Increasing',
    trendIcon: 'trending-up',
  },
  {
    id: 2,
    disease: 'Gray Leaf Spot',
    district: 'Bindura',
    province: 'Mashonaland Central',
    severity: 'High',
    severityColor: '#EF6C00',
    reportedDate: 'Nov 10, 2024',
    farmersAffected: 84,
    areaAffected: '210 ha',
    trend: 'Stable',
    trendIcon: 'trending-neutral',
  },
  {
    id: 3,
    disease: 'NCLB',
    district: 'Marondera',
    province: 'Mashonaland East',
    severity: 'High',
    severityColor: '#EF6C00',
    reportedDate: 'Nov 8, 2024',
    farmersAffected: 63,
    areaAffected: '180 ha',
    trend: 'Increasing',
    trendIcon: 'trending-up',
  },
  {
    id: 4,
    disease: 'Maize Streak Virus',
    district: 'Gweru',
    province: 'Midlands',
    severity: 'Moderate',
    severityColor: '#F9A825',
    reportedDate: 'Nov 6, 2024',
    farmersAffected: 41,
    areaAffected: '95 ha',
    trend: 'Decreasing',
    trendIcon: 'trending-down',
  },
  {
    id: 5,
    disease: 'Tobacco Mosaic Virus',
    district: 'Chinhoyi',
    province: 'Mashonaland West',
    severity: 'Moderate',
    severityColor: '#F9A825',
    reportedDate: 'Nov 5, 2024',
    farmersAffected: 28,
    areaAffected: '67 ha',
    trend: 'Stable',
    trendIcon: 'trending-neutral',
  },
];

export const alertTrendData = {
  labels: ['Oct 14', 'Oct 21', 'Oct 28', 'Nov 4', 'Nov 11'],
  data: [8, 14, 22, 38, 54],
};

export const costAnalysis = {
  scenarios: {
    low: {
      label: 'Low Risk (10% infection)',
      potentialLoss: 185,
      treatmentCost: 45,
      netSavings: 140,
      yieldLossTons: 0.55,
      breakdown: [
        { item: 'Mancozeb fungicide (1 app)', cost: 22 },
        { item: 'Labour (spray)', cost: 15 },
        { item: 'Application equipment', cost: 8 },
      ],
    },
    medium: {
      label: 'Medium Risk (25% infection)',
      potentialLoss: 340,
      treatmentCost: 85,
      netSavings: 255,
      yieldLossTons: 1.1,
      breakdown: [
        { item: 'Mancozeb (2 applications)', cost: 45 },
        { item: 'Labour (2 sprays)', cost: 25 },
        { item: 'Application equipment', cost: 15 },
      ],
    },
    high: {
      label: 'High Risk (50% infection)',
      potentialLoss: 620,
      treatmentCost: 140,
      netSavings: 480,
      yieldLossTons: 2.0,
      breakdown: [
        { item: 'Propiconazole (3 applications)', cost: 85 },
        { item: 'Labour (3 sprays)', cost: 35 },
        { item: 'Application equipment + hire', cost: 20 },
      ],
    },
  },
  chartData: {
    labels: ['Low', 'Medium', 'High'],
    treatmentCosts: [45, 85, 140],
    potentialLosses: [185, 340, 620],
  },
  supportPrograms: [
    { name: 'Zimnat Agri Insurance', type: 'Insurance', phone: '+263 4 252671' },
    { name: 'ZimFund Smallholder Grant', type: 'Grant', phone: '+263 4 700000' },
    { name: 'Agritex Extension Services', type: 'Advisory', phone: '+263 4 704531' },
  ],
};

export const recentScans = [
  {
    id: 's001',
    diseaseName: 'Gray Leaf Spot',
    crop: 'Maize',
    confidence: 87,
    severity: 'Moderate',
    severityColor: '#F9A825',
    date: 'Today, 8:32 AM',
    field: 'Field A (North)',
  },
  {
    id: 's002',
    diseaseName: 'Healthy Leaf',
    crop: 'Soybean',
    confidence: 96,
    severity: 'Healthy',
    severityColor: '#4CAF50',
    date: 'Yesterday, 3:15 PM',
    field: 'Field B (South)',
  },
  {
    id: 's003',
    diseaseName: 'Maize Streak Virus',
    crop: 'Maize',
    confidence: 88,
    severity: 'Moderate',
    severityColor: '#F9A825',
    date: 'Nov 9, 11:20 AM',
    field: 'Field A (South)',
  },
  {
    id: 's004',
    diseaseName: 'Soybean Rust',
    crop: 'Soybean',
    confidence: 91,
    severity: 'Critical',
    severityColor: '#B71C1C',
    date: 'Nov 7, 9:45 AM',
    field: 'Field C (East)',
  },
  {
    id: 's005',
    diseaseName: 'Healthy Leaf',
    crop: 'Maize',
    confidence: 98,
    severity: 'Healthy',
    severityColor: '#4CAF50',
    date: 'Nov 5, 7:30 AM',
    field: 'Field B (North)',
  },
];

export const communityReports = [
  {
    id: 'c001',
    farmerName: 'Chiedza Mhuru',
    district: 'Bindura',
    disease: 'Gray Leaf Spot',
    timeAgo: '2 hours ago',
    crop: 'Maize',
  },
  {
    id: 'c002',
    farmerName: 'Blessed Nyamande',
    district: 'Bindura',
    disease: 'Gray Leaf Spot',
    timeAgo: '4 hours ago',
    crop: 'Maize',
  },
  {
    id: 'c003',
    farmerName: 'Rutendo Chikwanda',
    district: 'Marondera',
    disease: 'NCLB',
    timeAgo: '6 hours ago',
    crop: 'Maize',
  },
];

export const notifications = {
  diseaseAlerts: true,
  weatherWarnings: true,
  marketUpdates: false,
  weeklyReports: true,
  communityReports: true,
};

export const riskLevels = {
  low: { label: 'LOW RISK', color: '#2E7D32', bg: '#E8F5E9', description: 'Conditions are favourable. Continue regular monitoring.' },
  moderate: { label: 'MODERATE RISK', color: '#F9A825', bg: '#FFF8E1', description: 'Elevated humidity. Increase scouting frequency.' },
  high: { label: 'HIGH RISK', color: '#EF6C00', bg: '#FFF3E0', description: 'Conditions favour disease spread. Apply preventive treatment.' },
  critical: { label: 'CRITICAL RISK', color: '#B71C1C', bg: '#FFEBEE', description: 'Outbreak conditions. Immediate intervention required.' },
};

export const crops = [
  { id: 'maize', label: 'Maize', icon: '🌽' },
  { id: 'soybean', label: 'Soybean', icon: '🫘' },
  { id: 'tobacco', label: 'Tobacco', icon: '🍃' },
  { id: 'wheat', label: 'Wheat', icon: '🌾' },
  { id: 'sorghum', label: 'Sorghum', icon: '🌿' },
  { id: 'cotton', label: 'Cotton', icon: '☁️' },
  { id: 'groundnut', label: 'Groundnut', icon: '🥜' },
  { id: 'sunflower', label: 'Sunflower', icon: '🌻' },
];

export const zimbabweProvinces = [
  'Harare',
  'Bulawayo',
  'Manicaland',
  'Mashonaland Central',
  'Mashonaland East',
  'Mashonaland West',
  'Masvingo',
  'Matabeleland North',
  'Matabeleland South',
  'Midlands',
];

export const districts: Record<string, string[]> = {
  'Harare': ['Harare Urban', 'Harare Rural', 'Chitungwiza', 'Epworth'],
  'Bulawayo': ['Bulawayo Urban'],
  'Manicaland': ['Mutare', 'Chipinge', 'Chimanimani', 'Buhera', 'Makoni', 'Mutasa', 'Nyanga', 'Nyanga North'],
  'Mashonaland Central': ['Bindura', 'Centenary', 'Guruve', 'Mazowe', 'Mount Darwin', 'Rushinga', 'Shamva'],
  'Mashonaland East': ['Chikomba', 'Goromonzi', 'Hwedza', 'Marondera', 'Mudzi', 'Murehwa', 'Murewa', 'Mutoko', 'Seke', 'UMP'],
  'Mashonaland West': ['Chinhoyi', 'Hurungwe', 'Kadoma', 'Kariba', 'Makonde', 'Zvimba'],
  'Masvingo': ['Bikita', 'Chiredzi', 'Chivi', 'Gutu', 'Masvingo', 'Mwenezi', 'Zaka'],
  'Matabeleland North': ['Binga', 'Bubi', 'Hwange', 'Lupane', 'Nkayi', 'Tsholotsho', 'Umguza'],
  'Matabeleland South': ['Beitbridge', 'Bulilima', 'Gwanda', 'Insiza', 'Mangwe', 'Matobo', 'Umzingwane'],
  'Midlands': ['Chirumhanzu', 'Gokwe North', 'Gokwe South', 'Gweru', 'Kwekwe', 'Mberengwa', 'Shurugwi', 'Zvishavane'],
};
