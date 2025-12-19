const logger = require("../utils/logger");
const prisma = require("../db/prisma");

const searchPostController = async (req, res) => {
    logger.info("Search endpoint hit...");

    try {
        const { query } = req.query;

        if (!query) {
            return res.status(400).json({
                success: false,
                message: "Search query is required",
            });
        }

        const cacheKey = `search:${query}`;

        const cachedData = await req.redisClient.get(cacheKey);

        if(cachedData){
            return res.json({
                success : true,
                data : JSON.parse(cachedData)
            })
        }

        // Perform full-text search using raw SQL
        const results = await prisma.$queryRaw`
            SELECT "postId", "userId", content 
            FROM search 
            WHERE search.similarity(content, ${query}) > 0.05
            OR content ILIKE ${query} || '%' 
            OR content ILIKE '%' || ${query} || '%'
            ORDER BY search.similarity(content, ${query}) DESC, "createdAt" DESC
            LIMIT 10;
        `;

        await req.redisClient.setex(cacheKey,300,JSON.stringify(results))

        res.json({
            success: true,
            data: results,
        });

    } catch (error) {
        logger.error("Error searching post", error);
        res.status(500).json({
            success: false,
            message: "Error searching post",
        });
    }
};

module.exports = { searchPostController };
