const User = require('../model/User');
const Post = require('../model/Post');
const router = require('express').Router();
const likeController = require('../controller/likeController');
router.post('/', likeController.likePost);
router.post('/comment', likeController.likeComment);
module.exports = router;
