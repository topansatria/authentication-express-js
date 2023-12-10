// middlewares/validationMiddleware.js
// Coding by EffendyJr

const { validationResult, body } = require("express-validator");

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const validationErrors = [];

        // Extract individual errors from the validationResult
        errors.array().forEach((error) => {
            validationErrors.push({
                field: error.param || error.path,
                message: error.msg,
            });
        });

        // Group errors by field
        const groupedErrors = validationErrors.reduce((acc, error) => {
            if (!acc[error.field]) {
                acc[error.field] = [];
            }
            acc[error.field].push(error.message);
            return acc;
        }, {});

        // Transform errors to the desired format, showing only the first message (order 1)
        const individualErrors = Object.keys(groupedErrors).map((field) => ({
            field,
            message: groupedErrors[field][0], // Only take the first error message
        }));

        return res.status(400).json({
            code: 400,
            status: "error",
            message: "Validation Error",
            validationErrors: individualErrors,
        });
    }
    next();
};

module.exports = { handleValidationErrors };