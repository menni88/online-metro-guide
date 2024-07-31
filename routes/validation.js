const express = require('express');
const router = express.Router();
const {validateTicket , validateSubscription} = require("../controllers/validation");
const {idValidation} = require("../middlewares/scanValidation");
const{updateCacheTicket}=require("../services/tickets/updatingAfterValidation");
const ScannerAuth =require("../middlewares/scannerAuth");
const { cacheTicketData } = require('../services/caching');


router.post('/ticket',ScannerAuth,idValidation,validateTicket,cacheTicketData,updateCacheTicket);
router.post('/subscription',ScannerAuth,idValidation,validateSubscription);


module.exports = router;