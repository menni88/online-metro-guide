
const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
    duration:String,
    userType: {
        type: String,
        enum: ["Students", "Public", "Elderly", "Special_Needs", "Revolution_Injured", "Journalists"],
        index: true 
      },    

      Phase:{
        type:String,
        enum: ["onePhase","twoPhases","threePhases","fourPhases","twoLines","threeLines"],
        index: true 
      },
    Price: Number,
   
});



const subscription = mongoose.model('subscriptions', subscriptionSchema);

module.exports = subscription;


