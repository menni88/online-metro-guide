const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const moment = require('moment-timezone');
const adminSchema = new mongoose.Schema({
  Id: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
});

adminSchema.methods.genAccessToken = function () {
  const payload = {
    userId: this._id,
  };

  const now = moment().tz('Africa/Cairo');
  
  let next1AM = now.clone().add(1, 'day').startOf('day').add(1, 'hour');

  if (now.hour() < 1) {
    next1AM = now.clone().startOf('day').add(1, 'hour');
  }

  const expiresIn = next1AM.diff(now, 'seconds');

  const token = jwt.sign(payload, process.env.JWT_ACCESS_KEY, {
    expiresIn: expiresIn,
  });

  return token;
};

const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;
