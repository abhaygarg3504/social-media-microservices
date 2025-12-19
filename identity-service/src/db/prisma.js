const {PrismaClient} = require('@prisma/client');
const logger = require('../utils/logger')

const prisma = new PrismaClient();

async function connectToDatabase() {
    try {
        await prisma.$connect();
        logger.info("Connected to the database successfully!")
    } catch (error) {
        logger.error("Prisma connection error",error);
    }
}

connectToDatabase();

module.exports = prisma;