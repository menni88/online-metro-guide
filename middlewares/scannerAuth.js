const Scanner = require('../models/scanner');
const {formatStandardError} = require('../utils/responseModels')

module.exports=async(req, res, next)=>{
    try {

        const scanner_key = req.headers.scanner_auth;
        if (!scanner_key)  throw formatStandardError(req,401, "scanner_key_miss",null);

        const scanner = await Scanner.findById( scanner_key );
        if (!scanner) throw formatStandardError(req,404, 'scanner_not_found',null);

        req.scannerId = scanner.station;
        next();

    } catch (err) {
         next(err);
    }
}

