const {uploadMediaToCloudinary,deleteMediaFromCloudinary} = require('../utils/cloudinary');
const logger = require('../utils/logger');
const prisma = require('../db/prisma');
const fs = require('fs');

const uploadMedia = async(req,res) => {
    logger.info('Starting media upload');
    try {
        if(!req.file){
            logger.error('File not found. Please add a file.');
            return res.status(400).json({
                success : false,
                message : "File not found. Please add a file."
            })
        }

        const {originalname,mimetype,path} = req.file;
        const userId = req.user.userId;

        logger.info('File details : name ' + originalname + ", type " + mimetype);
        logger.info('Uploading to cloudinary started...');

        const  cloudinaryUploadResult = await uploadMediaToCloudinary(req.file);
        
        logger.info('Cloudinary upload successfully. Public Id :- ' + cloudinaryUploadResult.public_id);

        const newMedia = await prisma.media.create({
            data : {
                publicId : cloudinaryUploadResult.public_id,
                mimeType : mimetype,
                originalName : originalname,
                userId,
                url : cloudinaryUploadResult.secure_url
            }
        })

        logger.info("Deleting file...")
        fs.unlinkSync(path)

        res.status(201).json({
            success : true,
            mediaId : newMedia.id,
            url : newMedia.url,
        })
    } catch (error) {
        logger.error('Uploading file error occured ',error);
        return res.status(500).json({
            success : false,
            message : "Internal server error"
        })
    }
}

const getAllMedia = async(req,res) => {
    try {
        const result = await prisma.media.findMany({});

        res.json({result});
    } catch (error) {
        logger.error('Error fetching media ',error);
        return res.status(500).json({
            success : false,
            message : "Error fetching media"
        })
    }
}

module.exports = {uploadMedia,getAllMedia};