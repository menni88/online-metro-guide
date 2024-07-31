const UserSubscription = require("../../models/user_subscription");

exports.expireSubscription = async (req, res, next) => {
  try {
    const currentDate = new Date();
    await UserSubscription.updateMany({ status: 'active', expire_date: { $lt: currentDate } }, { $set: { status: 'expired' } });
    console.log('Subscriptions expired successfully');
  } catch (err) {
    next(err);
  }
}
