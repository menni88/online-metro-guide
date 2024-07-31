const dotenv = require('dotenv');
dotenv.config();
const BaseAuthenticator = require("./baseAuth");

class UserAuthenticator extends BaseAuthenticator {
    constructor() {
        super(process.env.JWT_ACCESS_KEY, 'authorization','Not_authenticated', 'invalid_user_auth_token');
    }

    extractData(decoded) {
        return { userId: decoded.userId, nationalId: decoded.nationalId };
    }
}

module.exports = UserAuthenticator;
