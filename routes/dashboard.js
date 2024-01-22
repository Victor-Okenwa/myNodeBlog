const User = require('../model/User');
const Post = require('../model/Post');
const router = require('express').Router();
const jwt = require('jsonwebtoken');
const postMiddleware = require('../middleware/postMiddleware');
router.get('/', postMiddleware.getDashboardInfo, postMiddleware.getUserPosts, (req, res)=> res.render('dashboard'));
module.exports = router;
