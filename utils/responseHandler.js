// utils/responseHandler.js
// Coding by EffendyJr

class ErrorHandler extends Error {
    constructor(statusCode, message) {
        super();
        this.statusCode = statusCode;
        this.message = message;
    }
}

const handleError = (err, res) => {
    const { statusCode, message } = err;
    res.status(statusCode).json({
        code: statusCode,
        status: "error",
        message,
    });
};

const handleSuccess = (res, code = 200, message = "Success", data) => {
    res.status(code).json({
        code,
        status: "success",
        message,
        data,
    });
};

module.exports = { ErrorHandler, handleError, handleSuccess };