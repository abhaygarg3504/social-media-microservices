const amqp = require("amqplib");
const logger = require("./logger");

let connection = null;
let channel = null;

const EXCHANGE_NAME = "social-media-event";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function connectToRabbitMQ() {
  let delay = 2000;

  while (true) {
    try {
      connection = await amqp.connect(process.env.RABBITMQ_URL);
      channel = await connection.createChannel();

      await channel.assertExchange(EXCHANGE_NAME, "topic", { durable: false });
      logger.info("Connected to RabbitMQ ✅");

      connection.on("error", (err) => {
        logger.error("RabbitMQ error:", err.message);
      });

      connection.on("close", () => {
        logger.warn("RabbitMQ connection closed");
        channel = null;
        connection = null;
      });

      return;
    } catch (err) {
      channel = null;
      connection = null;
      logger.error("Failed to connect to RabbitMQ:", err.message);
      logger.info(`Retrying in ${delay / 1000}s...`);

      await sleep(delay);
      delay = Math.min(delay * 2, 30000);
    }
  }
}

async function publicEvent(routingKey, message) {
  if (!channel) {
    await connectToRabbitMQ();
  }

  if (!channel) {
    throw new Error("RabbitMQ channel not initialized");
  }

  channel.publish(EXCHANGE_NAME, routingKey, Buffer.from(JSON.stringify(message)));
  logger.info("Event published: " + routingKey);
}

async function consumeEvent(routingKey, callback) {
  if (!channel) {
    await connectToRabbitMQ();
  }

  if (!channel) {
    throw new Error("RabbitMQ channel not initialized");
  }

  const q = await channel.assertQueue("", { exclusive: true });
  await channel.bindQueue(q.queue, EXCHANGE_NAME, routingKey);

  channel.consume(q.queue, async (msg) => {
    if (!msg) return;

    try {
      const content = JSON.parse(msg.content.toString());
      await callback(content);
      channel.ack(msg);
    } catch (err) {
      logger.error("Error processing message:", err);
      channel.nack(msg, false, false);
    }
  });

  logger.info("Subscribed to the event: " + routingKey);
}

module.exports = { connectToRabbitMQ, publicEvent, consumeEvent };