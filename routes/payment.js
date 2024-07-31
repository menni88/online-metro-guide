const { paymobCallback } = require("../controllers/payment");
const express = require("express");
const PostPaymentStrategies = require("../services/paymentStrategies/postPaymentStrategies");
const {sendNotification}=require("../middlewares/notification")
const postPaymentExecutor = new PostPaymentStrategies();
const router = express.Router();



router.post('/paymob-callback' , paymobCallback ,(req,res,next)=>postPaymentExecutor.execute(req,res,next),sendNotification);

module.exports = router;