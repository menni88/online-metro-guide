const {  body } = require('express-validator');


module.exports.idValidation = [
    body('id').notEmpty().withMessage('qrID_required')
  ];


