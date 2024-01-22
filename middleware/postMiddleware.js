const User = require('../model/User');
const Post = require('../model/Post');
const dateDifference = require('./dateDiff');

const jwt = require('jsonwebtoken');
const JWT_TOKEN = process.env.JWT_TOKEN;

const allPosts = async (req, res, next) => {
    try {
        const token = await req.cookies.jwt;
        var currentUser = null;
        if (token) {
            jwt.verify(token, JWT_TOKEN, (err, decoded) => {
                if (err) {
                    throw err;
                }
                currentUser = decoded.id;
            });
        }

        const postsDb = await Post.find().sort({
            postedOn: 'desc'
        }).exec();
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
        res.locals.posts = posts;
        return next();
    } catch (err) {
        console.log(err);
    }
}

const getUserPosts = (req, res, next) => {
    const token = req.cookies.jwt;
    if (token) {
        jwt.verify(token, process.env.JWT_TOKEN, async (err, decoded) => {
            try {
                if (err) return res.redirect('/login');
                const user = await User.findById(decoded.id);

                if (!user) {
                    res.redirect('/');
                } else {
                    const postsDb = await Post.find({
                        posterID: user._id
                    }).exec();

                    if (postsDb) {
                        const posts = [];
                        for (i = 0; i < postsDb.length; i++) {
                            const id = postsDb[i]._id;
                            const category = postsDb[i].category;
                            const titleObject = postsDb[i].title;
                            const title = titleObject.length > 40 ? titleObject.substring(0, 40) + '...' : titleObject;
                            const contentObject = postsDb[i].content;
                            const content = contentObject.length > 320 ? contentObject.substring(0, 320) + '...' : contentObject;
                            const thumbnail = postsDb[i].thumbnail;
                            const comments = postsDb[i].comments;
                            const likes = postsDb[i].likes;
                            const views = postsDb[i].views;
                            const postedOn = dateDifference(postsDb[i].postedOn);
                            posts.push({
                                id,
                                category,
                                title,
                                content,
                                thumbnail,
                                comments,
                                likes,
                                views,
                                postedOn
                            });
                        }
                        res.locals.posts = posts;
                    } else {
                        res.locals.posts = null;
                    }
                    return next();
                }
            } catch (error) {
                console.log(error);
            }
        });
    } else {
        res.redirect('/login');
    }
}

const getDashboardInfo = (req, res, next) => {
    const token = req.cookies.jwt;
    if (token) {
        jwt.verify(token, process.env.JWT_TOKEN, async (err, decoded) => {
            try {
                if (err) return res.redirect('/login');
                const user = await User.findById(decoded.id);
                const posts = await Post.find({
                    posterID: user.id
                });
                const blogs = await Post.find({
                    posterID: user.id
                }).countDocuments();
                let views = 0;
                let likes = 0;
                let comments = 0;
                if (posts && posts.length > 0) {
                    posts.forEach(async (post) => {
                        views += post.views;
                        likes += post.likes;
                        comments += post.comments;
                    });
                    const records = {
                        blogs,
                        views,
                        likes,
                        comments
                    };
                    res.locals.records = records;
                } else {
                    res.locals.records = null;
                }
                next();
            } catch (error) {
                res.locals.records = null;
                console.log(error);
                next();

            }
        });
    }
}

module.exports = {
    allPosts,
    getUserPosts,
    getDashboardInfo
}