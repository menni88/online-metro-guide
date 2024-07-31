const { validationResult } = require('express-validator');
const { formatBadRequest } = require('./responseModels');

module.exports.handleValidationErrors = (req) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw formatBadRequest(req,errors.array());
  };
  