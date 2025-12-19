// identity-controller.js
const argon2 = require('argon2');
const logger = require("../utils/logger");
const prisma = require('../db/prisma');
const { validateRegistration, validateLogin } = require("../utils/validation");
const generateTokens = require('../utils/generateTokens');

// user registration
const registerUser = async (req, res) => {
    logger.info('Registration endpoint hit...')
    try {
        const { error } = validateRegistration(req.body);
        if (error) {
            logger.warn('validation error', error.details[0].message);
            return res.status(400).json({
                success: false,
                message: error.details[0].message
            });
        }

        const { email, password, username } = req.body;
        
        let user = await prisma.user.findFirst({
            where: {
                OR: [
                    { email },
                    { username }
                ]
            }
        });

        if (user) {
            logger.warn('User already exist');
            return res.status(400).json({
                success: false,
                message: "User already exists"
            });
        }

        const hashedPwd = await argon2.hash(password);

        user = await prisma.user.create({
            data: { username, email, password: hashedPwd }
        })

        logger.info("User saved successfully" + user.id);

        const {accessToken,refreshToken} = await generateTokens(user);
        return res.status(201).json({
            success: true,
            message : "User registered successfully",
            accessToken,
            refreshToken
        })
    } catch (error) {
        logger.error('Registration error occured',error);
        return res.status(500).json({
            success : false,
            message : "Internal server error"
        })
    }
}

// user login
const loginUser = async (req,res) => {
    logger.info("Login endpoint hit...");

    try {
        const {error} = validateLogin(req.body);
        if (error) {
            logger.warn('validation error', error.details[0].message);
            return res.status(400).json({
                success: false,
                message: error.details[0].message
            });
        }

        const {email,password} = req.body;

        const user = await prisma.user.findUnique({
            where : {email : email}
        })

        if(!user){
            logger.warn('User not found');
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // user valid or not
        const isValidPassword = await argon2.verify(user.password,password);

        if(!isValidPassword){
            logger.warn('Wrong Password');
            return res.status(400).json({
                success: false,
                message: "Wrong Password"
            });
        }
        const {accessToken,refreshToken} = await generateTokens(user);

        return res.status(201).json({
            success: true,
            message : "User loggedIn successfully",
            accessToken,
            refreshToken,
            userId : user.id
        })
    } catch (error) {
        logger.error('Login error occured ',error);
        return res.status(500).json({
            success : false,
            message : "Internal server error"
        })
    }
}

// refresh token
const refreshTokenUser = async (req,res) => {
    logger.info("Refresh token endpoint hit...");
    try {
        const {refreshToken} = req.body;
        if(!refreshToken){
            logger.warn("Refresh token missing");
            return res.status(404).json({
                success: false,
                message: "Refresh token not found"
            });
        }

        const storedToken = await prisma.refreshToken.findUnique({
            where : {token : refreshToken}
        });
        
        if(!storedToken || storedToken.expiresAt < new Date()){
            logger.warn("Invalid or expired refresh token");
            return res.status(401).json({
                success : false,
                message : "Internal server error"
            })
        }

        const user = await prisma.user.findUnique({
            where : {id : storedToken.userId}
        });

        if(!user){
            logger.warn('User not found');
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const {accessToken : newAccessToken,refreshToken : newRefreshToken} = await generateTokens(user);

        // delete the old refresh token
        await prisma.refreshToken.delete({
            where : {id : storedToken.id}
        })

        res.status(200).json({
            success : true,
            accessToken : newAccessToken,
            refreshToken : newRefreshToken
        })
    } catch (error) {
        logger.error('Refresh Token error occured ',error);
        return res.status(500).json({
            success : false,
            message : "Internal server error"
        })
    }
}

//logout
const logoutUser = async(req,res) => {
    logger.info("Logout endpoint hit...");
    try {
        const {refreshToken} = req.body;
        if(!refreshToken){
            logger.warn("Refresh token missing");
            return res.status(404).json({
                success: false,
                message: "Refresh token not found"
            });
        }

        await prisma.refreshToken.delete({
            where : {token : refreshToken}
        })

        logger.info("Rfresh token deleted for logout");

        res.json({
            success : true,
            message : "Logged out successfully"
        })
    } catch (error) {
        logger.error('Logout error occured ',error);
        return res.status(500).json({
            success : false,
            message : "Internal server error"
        })
    }
}

module.exports = {registerUser, loginUser, refreshTokenUser,logoutUser};