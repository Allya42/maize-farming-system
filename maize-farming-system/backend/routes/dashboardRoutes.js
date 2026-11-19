const express = require('express');
const router = express.Router();
const c = require('../controllers/dashboardController');

router.get('/stats',                c.getStats);
router.get('/harvest-by-season',    c.getHarvestBySeason);
router.get('/disease-by-severity',  c.getDiseaseBySeverity);
router.get('/farmers-with-farms',   c.getFarmersWithFarms);
router.get('/diseases-with-farms',  c.getDiseasesWithFarms);
router.get('/high-severity',        c.getHighSeverityDiseases);
router.get('/farms-over-5-acres',   c.getLargeFarms);
router.get('/average-price',        c.getAveragePrice);

module.exports = router;