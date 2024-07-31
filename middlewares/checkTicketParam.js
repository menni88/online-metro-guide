const { formatStandardError, formatBadRequest } = require("../utils/responseModels");

module.exports.checkStatus = (req, res, next) => {
  const filterStatus = req.params.status;
  try {
    if (!filterStatus) throw formatBadRequest(req, [{
      msg:'ticket_status_required' ,
      path:"status" ,
      location:"param"
    }]);

    if (filterStatus !== 'ongoing' && filterStatus !== 'notused') throw formatStandardError(req,404, 'invalid_ticket_status',null);

    next();
  } catch (err) {
    next(err);
  }
}

module.exports.checkTicketId = (req, res, next) => {
  const ticketUUID= req.params.plainUUID;
  try {
    if(!ticketUUID) throw formatBadRequest(req, [{
      msg:'ticket_id_required' ,
      path:"plainUUID" ,
      location:"param"
    }]);
    next();
  } catch (err) {
    next(err);
  }
}
