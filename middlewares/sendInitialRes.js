const User =require("../models/user");
const { generateVerificationCode } = require("../services/password/passwordResetCodeGen")
const dotenv = require('dotenv');
dotenv.config();
const {handleValidationErrors} = require("../utils/validateRequest");
const { formatStandardError } = require("../utils/responseModels");
const {sendSuccess}=require("../utils/responseModels")
const redisClient = require('../config/redis');
exports.sendInitialResponse = async (req, res, next) => {

    try {
      handleValidationErrors(req);

      const { nationalId } = req.body;
      const user = await User.findOne({ nationalId });
  
      if (!user) throw formatStandardError(req,404, 'user_not_found',null);
  
      
      const verificationCode = generateVerificationCode();
      await redisClient.set(`verificationCode:${verificationCode}`, nationalId);
      await  redisClient.expire(`verificationCode:${verificationCode}`, 300);
      console.log(verificationCode)
      req.verificationCode = verificationCode;
      req.user=user;
  
      sendSuccess(req,res,200,'Verification_code_sent_successfully',{nationalId: nationalId, expiration: process.env.EXPIRE_PASSWORD_TOKEN })
      next();
  
    } catch (err) {
      next(err);
    }
  
  };