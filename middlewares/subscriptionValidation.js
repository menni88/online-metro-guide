const { body } = require('express-validator');




exports.validateSubscriptionRequest = [
  body('startStation').notEmpty().withMessage('Start_station_is_required'),
  body('endStation').notEmpty().withMessage('End_station_is_required').custom(async (value, { req }) => {

    if (value?.trim() === req?.body?.startStation) {
      return Promise.reject("stations_should_be_different");
    }
  }),
  body('type').notEmpty().withMessage('Type_is_required'),
  body('duration').notEmpty().withMessage('Duration_is_required')

];


exports.validationType=[
  body('type').notEmpty().withMessage('Type_is_required'),
]