const express = require('express');
const router = express.Router();
const {adminAuth}=require("../services/auth/adminAuth")
const {validateAdminLogin}=require('../middlewares/authValidation');
const {adminLogin,getSubscriptions,getSubPhoto,acceptSubscription,denySubscription}=require("../controllers/adminController")
const {sendNotification}=require("../middlewares/notification");
const { checkSubscriptionId } = require('../middlewares/checkSubParam');
const {deleteFile}=require("../services/subscription/adminFiles")

router.post('/login', validateAdminLogin, adminLogin);
router.get('/getSubscriptions', adminAuth, getSubscriptions);
router.get('/getPhoto/:sub_id?', adminAuth,checkSubscriptionId, getSubPhoto);
router.post("/acceptSub/:sub_id?",adminAuth,checkSubscriptionId,acceptSubscription,deleteFile,sendNotification)
router.post("/denySubscription/:sub_id?",adminAuth,checkSubscriptionId,denySubscription,deleteFile,sendNotification)





module.exports = router;