const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const adminIndex = require('./adminIndex');
const admin = require('./admin');
const { formatStandardError } = require('../utils/responseModels');

const userSubSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  user_id: {
    type:  Schema.Types.ObjectId,
    required: true,
    ref:"User"
  },
  plan: {
    type: String,
    required: true,
  },

  
  status: {
    type: String,
    required: true,
  },
  start_date: {
    type: Date,
    required: true,
  },
  expire_date: {
    type: Date,
    required: true,
  },
  start_station: {
    type: String,
    required: true,
  },
  end_station: {
    type: String,
    required: true,
  },
  
  available_stations: {
    type: Array,
    required: true,
  },
  admin_Id:{
    type: Schema.Types.ObjectId
  }
});

userSubSchema.methods.assignRequestToAdmin = async function (req) {
  let latestIndex;
  const currentIndex =await adminIndex.findOne().limit(1);
   latestIndex = await admin.findOne({ _id: { $gt: currentIndex?.admin_Id } }).sort({ _id: 1 });
 if(!latestIndex){
   latestIndex = await admin.findOne().sort({ _id: 1 }).limit(1)
  if(!latestIndex) throw formatStandardError(req,404,"try_later");
 }

this.admin_Id= latestIndex._id;
if (currentIndex) {
  currentIndex.admin_Id = latestIndex._id;
  await currentIndex.save();
} else {
  await adminIndex.create({ admin_Id: latestIndex._id });
}
};

const User_Sub = mongoose.model('User_Sub', userSubSchema);

module.exports = User_Sub;