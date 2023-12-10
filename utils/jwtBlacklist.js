// jwtBlacklist.js
// Coding by EffendyJr

// Set up a simple in-memory blacklist (you may want to use a database for a real application)
const tokenBlacklist = new Set();

// Add a token to the blacklist
const addToBlacklist = (token) => {
    tokenBlacklist.add(token);
};

// Check if a token is in the blacklist
const isTokenBlacklisted = (token) => {
    return tokenBlacklist.has(token);
};

module.exports = { addToBlacklist, isTokenBlacklisted };