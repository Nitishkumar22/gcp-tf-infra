const User = require('../models/userModel');
const jwt = require('jsonwebtoken');

const protectRoute = async (req, res, next) => {
    try {
        const token = req.cookies.jwt;

        if (!token) {
            return res.status(401).json({ 
                error: "Unauthorized: No Token Provided",
                isAuthenticated: false 
            });
        }

        try {
            // Verify the token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // Find the user and include only necessary fields
            const user = await User.findById(decoded.userId)
                .select("-password")
                .lean();  // Using lean for better performance

            if (!user) {
                return res.status(401).json({ 
                    error: "User not found",
                    isAuthenticated: false 
                });
            }

            // Add user and auth status to request
            req.user = user;
            req.isAuthenticated = true;
            next();

        } catch (tokenError) {
            // Handle specific token errors
            if (tokenError.name === 'TokenExpiredError') {
                return res.status(401).json({ 
                    error: "Session expired. Please log in again.",
                    isAuthenticated: false,
                    isExpired: true
                });
            }
            
            if (tokenError.name === 'JsonWebTokenError') {
                return res.status(401).json({ 
                    error: "Invalid token. Please log in again.",
                    isAuthenticated: false,
                    isInvalid: true
                });
            }

            throw tokenError; // Re-throw unexpected token errors
        }

    } catch (err) {
        console.error('Protection error:', err);
        return res.status(500).json({ 
            error: "Internal Server Error",
            isAuthenticated: false 
        });
    }
};

module.exports = protectRoute;
