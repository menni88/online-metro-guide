const dotenv = require('dotenv');
dotenv.config();
const BaseAuthenticator = require("./baseAuth");



class ResetPasswordAuthenticator extends BaseAuthenticator {
    constructor() {
        super(process.env.JWT_RESET_PASSWORD, "x_password_auth",'Not_authenticated','invalid_password_token');
    }

    extractData(decoded) {
        return { userId: decoded.userId };
    }
}

module.exports = ResetPasswordAuthenticator;

