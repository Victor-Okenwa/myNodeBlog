const router = require('express').Router();
const User = require('../model/User');
const Post = require('../model/Post');
const dateDifference = require('../middleware/dateDiff');

router.get('^/$|/index', (req, res) => {
    res.render('index');
});
router.post('/filter', async (req, res) => {
    try {

        const token = await req.cookies.jwt;
        const {
            option
        } = await req.body;
        var currentUser = null;
        if (token) {
            jwt.verify(token, JWT_TOKEN, (err, decoded) => {
                if (err) {
                    throw err;
                }
                currentUser = decoded.id;
            });
        }

        const postsDb = (option == 'all') ? await Post.find().sort({
            postedOn: 'desc'
        }).exec() : await Post.find({
            category: option
        }).sort({
            postedOn: 'desc'
        }).exec();

        if (!postsDb) return res.json({
            no: 'No posts'
        });

        const posts = [];
        for (i = 0; i < postsDb.length; i++) {
            const id = postsDb[i]._id;
            const posterID = postsDb[i].posterID;
            const posterObject = await User.findById(posterID);
            const thisPost = await Post.findById(id);
            if (thisPost) {
                const poster = (posterID == currentUser) ? 'You' : posterObject.username;
                const titleObject = thisPost.title;
                const title = titleObject.length > 40 ? titleObject.substring(0, 40) + '...' : titleObject;
                const contentObject = thisPost.content;
                const content = contentObject.length > 320 ? contentObject.substring(0, 320) + '...' : contentObject;
                const thumbnail = thisPost.thumbnail;
                const likes = thisPost.likes;
                const views = thisPost.views;
                const postedOn = dateDifference(thisPost.postedOn);
                posts.push({
                    id,
                    poster,
                    title,
                    content,
                    thumbnail,
                    likes,
                    views,
                    postedOn
                });
            }
        }
        res.json({
            posts
        });
    } catch (error) {
        console.log(error);
    }
});

module.exports = router;