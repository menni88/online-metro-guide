const subscription = require('../models/Subscriptions');
const { getShortestPath, getAllStations, getPathLines } = require('../services/graghFunctions');
const user_subscription = require("../models/user_subscription")
const { calculatePhase, calcAnnualPhase } = require("../utils/phaseCalc")
const { v4: uuidv4 } = require('uuid');
const dotenv = require('dotenv');
const path = require("path");
const { handleValidationErrors } = require("../utils/validateRequest");
const redisClient = require('../config/redis');
const { tokenGenerator } = require("../utils/qrTokenGenerator");
const { getTodayTimestamp } = require("../utils/Time")
const { validateSubType } = require("../services/subscription/validateSubscriptiontype");
const { SubscriptionOrderDTO } = require("../services/paymentLogic/PaymentDTO");
const { formatStandardError, formatBadRequest } = require('../utils/responseModels');
const pathDetailsDTO = require("../services/pathDetailsDTO").pathDetialsDTO;
const {sendSuccess}=require("../utils/responseModels")
dotenv.config();





exports.getUserType = async (req, res, next) => {
  try {
    const userType = await subscription.distinct('userType', { userType: { $exists: true, $ne: null } });
    if (!userType || userType.length == 0) throw formatStandardError(req, 404, 'no_types_found', null); //edit msg
    sendSuccess(req,res,200,null,{
      userType: userType
    })

  } catch (err) {
    next(err);
  }
};


exports.getSubscriptionData = async (req, res, next) => {
  try {
    handleValidationErrors(req);
    const type=req.body.type;
    const typeExists = await subscription.exists({ userType: type });
    if (!typeExists) {
      throw formatStandardError(req, 404, 'type_not_found', null); 
    }
    const durations=await subscription.aggregate([{
      $match: {
        $or: [
          { userType: type},
          { userType: { $exists: false } }
        ],
      }}]);
    if (!durations || durations.length == 0) throw formatStandardError(req, 404, 'no_durations_found', null); //edit msg
      const Durations=durations.map(d => d.duration);
      const uniqueDurations = [...new Set(Durations)];
      const stations = await getAllStations(req);
    sendSuccess(req,res,200,null,{
    durations: uniqueDurations,
    stations: stations
    })

  } catch (err) {
    next(err);
  }
};


exports.subscribe = async (req, res, next) => {

  try {
    handleValidationErrors(req);
    const type = req.body.type;
    let originalExtension ;
    if(!(type =='Public'|| type =='Elderly')){

      if (!req.file) throw formatBadRequest(req, [{
        msg: "application_required",
        path: "applicationForm",
        location: "file"
      }]);
      originalExtension = path.extname(req.file.originalname);
    }
    
    await validateSubType(req,type, req.user.nationalId, req.user._id);
    const startStation = req.body.startStation;
    const endStation = req.body.endStation;
    const duration = req.body.duration;
    const { pathDetails, numberOfTripStations } = await getShortestPath(req,startStation, endStation);

    let phase;

    if (duration == "year") {

      const numberOfLines = getPathLines(pathDetails);
      phase = calcAnnualPhase(numberOfLines);
    } else {
      phase = calculatePhase(numberOfTripStations);

    }

    const plan = await subscription.aggregate([{
      $match: {
        duration: duration,
        $or: [
          { userType: type },
          { userType: { $exists: false } }
        ],
        Phase: phase
      }
    }]);

    if (!plan || plan.length == 0) {
      const typeSubscriptions = await subscription.find({
        $or: [
          { userType: type },
          { userType: { $exists: false } }
        ]
      });

      const availableSubscriptions = typeSubscriptions.map(subscription => {
        return subscription.duration;
      });
      const subscriptions = new Set(availableSubscriptions);



      const subscriptionsArray = Array.from(subscriptions);

      throw formatStandardError(req,404, 'plan_not_exists', {
        availableSubscriptions: subscriptionsArray,
        msg: "available_subscriptions"
      });

    }


    const userSub = new user_subscription({
      _id: uuidv4(),
      user_id: req.user._id,
      plan: plan[0]._id,
      status: !(type =='Public'|| type =='Elderly')? "pending" : 'notactive',
      start_date: "0",
      expire_date: "0",
      start_station: startStation,
      end_station: endStation,
      available_stations: pathDetailsDTO(pathDetails)
    });
    await userSub.assignRequestToAdmin(req);
    await userSub.save();
    sendSuccess(req,res,201,'Subscription_request_created',null)

    if(!(type =='Public'|| type =='Elderly')){
    req.fileName = userSub._id;
    req.fileExtension = originalExtension;
    req.userSub =userSub;
    next();
    }

  } catch (err) {
    next(err);
  }
}

