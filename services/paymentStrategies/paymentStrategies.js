const { preparePayment } = require("../paymentLogic/preparePayment");
const { payWithBalance } = require("../paymentLogic/payWithBalance");
const strategyExecutor = require("./strategyExecutor");


class paymentStrategyExecutor extends strategyExecutor {
    constructor() {
        super({
            payWithBalance,
            payWithPaymob: preparePayment,
        });
    }

    async execute(req, res, next) {
        try {
            let paymentMethod;

            if (req.paymentMethod) {
                paymentMethod = req.paymentMethod;
            } else {
               
                if (req.user.balance >= req.orderAmount) {
                    paymentMethod = "payWithBalance";
                } else {
                    paymentMethod = "payWithPaymob";
                    req.orderAmount *= 100 ;
                }
            }

            await this.executeStrategy(paymentMethod, req, res, next);


        } catch (err) {
             next(err);
        }
    }
}

module.exports = paymentStrategyExecutor;





