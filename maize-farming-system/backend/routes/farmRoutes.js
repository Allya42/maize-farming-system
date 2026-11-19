const express = require('express');
const router = express.Router();
const c = require('../controllers/farmController');

router.route('/').get(c.getFarms).post(c.createFarm);
router.route('/:id/approve').patch(c.approveFarm);
router.route('/:id').get(c.getFarmById).put(c.updateFarm).delete(c.deleteFarm);

module.exports = router;