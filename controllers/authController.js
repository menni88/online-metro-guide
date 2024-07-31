const User = require('../models/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const redisClient = require('../config/redis');
const { sendSms } = require("../services/password/resetPasswordSMS")
const {calculateDateOfBirthAndgovernment} = require('../utils/date_of_birth');
const { passwordToken } = require("../services/password/resetpasswordtoken");
const {handleValidationErrors}=require("../utils/validateRequest");
const { formatStandardError } = require('../utils/responseModels');
const {sendSuccess}=require("../utils/responseModels");
const { notificatoinFormat } = require('../services/notificationFormat');
dotenv.config();




exports.register = async (req, res, next) => {
  try {
    handleValidationErrors(req);


    const { name, nationalId, phone, password } = req.body;

    const user = await User.findOne({ nationalId: nationalId });
    if (user) throw formatStandardError(req,409,'user_exists',null);
  
    const { dateOfBirth, government } = calculateDateOfBirthAndgovernment(nationalId);


    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    await User.create({
      name: name.trim(),
      nationalId,
      dateOfBirth,
      government,
      phone,
      password: hashedPassword,
    });
    sendSuccess(req,res,201,"user_created_successfully",null);
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {

    handleValidationErrors(req);

    const { nationalId, password,firebaseToken } = req.body;
    const user = await User.findOne({ nationalId: nationalId });

    if (!user) throw formatStandardError(req,404, 'user_not_found',null);

    if (!bcrypt.compareSync(password, user.password)) throw formatStandardError(req,401, 'wrong_password',null);
  

    const accessToken = user.genAccessToken();

    const refreshToken = user.genRefreshToken();

    user.refreshToken = refreshToken;
    user.firebaseToken=firebaseToken;
    await user.save();
    sendSuccess(req,res,200,"logged_in_successfully",{ 
      accessToken: accessToken, 
      balance: user.balance, 
      refreshToken: refreshToken 
    })
  } catch (err) {
    next(err);
  }
};




exports.updateUserToken = async (req, res, next) => {
  try {
   
    handleValidationErrors(req);
    const refreshToken = req.body.refreshToken;
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_KEY);
    const userId = decoded.userId;
    const user = await User.findOne({ _id: userId });

    if (!user) throw formatStandardError(req,404, 'user_not_found',null);
     
    if (user.refreshToken !== refreshToken) throw formatStandardError(req,401, 'invalid_refresh_token' ,null);
    
    const newAccessToken = user.genAccessToken();
    sendSuccess(req,res,200,null,{ accessToken: newAccessToken })

  } catch (err) {
    if (err instanceof jwt.JsonWebTokenError || err instanceof jwt.TokenExpiredError) {
    err =  formatStandardError(req,401, err.message,null);
  } 
    next(err);
  }

};



exports.sendVerify = async (req, res, next) => {
  try {
   handleValidationErrors(req);
    const duration = parseInt(process.env.EXPIRE_PASSWORD_TOKEN);
    const unit = process.env.EXPIRE_PASSWORD_TOKEN.replace(/[^a-zA-Z]/g, '');
    const translatedUnit = req.t(`units.${unit}`);
    const smsMessage = req.t('Your_verification_code_is', { code: req.verificationCode })
      + ' ' +
      req.t('verification_code_expires_in', { duration: `${duration} ${translatedUnit}` })

    const isSent = await sendSms(req.user.phone, smsMessage);

    if (!isSent) {
      const data = {
        payload: {
          type: "mixed",
          msg: req.t('Failed_to_send_SMS')
        }
      };

      req.notificatoinData = notificatoinFormat( data, req.user.firebaseToken);
      next();
    }
    //notify the client

  } catch (err) {
    next(err);
  }
};


exports.verifyCode = async (req, res, next) => {
  try {
    handleValidationErrors(req);

    const verificationCode = req.body.verificationCode;
    const cachedData = await redisClient.get(`verificationCode:${verificationCode}`);

    if (!cachedData) {
      throw formatStandardError(req, 403, 'Invalid_or_expired_verification_code', null);
    }

    const nationalId = cachedData; 

    await redisClient.del(`verificationCode:${verificationCode}`);

    const user = await User.findOne({ nationalId });
    if (!user) throw formatStandardError(req, 404, 'user_not_found', null);

    const resetPasswordToken = passwordToken({ userId: user._id });
    sendSuccess(req, res, 200, null, { resetPasswordToken: resetPasswordToken });
  } catch (err) {
     next(err);
  }
};

exports.updatePassword = async (req, res, next) => {

  try {
    handleValidationErrors(req);

    const { newPassword } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) throw formatStandardError(req ,404, 'password_auth_user_not_found',null);
     

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(newPassword, salt);

    user.password = hashedPassword;
    await user.save();

    sendSuccess(req,res,200,'Password_updated_successfully',null)
  } catch (err) {
   next(err);
  }
};


exports.logout = async (req, res, next) => {

  try {

    req.user.refreshToken = undefined;
    await req.user.save();

    sendSuccess(req,res,200,'Logout_success',null);
  } catch (err) {
     next(err);
  }
};
