const { formatStandardError } = require("../../utils/responseModels");
const subscription = require('../../models/Subscriptions');
const user_subscription = require("../../models/user_subscription")
const { calculateDateOfBirthAndgovernment } = require("../../utils/date_of_birth")

exports.validateSubType = async (req,type ,nationalId , userId) => {

    const { age } = calculateDateOfBirthAndgovernment(nationalId);

    const typeExists = await subscription.find({ userType: type });
    if (!typeExists || typeExists.length == 0) throw formatStandardError(req,404, 'type_not_found',null);

    if (type === "Elderly" && age < 60) throw formatStandardError(req,403, 'Subscription_not_allowed_for_under_60_years_old',null);

    
      const subscriptionExists = await user_subscription.exists({ user_id: userId });
      if (subscriptionExists) throw formatStandardError(req,403, 'subscription_exists',null);
    

};