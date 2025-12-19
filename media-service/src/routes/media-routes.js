const express = require('express');
const router = express.Router();
const {authenticateRequest} = require("../middleware/authMiddleware");
const { uploadMedia, getAllMedia } = require('../controller/media-controller');
const { uploadMiddleware } = require('../middleware/uploadMiddleware');

router.post("/upload",authenticateRequest,uploadMiddleware,uploadMedia);

router.get("/get",authenticateRequest,getAllMedia);
module.exports = router;