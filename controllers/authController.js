// controllers/authController.js
// Coding by EffendyJr

const { Op } = require("sequelize");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { body } = require("express-validator");
const User = require("../models/User");
const { addToBlacklist, isTokenBlacklisted } = require("../utils/jwtBlacklist");
const {
    handleSuccess,
    handleError,
    ErrorHandler,
} = require("../utils/responseHandler");
const {
    handleValidationErrors,
} = require("../middlewares/validationMiddleware");

// Validation rules for the register endpoint
const registerValidationRules = [
    body("fullName").notEmpty().withMessage("Full name is required"),
    body("username")
    .notEmpty()
    .withMessage("Username is required")
    .custom(async(value) => {
        const existingUser = await User.findOne({ where: { username: value } });
        if (existingUser) {
            return Promise.reject("Username is already taken");
        }
        return true;
    }),
    body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format")
    .custom(async(value) => {
        const existingUser = await User.findOne({ where: { email: value } });
        if (existingUser) {
            return Promise.reject("Email is already registered");
        }
        return true;
    }),
    body("phoneNumber")
    .notEmpty()
    .withMessage("Phone number is required")
    .isNumeric()
    .withMessage("Phone number must contain only numbers")
    .custom(async(value) => {
        const existingUser = await User.findOne({
            where: { phoneNumber: value },
        });
        if (existingUser) {
            return Promise.reject("Phone number is already registered");
        }
        return true;
    }),
    body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters"),
];

// Controller to handle user registration
const register = async(req, res, next) => {
    try {
        const { fullName, username, email, phoneNumber, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            fullName,
            username,
            email,
            phoneNumber,
            password: hashedPassword,
        });

        // Customize the response data here
        const responseData = {
            fullName: user.fullName,
            username: user.username,
            email: user.email,
            phoneNumber: user.phoneNumber,
        };

        handleSuccess(res, 201, "User registered successfully", responseData);
    } catch (error) {
        const internalServerError = new ErrorHandler(500, "Internal Server Error");
        return handleError(internalServerError, res);
    }
};

// Validation rules for the login endpoint
const loginValidationRules = [
    body("loginIdentifier")
    .notEmpty()
    .withMessage("Username or email is required"),
    body("password").notEmpty().withMessage("Password is required"),
];

// Controller to handle user login
const login = async(req, res, next) => {
    try {
        const { loginIdentifier, password } = req.body;

        // Check if the login identifier is an email or a username
        const user = await User.findOne({
            where: {
                [Op.or]: [{ username: loginIdentifier }, { email: loginIdentifier }],
            },
        });

        if (!user) {
            const notFoundError = new ErrorHandler(404, "User not found");
            return handleError(notFoundError, res);
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            const invalidPasswordError = new ErrorHandler(401, "Invalid password");
            return handleError(invalidPasswordError, res);
        }

        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET_KEY, {
            expiresIn: "1h",
        });

        handleSuccess(res, 200, "Login successful", { token });
    } catch (error) {
        const internalServerError = new ErrorHandler(500, "Internal Server Error");
        return handleError(internalServerError, res);
    }
};

// Controller to handle user logout
const logout = (req, res, next) => {
    try {
        // Extract the token from the Authorization header (Bearer scheme)
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            const unauthorizedError = new ErrorHandler(
                401,
                "Invalid or missing Authorization header"
            );
            return handleError(unauthorizedError, res);
        }

        const token = authHeader.split(" ")[1];

        // Check if the token is in the blacklist
        if (isTokenBlacklisted(token)) {
            const unauthorizedError = new ErrorHandler(
                401,
                "Token has already been invalidated"
            );
            return handleError(unauthorizedError, res);
        }

        // Add the token to the blacklist
        addToBlacklist(token);

        handleSuccess(res, 200, "Logout successful");
    } catch (error) {
        const internalServerError = new ErrorHandler(500, "Internal Server Error");
        return handleError(internalServerError, res);
    }
};

module.exports = {
    register: [registerValidationRules, handleValidationErrors, register],
    login: [loginValidationRules, handleValidationErrors, login],
    logout,
};