const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const adminIndexSchema = new mongoose.Schema({
 admin_Id: {
    type: Schema.Types.ObjectId,
    required: true
  }
});

const adminIndex = mongoose.model('adminIndex', adminIndexSchema);

module.exports = adminIndex;
