
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const dotenv = require('dotenv');

dotenv.config();


const userSchema = new mongoose.Schema({
  name:{
    type:String,
    required:true
  },
  nationalId: {
    type: String,
    required: true,
    unique: true,
  },
  dateOfBirth: {
    type: Date,
    required: true,
  },
  government: {
    type: String,   
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
    
  },
  balance: {
    type: Number,
    default: 0,
    min:0
  },
 
  refreshToken: {
    type: String,
  },
  firebaseToken: {
    type: String
  },

});

userSchema.methods.genAccessToken = function () {
  const payload = {
    userId: this._id,
    nationalId: this.nationalId 
  }
  const token = jwt.sign(payload, process.env.JWT_ACCESS_KEY, {

    expiresIn: process.env.EXPIRE_ACCESS_TOKEN,
  });
  return token ;

};

userSchema.statics.genAccessTokenStatic = function (userData) {
  const payload = userData;
  const token = jwt.sign(payload, process.env.JWT_ACCESS_KEY, { expiresIn: process.env.EXPIRE_ACCESS_TOKEN });
  return token;
};


  userSchema.methods.genRefreshToken = function () {
    const payload = {
      userId: this._id,
      nationalId: this.nationalId 
    };
  

  const token = jwt.sign(payload, process.env.JWT_REFRESH_KEY, {

    expiresIn: process.env.EXPIRE_REFRESH_TOKEN,
  });
  return token;
};


const User = mongoose.model('User', userSchema);

module.exports = User;