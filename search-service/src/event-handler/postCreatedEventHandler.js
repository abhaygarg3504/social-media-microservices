const logger = require('../utils/logger');
const prisam = require('../db/prisma');

async function postCreatedEvent(event,redisClient) {
    const {postId,userId,content,createdAt} = event;

    try {
        const search = await prisam.search.create({
            data : {postId,userId,content,createdAt}
        })

        logger.info("Search created successfully : " + search.id + "for post : " + event.postId);
    } catch (error) {
        logger.error("Error while creating search");
    }
}

module.exports = {postCreatedEvent}