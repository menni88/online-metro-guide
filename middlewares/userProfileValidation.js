const { body } = require('express-validator');


exports.chargeValidation = [
  body('chargeAmount').notEmpty().withMessage('chargeAmount_required'),
];
