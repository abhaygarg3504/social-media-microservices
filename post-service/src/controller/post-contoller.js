const logger = require("../utils/logger");
const prisma = require('../db/prisma');
const { validatePost } = require("../utils/validatePost");
const { publishEvent } = require("../utils/rabbitmq");

async function invalidatePostCache(req, input) {
    const cachedKey = `post:${input}`;
    await req.redisClient.del(cachedKey);
    
    const keys = await req.redisClient.keys('posts:*');
    if (keys.length > 0) {
        await req.redisClient.del(keys);
    }
}

const createPost = async (req, res) => {
    logger.info("Create post endpoint hit...")
    try {
        const { error } = validatePost(req.body);
        if (error) {
            logger.warn('validation error', error.details[0].message);
            return res.status(400).json({
                success: false,
                message: error.details[0].message
            });
        }

        const { content, mediaIds } = req.body;
        const newlyCreatedPost = await prisma.post.create({
            data: {
                userId: req.user.userId,
                content, mediaIds: mediaIds
            }
        })

        await publishEvent("post.created",{
            postId : newlyCreatedPost.id,
            userId : req.user.userId,
            content : content,
            createdAt : newlyCreatedPost.createdAt
        })

        await invalidatePostCache(req, newlyCreatedPost.id);

        logger.info(`Post created successfully : ${newlyCreatedPost.id}`)
        res.status(201).json({
            success: true,
            message: "Post created successfully"
        })
    } catch (error) {
        logger.error("Error creating post", error);
        res.status(500).json({
            success: false,
            message: "Error creating post"
        })
    }
}

const deletePost = async (req, res) => {
    try {
        const postId = req.params.id;

        const post = await prisma.post.delete({
            where : {id : postId}
        });

        // publish post delete method
        await publishEvent('post.deleted',{
            postId : post.id.toString(),
            userId : req.user.userId,
            mediaIds : post.mediaIds
        })

        await invalidatePostCache(req,postId);
        logger.info("Post deleted successfully : " + postId);

        res.json({
            success : true,
            message : "Post deleted successfully"
        })
    } catch (error) {
        if (error.code === "P2025") { 
            logger.warn("Post not found: " + req.params.id);
            return res.status(404).json({
                success: false,
                message: "Post not found"
            });
        }

        logger.error("Error deleting post", error);
        res.status(500).json({
            success: false,
            message: "Error creating post"
        })
    }
}

const getPost = async (req, res) => {
    try {
        const postId = req.params.id;
        const cacheKey = `post:${postId}`;
        const cachedPosts = await req.redisClient.get(cacheKey);

        if (cachedPosts) {
            return res.json(JSON.parse(cachedPosts));
        }

        const post = await prisma.post.findUnique({
            where: { id: postId }
        })

        if (!post) {
            return res.status(404).json({
                message: "Post not found",
                success: false
            })
        }

        await req.redisClient.setex(cacheKey, 3600, JSON.stringify(post));

        res.json(post);
    } catch (error) {
        logger.error("Error getting post", error);
        res.status(500).json({
            success: false,
            message: "Error getting post"
        })
    }
}

const getAllPost = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const startIndex = (page - 1) * limit;

        const cacheKey = `posts:${page}:${limit}`;
        const cachedPosts = await req.redisClient.get(cacheKey);

        if (cachedPosts) {
            return res.json(JSON.parse(cachedPosts));
        }

        const posts = await prisma.post.findMany({
            orderBy: {
                createdAt: 'desc'
            },
            skip: startIndex,
            take: limit,
        });

        const totalPosts = await prisma.post.count();

        const result = {
            posts,
            currentPage: page,
            totalPages: Math.ceil(totalPosts / limit),
            totalPosts: totalPosts
        };

        await req.redisClient.setex(cacheKey, 300, JSON.stringify(result));

        res.json(result);
    } catch (error) {
        logger.error("Error getting posts", error);
        res.status(500).json({
            success: false,
            message: "Error getting posts"
        })
    }
}

module.exports = { createPost, getPost, getAllPost, deletePost }