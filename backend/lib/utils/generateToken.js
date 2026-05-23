const jwt = require('jsonwebtoken');

const generateTokenAndSetCookie = (userId, res) => {
    const maxAge = 3 * 60 * 60 * 1000; // 3 hours
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: maxAge });    
    
    const cookieOptions = {
        maxAge,
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        path: '/',
        isDevelopment: process.env.NODE_ENV !== 'production',
        // domain: process.env.NODE_ENV === 'production' 
        //     ? '.vercel.app' 
        //     : 'localhost'
    };

    res.cookie("jwt", token, cookieOptions);
    
    // For debugging in production
    console.log('Cookie being set with options:', cookieOptions);
    console.log('Current NODE_ENV:', process.env.NODE_ENV);
};

module.exports = generateTokenAndSetCookie;