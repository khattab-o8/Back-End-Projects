// MODULES:
const express = require('express');
const viewsController = require('../controllers/viewsController');
//-------------Here-------------//

const router = express.Router();

router.get('/', viewsController.getOverview);
router.get('/tour/:slug', viewsController.getTour);

module.exports = router;
