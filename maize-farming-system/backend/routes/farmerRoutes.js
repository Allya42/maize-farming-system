const express = require('express');
const router = express.Router();
const c = require('../controllers/farmerController');

router.route('/').get(c.getFarmers).post(c.createFarmer);
router.route('/:id').get(c.getFarmerById).put(c.updateFarmer).delete(c.deleteFarmer);

module.exports = router;