const express = require('express');
const router = express.Router();
const c = require('../controllers/harvestController');

router.route('/').get(c.getHarvests).post(c.createHarvest);
router.route('/:id').get(c.getHarvestById).put(c.updateHarvest).delete(c.deleteHarvest);

module.exports = router;