const User = require('../model/User');
const Post = require('../model/Post');
const router = require('express').Router();
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middleware/authMiddleware');
const postMiddleware = require('../middleware/postMiddleware');
const commentMiddleware = require('../middleware/commentMiddleware');
const postController = require('../controller/postController');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: path.join(__dirname, '..', 'public', 'thumbnails'),
    filename: (req, file, cb) => {
        cb(undefined, Date.now() + path.extname(file.originalname))
    }
});

const upload = multer({
    storage
})

router.get('/', authMiddleware.requireEditor, (req, res) => res.render('newpost'));
router.get('/myblogs', authMiddleware.requireAuth, authMiddleware.requireEditor, postMiddleware.getUserPosts, (req, res) => res.render('myblogs'));
router.get('/:id', commentMiddleware.getPostComments, postController.getPost);
router.get('/edit/:id', authMiddleware.requireAuth, authMiddleware.requireEditor, postController.getEditPost);

router.post('/', upload.single('thumbnail'), postController.newPost);
router.post('/view', postController.viewPost);

router.put('/edit', authMiddleware.requireAuth, authMiddleware.requireEditor, upload.single('thumbnail'), postController.postEditPost);
router.delete('/', authMiddleware.requireAuth, authMiddleware.requireEditor, postController.deletePost);

module.exports = router;