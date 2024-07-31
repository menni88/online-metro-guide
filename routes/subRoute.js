const express = require('express');
const path = require("path");
const router = express.Router();
const {validateSubscriptionRequest,validationType } = require("../middlewares/subscriptionValidation");
const UserAuthenticator =require("../services/auth/userAuth");
const is_auth = new UserAuthenticator();
const{cacheSubscriptioion}=require('../services/caching');

const paymentStrategies = require("../services/paymentStrategies/paymentStrategies");
const postPaymentStrategies = require("../services/paymentStrategies/postPaymentStrategies");
const paymentExecutor = new paymentStrategies();
const postPaymentExecutor = new postPaymentStrategies();

const {getUserType ,activateSubscription, subscribe ,getSubscriptionDetails, getSubscriptionData,deleteSubscription,getUserSubscriptions,getSubscriptionQr}=require("../controllers/subController");
const multer  = require('multer');
const { StoreFile,deleteFile } = require('../services/subscription/subscriptionFiles');
const { checkSubscriptionId } = require('../middlewares/checkSubParam');
const { formatBadRequest } = require('../utils/responseModels');
const upload = multer({ 
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (!file) {
      return cb(null, true); 
    }
    
    var extension = path.extname(file.originalname);
    if (extension !== '.jpg' && extension !== '.jpeg') {
      const err = formatBadRequest(req, [{
        msg: 'image_format_not_supported',
        path: 'applicationForm',
        location: 'file'
      }]);
      return cb(err);
    }

    cb(null, true);
  }
});




router.get('/user-type', getUserType);

router.post('/subscription-application',(req,res,next)=>is_auth.authenticate(req,res,next),validationType, getSubscriptionData);

router.post('/make-subscription',(req,res,next)=>is_auth.authenticate(req,res,next),upload.single('applicationForm'), validateSubscriptionRequest,subscribe,StoreFile);

router.get('/getUserSubscriptions',(req,res,next)=>is_auth.authenticate(req,res,next), getUserSubscriptions);
router.get('/get-subscription-qr/:sub_id?',(req,res,next)=>is_auth.authenticate(req,res,next),checkSubscriptionId, getSubscriptionQr ,cacheSubscriptioion);
router.get('/get-subscriptionDetails/:sub_id?',(req,res,next)=>is_auth.authenticate(req,res,next),checkSubscriptionId, getSubscriptionDetails );
router.post('/activate-subscription/:sub_id?',(req,res,next)=>is_auth.authenticate(req,res,next),checkSubscriptionId, activateSubscription ,(req,res,next)=> paymentExecutor.execute(req,res,next) , (req,res,next)=>postPaymentExecutor.execute(req,res,next));
router.post('/delete-subscription/:sub_id?',(req,res,next)=>is_auth.authenticate(req,res,next),checkSubscriptionId,deleteSubscription,deleteFile)

module.exports = router;