exports.getUserSubscriptions = async (req, res, next) => {
  try {
    const userSubscriptions = await user_subscription.find({ user_id: req.user._id });

    const subscriptionsData = userSubscriptions?.map(({ _id, duration, start_station, end_station, status }) => {
      return { _id, duration, start_station, end_station, status };
    });

    sendSuccess(req,res,200,null,{subscriptionsData})

  } catch (err) {
    next(err);
  }
};



exports.getSubscriptionQr = async (req, res, next) => {
  try {

    const sub_id = req.params.sub_id;

    const cachedSubscription = await redisClient.hGetAll(`subscription:${sub_id}`);

    let version;
    if (cachedSubscription && Object.keys(cachedSubscription).length > 0) {
      version = await redisClient.get(`version:${sub_id}`);
    } else {
      const subscription = await user_subscription.findById({ _id: sub_id });
      if (!subscription) throw formatStandardError(req, 404, 'subscription_not_found',null);
      if (subscription.status !== "active") throw formatStandardError(req,403, 'subscription_not_active',null);
      version = 0;
      req.subscription = subscription;
    }

    let timestamp = getTodayTimestamp();
    const payload = `${version}:${timestamp}:${sub_id}`;

    const token = tokenGenerator(payload);
    sendSuccess(req,res,200,null,{ qrPayload: `subscription:${token}` })
    
    next();

  } catch (err) {
    next(err);
  }
};

exports.getSubscriptionDetails = async (req, res, next) => {
  try {

    const subscriptionId = req.params.sub_id;

    const userSubscription = await user_subscription.findById({ _id: subscriptionId });
    if (!userSubscription) throw formatStandardError(req, 404, 'subscription_not_found',null);

    const { plan, status } = userSubscription;
    const planDetails = await subscription.findById({ _id: plan });


    sendSuccess(req,res,200,planDetails?null:"subscription_details_invalid_plan",{ duration:planDetails?.duration ||null , price: planDetails?.Price ||null ,status:status })
    
  } catch (err) {
    next(err);
  }
};

exports.activateSubscription = async (req, res, next) => {
  try {
    handleValidationErrors(req);


    const subscriptionId = req.params.sub_id;
    const userSubscription = await user_subscription.findById(subscriptionId);
    if (!userSubscription) throw formatStandardError(req, 404, 'subscription_not_found',null);
    if (userSubscription.status === 'pending') throw formatStandardError(req,403, "subsription_not_approved",null);
    if (userSubscription.status === 'active') throw formatStandardError(req,403, "subsription_active",null);
    const subscriptionDetails = await subscription.findById(userSubscription.plan);
    if (!subscriptionDetails) throw formatStandardError(req,404, "activate_subscription_invalid_plan" , null);

    const price = subscriptionDetails.Price;


    const subscriptionOrder = new SubscriptionOrderDTO(req.user._id, subscriptionId, price, subscriptionDetails.duration, req.user.firebaseToken);
    Object.assign(req, subscriptionOrder);

    next();


  } catch (err) {
    next(err);
  }
}

exports.deleteSubscription=async(req,res,next)=>{

  try{
    const subscriptionId = req.params.sub_id;
    const deletedSubscription = await user_subscription.findByIdAndDelete({ _id: subscriptionId });
    if (!deletedSubscription) {
      throw formatStandardError(req, 404, 'subscription_not_found', null);
    }
   
    if(deletedSubscription.status==='pending'){
      req.fileName = deletedSubscription._id;
      next()
    }
    else{
      sendSuccess(req,res,200,'Subscription_deleted_successfully',null)
    }


  }catch(err){
    next(err)
  }


}