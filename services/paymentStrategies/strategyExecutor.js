const { formatStandardError } = require("../../utils/responseModels");


class strategyExecutor {
    constructor(strategies) {
      this.strategies = strategies;
    }
  
    async executeStrategy(strategyKey, req, res, next) {
      const strategy = this.strategies[strategyKey];
  
      if (!strategy) throw formatStandardError(req,404, `No_strategy_found_for: ${strategyKey}`,null);
  
      await strategy(req, res, next);
    }
  }

  module.exports = strategyExecutor;
  