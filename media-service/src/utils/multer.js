const { randomUUID } = require('crypto');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination : (req,file,cb) => {
        cb(null,path.join(__dirname,"../data/temp"));
    },
    filename : (req,file,cb) => {
        const uniquename = randomUUID()
        cb(null,`${uniquename}${path.extname(file.originalname)}`)
    }
});

const upload = multer({
    storage : storage,
    limits : 5*1024*1024
}).single('file');

module.exports = upload;

