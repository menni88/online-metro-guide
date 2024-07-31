const express = require('express');
const router = express.Router();

const {validateTicketDetails} = require("../middlewares/ticketValidation");
const {getTripPath,getNavigationData} = require("../controllers/navigationController");


router.get("/get-navigation-data",getNavigationData);
router.post("/get-trip-path",validateTicketDetails, getTripPath);


module.exports = router;
