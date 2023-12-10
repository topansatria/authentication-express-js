// app.js
// Coding by EffendyJr

require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const authRoutes = require("./routes/authRoutes");

const app = express();

app.use(bodyParser.json());

// main routes
app.get("/", (req, res) => {
    res.send("Hello, this is the main route!");
});

// Use the authRoutes for authentication endpoints
app.use("/auth", authRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err);

    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    const data = err.data || null;

    res.status(statusCode).json({
        statusCode,
        message,
        data,
    });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});