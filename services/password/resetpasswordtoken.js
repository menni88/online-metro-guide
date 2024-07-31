const jwt=require("jsonwebtoken")
exports.passwordToken=(payload)=>{
 
    
      const token = jwt.sign(payload, process.env.JWT_RESET_PASSWORD, {
    
        expiresIn:  process.env.EXPIRE_PASSWORD_TOKEN,
      });
      return token;
    
};