require('dotenv').config();
const express = require('express');
const Redis = require('ioredis');
const helmet = require('helmet')
const mediaRoutes = require('./routes/media-routes')
const errorHandler = require('./middleware/errorHandler');
const { RedisStore } = require("rate-limit-redis");
const { rateLimit } = require("express-rate-limit");
const { RateLimiterRedis } = require('rate-limiter-flexible')
const cors = require('cors');
const logger = require('./utils/logger');
const { connectToRabbitMQ, consumeEvent } = require('./utils/rabbitmq');
const { handlePostDeleted } = require('./event-handler/media-event-handler');

const app = express();
const PORT = process.env.PORT || 3003;

const redisClient = new Redis(process.env.REDIS_URL);

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
    logger.info(`Receivedd ${req.method} request to ${req.url}`);
    logger.info(`Request body, ${req.body}`);
    next();
});

const rateLimiter = new RateLimiterRedis({
    storeClient: redisClient,
    keyPrefix: 'middleware',
    points: 10,
    duration: 1
})

app.use((req, res, next) => {
    rateLimiter.consume(req.ip)
        .then(() => next())
        .catch(() => {
            logger.warn("Rate limit exceeded for" + req.ip);
            res.status(429).json({
                success: false,
                message: 'Too many requests',
            })
        })
})

const sensitiveEndpointLimitter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50,
    legacyHeaders: false,
    standardHeaders: true,
    handler: (req, res) => {
        logger.warn(`Sensitive endpoint rate limit exceeded for ${req.ip}`);
        res.status(429).json({
            success: false,
            message: 'Too many requests',
        })
    },
    store: new RedisStore({
        sendCommand: (...args) => redisClient.call(...args)
    })
})

app.use("/api/media/upload",sensitiveEndpointLimitter);

app.use("/api/media",mediaRoutes);

app.use(errorHandler);

async function startServer() {
    try {
        await connectToRabbitMQ();

        // consume event

        await consumeEvent("post.deleted",handlePostDeleted);

        app.listen(PORT, () => {
            logger.info(`Media service is running on port ${PORT}`);
        })
    } catch (error) {
        logger.error("Fail to connect to server", error);
        process.exit(1)
    }
}

startServer();

// unhandler promise rejecton

process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at', promise, "reason :", reason);
})