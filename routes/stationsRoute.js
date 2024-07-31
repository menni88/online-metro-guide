const express = require('express');
const router = express.Router();
const controller = require('../controllers/stationController');


router.get('/getLines/:line',controller.getLine);

router.get('/getLines',controller.getAllLines);




module.exports = router ;