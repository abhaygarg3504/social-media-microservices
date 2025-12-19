const { PrismaClient } = require("@prisma/client");
const logger = require("../utils/logger")
const prisma = new PrismaClient();

prisma.$connect().then(() => {
    logger.info("Connected to the database successfully!")
}).catch((error) => {
    logger.error("Prisma connection error", error);
})

module.exports = prisma;