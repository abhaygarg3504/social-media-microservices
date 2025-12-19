const amqp = require('amqplib');
const logger = require("./logger");

let connection = null;
let reconnectAttempts = 0;
let channel = null;
let timer = null;

const EXCHANGE_NAME = 'social-media-event';

async function connectToRabbitMQ() {
    if (timer) {
        clearTimeout(timer);
        timer = null;
    }

    try {
        connection = await amqp.connect(process.env.RABBITMQ_URL);
        channel = await connection.createChannel();

        await channel.assertExchange(EXCHANGE_NAME, "topic", { durable: false });
        logger.info("Connected to rabbit mq");

        connection.on("error", (err) => {
            console.error("Connection Error:", err.message);
            if (err.message.includes("ECONNRESET") || err.message.includes("Connection closed")) {
                logger.info("Attempting to reconnect...");
                reconnectRabbitMQ();
            }
        });

        connection.on("close", () => {
            logger.info("Connection closed! Reconnecting...");
            reconnectRabbitMQ();
        });
    } catch (error) {
        logger.error("Failed to connect to RabbitMQ:", error.message);
        reconnectRabbitMQ();
    }
}

function reconnectRabbitMQ() {
    const delay = Math.min(5000 * 2 ** reconnectAttempts, 60000);
    reconnectAttempts++;
    logger.info(`Retrying connection in ${delay / 1000} seconds...`);
    timer = setTimeout(connectToRabbitMQ, delay);
}

async function publishEvent(routingKey, message) {
    if (!channel) {
        await connectToRabbitMQ();
    }

    channel.publish(EXCHANGE_NAME, routingKey, Buffer.from(JSON.stringify(message)));
    logger.info('Event published : ' + routingKey);
}

module.exports = { connectToRabbitMQ, publishEvent }