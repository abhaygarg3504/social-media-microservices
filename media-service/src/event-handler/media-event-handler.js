const logger = require("../utils/logger");
const prisma = require('../db/prisma');
const { deleteMediaFromCloudinary } = require("../utils/cloudinary");

const handlePostDeleted = async (event) => {
    const {postId,mediaIds} = event;
    try {
        const mediaModel = await prisma.media.findMany({
            where : {id : {in : mediaIds}}
        })

        for(const model of mediaModel){
            await deleteMediaFromCloudinary(model.publicId);
            await prisma.media.delete({
                where : {id : model.id}
            })
        }

        logger.info("Deleted media related to post : " + postId);
    } catch (error) {
        logger.error("Error while consuming delete media event",error);
    }
}

module.exports = {handlePostDeleted}