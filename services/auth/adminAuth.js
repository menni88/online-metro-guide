const jwt = require('jsonwebtoken');
const Admin=require("../../models/admin")
const {formatStandardError, formatServerErrors} = require('../../utils/responseModels')

exports.adminAuth=async (req,res,next)=>{
    try{
        const token = req.headers.authorization;
       
        if (!token) {
          throw formatStandardError(req, 401, 'Authorization_token_missing', null);
        }
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_KEY);
        
        const admin = await Admin.findById(decoded.userId);
        
        if (!admin) {
          throw formatStandardError(req, 401, 'Invalid_token_or_admin_not_found', null);
        }
        req.admin = admin;
        next();    

    }catch (err) {
      if (err instanceof jwt.JsonWebTokenError || err instanceof jwt.TokenExpiredError) {
          err=formatStandardError(req,401, err.message,null);
      } 
       next(err);}
}
