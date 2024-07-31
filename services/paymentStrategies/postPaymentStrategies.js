const{cacheNewTicket}=require("../caching");
const{activateSubscription}=require("../subscription/activateSubscription");
const {charge}=require("../paymentLogic/charge");
const strategyExecutor = require("./strategyExecutor");



class postPaymentStrategyExecutor extends strategyExecutor {
    constructor() {
      super({
        ticket: cacheNewTicket,
        subscription: activateSubscription,
        balance: charge
      });
    }

    async execute(req, res, next) {
      try {
          if (req.fail) next();
          await this.executeStrategy(req.paymentType, req, res, next);
     
      } catch (err) {
       console.log(err);
       //retry mechanism
      }
    }
  }
  
  module.exports =postPaymentStrategyExecutor;

