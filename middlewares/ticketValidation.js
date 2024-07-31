const { param, body } = require('express-validator');




exports.buyTicketvalidation = [
  body('price').notEmpty().withMessage('price_required'),
  body('ticketStations').notEmpty().withMessage('stations_num_required')
];

exports.validateTicketDetails = [
  body('startStation').notEmpty().withMessage('Start_station_is_required'),
  body('endStation').notEmpty().withMessage('End_station_is_required').custom(async (value, { req }) => {
    if (value.trim() === req.body.startStation) {
      return Promise.reject("stations_should_be_different");
    }
  })
];

