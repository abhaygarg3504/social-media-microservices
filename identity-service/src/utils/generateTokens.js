const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const prisma = require("../db/prisma");

const generateTokens = async (user) => {
    const accessToken = jwt.sign({
        userId: user.id,
        username: user.username
    }, process.env.JWT_SECRET,
        { expiresIn: '60m' });

    const refreshToken = crypto.randomBytes(40).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await prisma.refreshToken.create({
        data : {
            token : refreshToken,
            userId : user.id,
            expiresAt : expiresAt
        }
    })

    return {accessToken,refreshToken};
}

module.exports = generateTokens;