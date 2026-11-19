const c = require('./controllers/harvestController');  
(async () = 
  const req = { body: { harvestId: 'HR_TEST_2', farmId: 'FM999', season: 'Season B 2025', harvestDate: '2026-11-14', quantityKg: 1000, marketPricePerKg: 5000 } };  
  const res = { status(code) { this.statusCode = code; return this; }, json(obj) { console.log('JSON', obj); return this; } };  
