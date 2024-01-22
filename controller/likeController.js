const User = require('../model/User');
const Post = require('../model/Post');
const Like = require('../model/Like');
const jwt = require('jsonwebtoken');
const JWT_TOKEN = process.env.JWT_TOKEN;
const ip = require('ip');
const CommentLike = require('../model/CommentLike');
const Comment = require('../model/Comment');
const Reply = require('../model/Reply');


const likePost = (req, res) => {
    const postId = req.body.postId;
    jwt.verify(req.cookies.jwt, JWT_TOKEN, async (err, decoded) => {
        try {
            if (err) {
                res.json({
                    unsigned: true
                });
                throw err;
            }
            const user = await User.findById(decoded.id);
            if (user) {
                const post = await Post.findById(postId);
                if (post) {
                    const liked = await Like.findOne({
                        userID: user._id,
                        postID: post._id
                    });
                    if (!liked) {
                        // create like
                        await Like.create({
                            userID: user._id,
                            postID: post._id,
                            ipAddress: ip.address()
                        });
                        await Post.findByIdAndUpdate(post._id, {
                            $inc: {
                                likes: 1
                            }
                        });
                        res.json({
                            success: true,
                            type: 'like',
                        });
                    } else {
                        // unlike
                        const like = await Like.deleteOne({
                            userID: user._id,
                            postID: post._id
                        });
                        res.json({
                            success: true,
                            type: 'unlike',
                        });
                        await Post.findByIdAndUpdate(post._id, {
                            $inc: {
                                likes: -1
                            }
                        });
                    }
                }
            } else {
                return res.json({
                    unsigned: true
                });
            }
        } catch (error) {
            console.log(error);
        }
    });
}

const likeComment = async (req, res) => {
    try {
        const {
            type,
            postID,
            commentID
        } = await req.body;
        const user = await jwt.verify(req.cookies.jwt, JWT_TOKEN, (err, decoded) => {
            try {
                if (err) {
                    return false;
                }
                return User.findById(decoded.id);
            } catch (error) {
                console.log(error);
            }
        });

        if (user) {
            if (type == 'comment') {
                const comment = await Comment.findById(commentID);
                if (comment) {
                    const liked = await CommentLike.findOne({
                        userID: user._id,
                        postID,
                        commentID
                    });

                    if (!liked) {
                        // If the user has not liked comment
                        await CommentLike.create({
                            type,
                            userID: user._id,
                            postID,
                            commentID,
                            ipAddress: ip.address()
                        })

                        const currentLikesCount = await CommentLike.find({
                            postID,
                            commentID,
                        }).countDocuments();

                        await Comment.findByIdAndUpdate(comment._id, {
                            likes: currentLikesCount
                        });

                        res.json({
                            success: true,
                            type: 'like',
                            likes: currentLikesCount
                        });
                    } else {
                        // If the user has liked comment then unlike
                        await CommentLike.deleteOne({
                            userID: user._id,
                            postID,
                            commentID
                        });
                        const currentLikesCount = await CommentLike.find({
                            postID,
                            commentID,
                        }).countDocuments().exec();

                        await Comment.findByIdAndUpdate(comment._id, {
                            likes: currentLikesCount
                        });

                        res.json({
                            success: true,
                            type: 'unlike',
                            likes: currentLikesCount
                        });
                    }
                }
            } else {
                const reply = await Reply.findById(commentID);
                if (reply) {
                    const liked = await CommentLike.findOne({
                        postID,
                        commentID
                    });

                    if (!liked) {
                        // If the user has not liked comment
                        await CommentLike.create({
                            type,
                            userID: user._id,
                            postID,
                            commentID,
                            ipAddress: ip.address()
                        })

                        const currentLikesCount = await CommentLike.find({
                            postID,
                            commentID,
                        }).countDocuments().exec();

                        await Reply.findByIdAndUpdate(reply._id, {
                            likes: currentLikesCount
                        });

                        res.json({
                            success: true,
                            type: 'like',
                            likes: currentLikesCount
                        });
                    } else {
                        // If the user has liked comment then unlike
                        await CommentLike.deleteOne({
                            userID: user._id,
                            postID,
                            commentID
                        });
                        const currentLikesCount = await CommentLike.find({
                            postID,
                            commentID,
                        }).countDocuments().exec();

                        await Reply.findByIdAndUpdate(reply._id, {
                            likes: currentLikesCount
                        });

                        res.json({
                            success: true,
                            type: 'unlike',
                            likes: currentLikesCount
                        });
                    }
                }
            }
        } else {
            return res.json({
                unsigned: true
            });
        }

    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    likePost,
    likeComment
};