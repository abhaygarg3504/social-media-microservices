const amqp = require("amqplib");
const logger = require("./logger");

let connection = null;
let channel = null;

const EXCHANGE_NAME = "social-media-event";

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

async function connectToRabbitMQ() {
  let delay = 2000;

  while (true) {
    try {
      connection = await amqp.connect(process.env.RABBITMQ_URL);
      channel = await connection.createChannel();

      await channel.assertExchange(EXCHANGE_NAME, "topic", {
        durable: false,
      });

      logger.info("Connected to RabbitMQ ✅");

      connection.on("close", () => {
        logger.error("RabbitMQ connection closed ❌");
        channel = null;
        connection = null;
      });

      connection.on("error", (err) => {
        logger.error("RabbitMQ error ❌", err.message);
      });

      return; // SUCCESS EXIT
    } catch (err) {
      logger.error("RabbitMQ connect failed ❌", err.message);
      logger.info(`Retrying in ${delay / 1000}s...`);

      await sleep(delay);
      delay = Math.min(delay * 2, 30000);
    }
  }
}

async function consumeEvent(routingKey, callback, redisClient) {
  // 🔥 IMPORTANT: WAIT UNTIL CONNECTION IS READY
  if (!channel) {
    await connectToRabbitMQ();
  }

  const q = await channel.assertQueue("", { exclusive: true });

  await channel.bindQueue(q.queue, EXCHANGE_NAME, routingKey);

  channel.consume(q.queue, async (msg) => {
    if (!msg) return;

    try {
      const data = JSON.parse(msg.content.toString());

      await callback(data, redisClient);

      channel.ack(msg);
    } catch (err) {
      logger.error("Error processing message", err);
      channel.nack(msg, false, false);
    }
  });

  logger.info("Subscribed to event: " + routingKey);
}

module.exports = { connectToRabbitMQ, consumeEvent };