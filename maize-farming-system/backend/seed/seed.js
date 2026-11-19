require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Farmer = require('../models/Farmer');
const Farm = require('../models/Farm');
const DiseaseReport = require('../models/DiseaseReport');
const HarvestReport = require('../models/HarvestReport');

const farmers = [
  { farmerId: 'F001', name: 'Ssemakula John',  phone: '+256701234567', district: 'Mukono',  village: 'Kiteza',  experienceYears: 12, gender: 'Male'   },
  { farmerId: 'F002', name: 'Nakato Mary',     phone: '+256772345678', district: 'Wakiso',  village: 'Nansana', experienceYears: 8,  gender: 'Female' },
  { farmerId: 'F003', name: 'Okello Peter',    phone: '+256753456789', district: 'Gulu',    village: 'Layibi',  experienceYears: 20, gender: 'Male'   },
  { farmerId: 'F004', name: 'Achieng Grace',   phone: '+256784567890', district: 'Lira',    village: 'Adyel',   experienceYears: 5,  gender: 'Female' },
  { farmerId: 'F005', name: 'Mugisha David',   phone: '+256705678901', district: 'Mbarara', village: 'Kakoba',  experienceYears: 15, gender: 'Male'   }
];

const farms = [
  { farmId: 'FM001', farmerId: 'F001', location: 'Mukono - Kiteza',   sizeAcres: 3.5,  soilType: 'Loam',       maizeVariety: 'Longe 5',   plantingDate: new Date('2024-03-15') },
  { farmId: 'FM002', farmerId: 'F002', location: 'Wakiso - Nansana',  sizeAcres: 6.0,  soilType: 'Sandy Loam', maizeVariety: 'DKC 9081',  plantingDate: new Date('2024-04-02') },
  { farmId: 'FM003', farmerId: 'F003', location: 'Gulu - Layibi',     sizeAcres: 10.0, soilType: 'Clay Loam',  maizeVariety: 'Longe 10H', plantingDate: new Date('2024-03-20') },
  { farmId: 'FM004', farmerId: 'F004', location: 'Lira - Adyel',      sizeAcres: 2.0,  soilType: 'Sandy',      maizeVariety: 'Bazooka',   plantingDate: new Date('2024-04-10') },
  { farmId: 'FM005', farmerId: 'F005', location: 'Mbarara - Kakoba',  sizeAcres: 7.5,  soilType: 'Loam',       maizeVariety: 'Longe 5',   plantingDate: new Date('2024-03-25') }
];

const diseases = [
  { reportId: 'DR001', farmId: 'FM001', diseaseName: 'Maize Streak Virus',          symptoms: 'Yellow streaks along leaf veins; stunted growth',           severity: 'Medium', reportDate: new Date('2024-05-10'), reportedBy: 'Ssemakula John' },
  { reportId: 'DR002', farmId: 'FM002', diseaseName: 'Fall Armyworm',                symptoms: 'Holes in leaves and whorls; frass visible',                 severity: 'High',   reportDate: new Date('2024-05-15'), reportedBy: 'Nakato Mary' },
  { reportId: 'DR003', farmId: 'FM003', diseaseName: 'Northern Corn Leaf Blight',    symptoms: 'Long elliptical grey-green lesions on leaves',              severity: 'High',   reportDate: new Date('2024-05-20'), reportedBy: 'Okello Peter' },
  { reportId: 'DR004', farmId: 'FM004', diseaseName: 'Maize Lethal Necrosis',        symptoms: 'Chlorotic mottling and premature leaf death',               severity: 'High',   reportDate: new Date('2024-05-25'), reportedBy: 'Achieng Grace' },
  { reportId: 'DR005', farmId: 'FM005', diseaseName: 'Common Rust',                  symptoms: 'Rusty brown pustules on leaf surfaces',                     severity: 'Low',    reportDate: new Date('2024-05-28'), reportedBy: 'Mugisha David' }
];

const harvests = [
  { harvestId: 'HR001', farmId: 'FM001', season: 'Season A 2024', quantityKg: 1200, harvestDate: new Date('2024-08-15'), marketPricePerKg: 1500, totalRevenue: 1800000 },
  { harvestId: 'HR002', farmId: 'FM002', season: 'Season A 2024', quantityKg: 2500, harvestDate: new Date('2024-08-20'), marketPricePerKg: 1600, totalRevenue: 4000000 },
  { harvestId: 'HR003', farmId: 'FM003', season: 'Season A 2024', quantityKg: 4200, harvestDate: new Date('2024-08-25'), marketPricePerKg: 1450, totalRevenue: 6090000 },
  { harvestId: 'HR004', farmId: 'FM004', season: 'Season A 2024', quantityKg: 700,  harvestDate: new Date('2024-08-28'), marketPricePerKg: 1700, totalRevenue: 1190000 },
  { harvestId: 'HR005', farmId: 'FM005', season: 'Season B 2023', quantityKg: 3100, harvestDate: new Date('2024-02-10'), marketPricePerKg: 1550, totalRevenue: 4805000 }
];

(async () => {
  try {
    await connectDB();
    
    // Clear out any existing data to prevent duplicate ID errors
    await Promise.all([
      Farmer.deleteMany({}), Farm.deleteMany({}),
      DiseaseReport.deleteMany({}), HarvestReport.deleteMany({})
    ]);
    
    // Insert sample data
    await Farmer.insertMany(farmers);
    await Farm.insertMany(farms);
    await DiseaseReport.insertMany(diseases);
    await HarvestReport.insertMany(harvests);
    
    console.log('✅ Successfully seeded 5 farmers, 5 farms, 5 disease reports and 5 harvest reports');
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
})();