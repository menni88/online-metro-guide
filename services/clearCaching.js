
const redisClient = require("../config/redis");
module.exports.clearSubscriptions=async (req, res, next) =>{

    try {
        const allKeys = await redisClient.keys("subscription:*");
        if (allKeys.length > 0) {
            await redisClient.del(allKeys);
        }
        const allVersionKeys = await redisClient.keys("version:*");
        if (allVersionKeys.length > 0) {
            await redisClient.del(allVersionKeys);
        }
        console.log('Cache cleared for all subscriptions and versions.');
    } catch (err) {
        next(err);
    }
}


