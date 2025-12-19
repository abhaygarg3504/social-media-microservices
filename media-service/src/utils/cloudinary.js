const cloudinary = require('cloudinary').v2;
const logger = require('../utils/logger');

cloudinary.config({
    cloud_name : process.env.CLOUDINARY_CLOUD_NAME,
    api_key : process.env.CLOUDINARY_API_KEY,
    api_secret : process.env.CLOUDINARY_API_SECRET
});

const uploadMediaToCloudinary = (file) => {
    return new Promise((resolve,reject) => {
        cloudinary.uploader.upload(file.path).then((result) => {
            resolve(result);
        }).catch((err) => {
            reject(err);
        })
    })
}

const deleteMediaFromCloudinary = async (publicId) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        logger.info("Media deleted successfully from cloud",publicId);
        return result;
    } catch (error) {
        logger.error("Error deleting media from cloudinary",error);
        throw error;
    }
}

module.exports = {uploadMediaToCloudinary,deleteMediaFromCloudinary};