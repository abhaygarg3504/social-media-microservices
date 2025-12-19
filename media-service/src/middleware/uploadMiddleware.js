const multer = require("multer");
const logger = require('../utils/logger');
const upload = require('../utils/multer');

const uploadMiddleware = async (req,res,next) => {
    upload(req,res,function(err){
        if(err instanceof multer.MulterError){
            logger.error("Multer error while uploading file : ",err);
            return res.status(500).json({
                success : false,
                message : "Multer error while uploading file",
                error : err.message,
                stack : err.stack
            })
        }
        else if(err){
            logger.error("Unkonwn error occurred while uploading file : ",err);
            return res.status(500).json({
                success : false,
                message : "Unknown error occurred while uploading file",
                error : err.message,
                stack : err.stack
            })
        }

        if(!req.file){
            logger.error("File not found : ",err);
            return res.status(500).json({
                success : false,
                message : "File not found",
            })
        }
        next();
    })
}

module.exports = {uploadMiddleware};