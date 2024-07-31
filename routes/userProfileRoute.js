const express = require('express');
const router = express.Router();
const UserAuthenticator =require("../services/auth/userAuth");
const is_auth = new UserAuthenticator();
const {getBalance ,charge} = require("../controllers/userProfileController");
const {chargeValidation}=require("../middlewares/userProfileValidation");
const PaymentStrategies = require("../services/paymentStrategies/paymentStrategies");
const PostPaymentStrategies = require("../services/paymentStrategies/postPaymentStrategies");
const paymentExecutor = new PaymentStrategies();
const postPaymentExecutor = new PostPaymentStrategies();


router.post("/charge",(req,res,next)=>is_auth.authenticate(req,res,next),chargeValidation, charge ,(req,res,next)=>paymentExecutor.execute(req,res,next) ,(req,res,next)=>postPaymentExecutor.execute(req,res,next));
router.get("/getBalance",(req,res,next)=>is_auth.authenticate(req,res,next),getBalance)

module.exports = router;
