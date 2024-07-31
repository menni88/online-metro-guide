/**
 * Sends a success response.
 * @param {import('express').Request} req - The request object, needed for localization.
 * @param {import('express').Response} res - The response object.
 * @param {number} code - HTTP status code.
 * @param {string} [message=null] - Message to send.
 * @param {(Object|null)} [data=null] - Additional data to send.
 */

function isObject(obj) {
    return obj !== null && typeof obj === 'object' && !Array.isArray(obj);
}

module.exports.sendSuccess = (req, res, code , message = null, data = null) => {
    if (data !== null && (!isObject(data) || Array.isArray(data)))  throw new TypeError("Data must be a plain object or null");
    if (message !== null && typeof message !== 'string') throw new TypeError("Message must be a string or null");
    if (typeof code !== 'number') throw new TypeError("Code must be a number");

    res.status(code).json({
        success: true,
        code,
        userMessage: message ? req.t(message) : null,
        message:message,
        data
    });
};

/**
 * Sends a bad request response.
 * @param {import('express').Request} req - The request object, needed for localization.
 * @param {(Array)} errors - Errors in the request.
 */
module.exports.formatBadRequest = (req, errors) => {
    if (!Array.isArray(errors)) throw new TypeError('Errors must be an array');

    const formattedErrors = errors.map(error => {
        if (!error.msg || !error.path || !error.location) throw new TypeError('Each error must include msg, path, and location');
        return {
            msg: req.t(error.msg),
            path: error.path,
            location: error.location
        };
    });
    return {
        success: false,
        code: 400,
        data: { errors: formattedErrors }
    };
}

/**
 * Sends an internal server error.
 * @param {import('express').Request} req - The request object, needed for localization.
 * @param {string} [message="internal_server_error"] - Message to send.
 */
module.exports.formatServerErrors = (req, message = "internal_server_error") => {
    if (typeof message !== 'string') throw new TypeError("Message must be a string or null");

    return {
        success: false,
        code: 500,
        message: req.t(message)
    };
}

/**
 * Sends a standard error.
 * @param {import('express').Request} req - The request object, needed for localization.
 * @param {number} code - HTTP status code.
 * @param {string} [message=null] - Message to send.
 * @param {(Object|null)} [data=null] - Additional data to send.
 */
module.exports.formatStandardError = (req, code, message = null, data = null) => {
    if (data !== null && typeof data !== 'object') throw new TypeError("Data must be an object or null");
    if (message !== null && typeof message !== 'string') throw new TypeError("Message must be a string or null");
    if (typeof code !== 'number') throw new TypeError("Code must be a number");

    return {
        success: false,
        code,
        userMessage: message ? req.t(message) : null,
        message:message,
        data
    };
}
