const User = require('../model/User');
const Post = require('../model/Post');
const router = require('express').Router();
const commentController = require('../controller/commentController');


router.post('/', commentController.commentPost);
router.put('/', commentController.commentEdit);
router.delete('/', commentController.commentDelete);
router.post('/reply', commentController.replyPost);

module.exports = router;