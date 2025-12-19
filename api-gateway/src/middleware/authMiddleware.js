const logger = require('../utils/logger')
const jwt  = require('jsonwebtoken')

const authorizeRequest = (req,res,next) => {
    const authHeaders = req.headers['authorization'];
    const token = authHeaders && authHeaders.split(" ")[1];
    if(!token){
        logger.warn("User not authorized");
        return res.status(401).json({
            success : false,
            message : "User not authorized"
        })
    }

    jwt.verify(token,process.env.JWT_SECRET,(error,user) => {
        if(error){
            logger.warn("Invalid Token");
            return res.status(401).json({
                success : false,
                message : "Invalid Token"
            })
        }

        req.user = user;
        next();
    })
}

module.exports = {authorizeRequest}