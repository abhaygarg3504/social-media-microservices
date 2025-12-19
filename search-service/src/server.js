require("dotenv").config();
const express = require('express');
const Redis = require('ioredis');
const helmet = require('helmet')
const searchRoutes = require('./routes/search-routes')
const errorHandler = require('./middleware/errorHandler');
const cors = require('cors');
const logger = require('./utils/logger');
const { connectToRabbitMQ, consumeEvent } = require("./utils/rabbitmq");
const { postCreatedEvent } = require("./event-handler/postCreatedEventHandler");
const { postDeletedEvent } = require("./event-handler/postDeletedEvent");

const app = express();
const PORT = process.env.PORT || 3004;

const redisClient = new Redis(process.env.REDIS_URL);

app.use(cors());
app.use(helmet());
app.use(express.json());

app.use((req, res, next) => {
    logger.info(`Receivedd ${req.method} request to ${req.url}`);
    logger.info(`Request body, ${req.body}`);
    next();
});

app.use("/api/search",(req,res,next) => {
    req.redisClient = redisClient;
    next();
})

app.use("/api/search",searchRoutes);

app.use(errorHandler);

async function startServer() {
    try {
        await connectToRabbitMQ();

        // consume event

        await consumeEvent("post.created",postCreatedEvent,redisClient);
        await consumeEvent("post.deleted",postDeletedEvent,redisClient);
        app.listen(PORT, () => {
            logger.info(`Post service is running on port ${PORT}`);
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