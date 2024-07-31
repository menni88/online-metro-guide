const jwt = require("jsonwebtoken");
const dotenv = require('dotenv');
const User = require('../../models/user');
const {formatStandardError, formatServerErrors} = require('../../utils/responseModels')
dotenv.config();


class BaseAuthenticator {
    constructor(secretKey, tokenHeader, tokenNotFound,failureMessage) {
        this.secretKey = secretKey;
        this.tokenHeader = tokenHeader;
        this.failureMessage = failureMessage;
        this.tokenNotFound = tokenNotFound
    }

   async authenticate(req, res, next) {
        try {
            const token = req.headers[this.tokenHeader];
            if (!token)  throw formatStandardError(req,401, this.tokenNotFound,null);

            const decoded = jwt.verify(token, this.secretKey);
            const authData = this.extractData(decoded);

            if (!authData)  throw formatStandardError(req,401, this.failureMessage,null);

            const user = await User.findById( authData.userId );
            if (!user) throw formatStandardError(req,404, 'user_not_found',null);

            req.user = user;
            next();

        } catch (err) {
            if (err instanceof jwt.JsonWebTokenError || err instanceof jwt.TokenExpiredError) {
                err=formatStandardError(req,401, err.message,null);
            } 
             next(err);
        }
    }

    extractData(decodedToken) {
        throw formatServerErrors(req,"extractData() must be implemented by subclasses");
    }
}

module.exports= BaseAuthenticator;