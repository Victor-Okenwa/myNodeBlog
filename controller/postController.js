const User = require('../model/User');
const Post = require('../model/Post');
const Like = require('../model/Like');
const View = require('../model/View');
const dateDifference = require('../middleware/dateDiff');
const fsPromises = require('fs/promises')
const fs = require('fs')
const path = require('path');

const jwt = require('jsonwebtoken');
const JWT_TOKEN = process.env.JWT_TOKEN;
const ip = require('ip');
const Reply = require('../model/Reply');
const Comment = require('../model/Comment');
const CommentLike = require('../model/CommentLike');

const newPost = async (req, res) => {
    try {
        const {
            title,
            category,
            content
        } = await req.body;
        const thumbnail = await req.file.filename;

        jwt.verify(req.cookies.jwt, JWT_TOKEN, async (err, decoded) => {
            if (err) {
                throw err;
            }
            const posterID = await decoded.id;
            const post = await Post.create({
                posterID,
                title,
                category,
                content,
                thumbnail
            });

            if (post) {
                return res.status(201).json({
                    success: true
                });
            }
        });

    } catch (errors) {
        console.log(errors);
        res.status(400).json({
            errors
        });
    }
}

const getPost = async (req, res) => {
    try {
        const token = await req.cookies.jwt;
        var currentUser = null;
        if (token) {
            jwt.verify(token, process.env.JWT_TOKEN, (err, decoded) => {
                if (err) {
                    throw err;
                }
                currentUser = decoded.id;
            });
        }

        const Originalpost = await Post.findOne({
            _id: req.params.id
        }).exec();

        if (!Originalpost) {
            res.locals.post = '';
        } else {
            const id = Originalpost._id;
            const likedBy = await Like.findOne({
                userID: currentUser,
                postID: id
            });
            const posterObject = await User.findById(Originalpost.posterID);
            const poster = (Originalpost.posterID == currentUser) ? 'You' : posterObject.username;
            const title = Originalpost.title;
            const content = Originalpost.content;
            const commentsCount = Originalpost.comments ? Originalpost.comments : 0;
            const thumbnail = Originalpost.thumbnail;
            const likes = Originalpost.likes;
            const views = Originalpost.views;
            const postedOn = dateDifference(Originalpost.postedOn);

            const post = {
                id,
                poster,
                title,
                content,
                thumbnail,
                likes,
                views,
                postedOn,
                likedBy,
                commentsCount
            }
            res.locals.post = post;
        }
        return res.render('view');
    } catch (err) {
        console.log(err)
    }
}

const getUserPosts = (req, res) => {
    const token = req.cookies.jwt;
    if (token) {
        jwt.verify(token, process.env.JWT_TOKEN, async (err, decoded) => {
            try {
                if (err) return res.redirect('/login');
                const postsDb = await User.find({
                    posterID: decoded.id
                });

                if (!postsDb) {
                    res.locals.posts = null
                } else {

                }
                return res.postsDb('myblogs');
            } catch (error) {
                console.log(error);
            }
        });
    } else {
        res.redirect('/login');
    }
}

const getEditPost = (req, res) => {
    const token = req.cookies.jwt;
    if (token) {
        jwt.verify(token, process.env.JWT_TOKEN, async (err, decoded) => {
            try {
                if (err) return res.redirect('/login');
                const user = await User.findById(decoded.id);
                if (!user) {
                    res.redirect('/');
                } else {
                    const post = await Post.findById(req.params.id);
                    if (post) {
                        if (!user._id.equals(post.posterID)) return res.redirect('back');
                        res.locals.post = post;
                    } else {
                        res.locals.post = null;
                    }
                }
                return res.render('editpost');
            } catch (error) {
                console.log(error);
            }
        });
    } else {
        res.redirect('/login');
    }
}

const postEditPost = async (req, res) => {
    try {
        const token = await req.cookies.jwt;
        if (token) {
            const {
                id,
                title,
                category,
                content
            } = await req.body;
            const thumbnail = await req.file.filename;

            jwt.verify(token, JWT_TOKEN, async (err, decoded) => {
                if (err) {
                    res.redirect('/login');
                    throw err;
                }
                const userID = await decoded.id;
                const post = await Post.findById(id);
                if (post) {
                    if (post.posterID.equals(userID)) {
                        if (title) post.title = title;
                        if (category) post.category = category;
                        if (content) post.content = content;

                        if (thumbnail) {
                            if (fs.existsSync(path.join(__dirname, '..', 'public', 'thumbnails', post.thumbnail))) {
                                await fsPromises.unlink(path.join(__dirname, '..', 'public', 'thumbnails', post.thumbnail));
                            }
                            post.thumbnail = thumbnail;
                        }
                        post.save();
                        res.json({
                            success: true
                        })
                    } else {
                        res.redirect('back');
                    }
                } else {
                    res.redirect('back');
                }
            });
        }
    } catch (error) {
        console.log(error);
    }
}

const viewPost = async (req, res) => {
    try {
        const postId = await req.body.postId;
        const token = await req.cookies.jwt;
        const user = await jwt.verify(token, JWT_TOKEN, (err, decoded) => {
            if (err) {
                return null;
            }
            return User.findById(decoded.id);
        });

        const post = await Post.findById(postId);
        if (!post) return;
        const view = await View.findOne({
            ipAddress: ip.address()
        });

        if (!view) {
            await View.create({
                userID: (user._id) ? user._id : '',
                postID: post._id,
                ipAddress: ip.address()
            });
            await Post.findByIdAndUpdate(post._id, {
                $inc: {
                    views: 1
                }
            });
            res.json({
                success: true
            });
        }
    } catch (error) {

    }
}

const deletePost = (req, res) => {
    const token = req.cookies.jwt;
    const {
        postID
    } = req.body;
    jwt.verify(token, JWT_TOKEN, async (err, decoded) => {
        if (err) {
            return res.json({
                unsigned: true,
                message: 'Please login'
            });
        }
        const user = await User.findById(decoded.id);
        if (!user) return res.json({
            unsigned: true,
            message: 'Please login'
        });
        const post = await Post.findById(postID);
        // console.log(post._id, user._id)
        if(!post.posterID.equals(user._id))  return res.json({
            unsigned: true,
            message: 'This post not found under your instance'
        });

        // unlink the post thumbnail
        if (fs.existsSync(path.join(__dirname, '..', 'public', 'thumbnails', post.thumbnail))) {
            await fsPromises.unlink(path.join(__dirname, '..', 'public', 'thumbnails', post.thumbnail));
        }
        // delete all likes to this post
        await Like.deleteMany({postID})
        // delete all replies to this post
        await Reply.deleteMany({postID});
        // fetch all comments to thiis post delete it an also the likes
        await Comment.deleteMany({postID});
        // delete all comment likes to this post
        await CommentLike.deleteMany({postID});

        await Post.findByIdAndDelete(postID);
    
        res.json({success: true, message: 'Post has been removed forever'});
    });
}

module.exports = {
    newPost,
    getPost,
    getUserPosts,
    getEditPost,
    postEditPost,
    viewPost,
    deletePost
}