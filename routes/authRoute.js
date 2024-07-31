const express = require('express');
const router = express.Router();
const UserAuthenticator =require("../services/auth/userAuth");
const is_auth = new UserAuthenticator();

const ResetPasswordAuthenticator =require("../services/auth/resetpasswordauth");
const password_auth = new ResetPasswordAuthenticator();

const { register, login,updateUserToken,sendVerify,verifyCode,updatePassword,logout } = require('../controllers/authController');
const { validateRegistration,validateRefreshToken, validateLogin , verifyCodeValidation, updatePasswordValidation, sendResetCodeValidation } = require('../middlewares/authValidation');
const {sendInitialResponse}=require("../middlewares/sendInitialRes");
const {sendNotification}=require("../middlewares/notification");

router.post('/register', validateRegistration, register);
router.post('/login', validateLogin, login);
router.post('/refresh-token',validateRefreshToken, updateUserToken);
router.post('/send-verify',sendResetCodeValidation,sendInitialResponse,sendVerify,sendNotification);
router.post('/verify-Code',verifyCodeValidation,verifyCode);
router.post('/updatePassword',(req,res,next)=>password_auth.authenticate(req,res,next),updatePasswordValidation,updatePassword);
router.post('/logout', (req, res, next) => is_auth.authenticate(req, res, next), logout);

module.exports = router;