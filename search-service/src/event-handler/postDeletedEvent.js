const logger = require('../utils/logger');
const prisma = require('../db/prisma');

async function postDeletedEvent(event,redisClient) {
    const {postId,userId} = event;
    try {
        const search = await prisma.search.delete({
            where : {postId : postId , userId : userId}
        })

        const cachedKeys = await redisClient.keys("search:*");

        if(cachedKeys.length) await redisClient.del(cachedKeys);

        logger.info("Search deleted successfully : " + search.id + "for post : " + event.postId);
    } catch (error) {
        logger.error("Error while deleting search",error);
    }
}

module.exports = {postDeletedEvent}