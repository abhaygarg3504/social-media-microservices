const express = require('express');
const {authenticateRequest} = require('../middleware/authMiddleware');
const { createPost, getAllPost, getPost, deletePost } = require('../controller/post-contoller');
const router = express();

router.use(authenticateRequest);

router.post("/create-post",createPost);

router.get("/all-posts",getAllPost);

router.get("/post/:id",getPost);

router.delete('/delete/:id',deletePost);

module.exports = router;