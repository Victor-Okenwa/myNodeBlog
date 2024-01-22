const Comment = require('../model/Comment');
const CommentLike = require('../model/CommentLike');
const Reply = require('../model/Reply');
const User = require('../model/User');
const Post = require('../model/Post');
const jwt = require('jsonwebtoken');
const dateDifference = require('../middleware/dateDiff');
const JWT_TOKEN = process.env.JWT_TOKEN;

const belongsTo = (user, object) => {
    return object.userID.equals(user._id) ? true : false;
}

const commentPost = (req, res) => {
    const token = req.cookies.jwt;
    if (!token) return res.json({
        unsigned: true
    });
    const {
        postId,
        comment
    } = req.body;

    jwt.verify(token, JWT_TOKEN, async (err, decoded) => {
        if (err) return res.json({
            unsigned: true
        });

        const user = await User.findById(decoded.id);
        const post = await Post.findById(postId);

        if (!user) return res.json({
            unsigned: true
        });

        if (post) {
            await Comment.create({
                userID: user._id,
                postID: post._id,
                comment,
            })
            const comments = await Comment.find({
                postID: post._id
            }).countDocuments().exec();

            await Post.findByIdAndUpdate(postId, {
                comments
            });
            const thisComment = await Comment.findOne({
                userID: user._id,
                postID: postId,
                comment
            });


            const commentData = {
                id: thisComment._id,
                postId,
                commenterId: thisComment.userID,
                commenterName: user.username,
                commenterProfile: user.profile,
                comment,
                likes: 0,
                replies: 0,
                postedOn: dateDifference(thisComment.postedOn),
            }

            res.json({
                success: true,
                type: 'comment',
                comments,
                commentData
            });
        }
    });
}

const replyPost = (req, res) => {
    const token = req.cookies.jwt;
    if (!token) return res.json({
        unsigned: true
    });
    const {
        postID,
        commentID,
        replyTo,
        reply
    } = req.body;

    jwt.verify(token, JWT_TOKEN, async (err, decoded) => {
        if (err) return res.json({
            unsigned: true
        });
        const user = await User.findById(decoded.id);
        const post = await Post.findById(postID);
        const comment = await Comment.findById(commentID);

        if (!user) return res.json({
            unsigned: true
        });

        if (comment) {
            const thisReply = await Reply.create({
                userID: user._id,
                postID: post._id,
                commentID: comment._id,
                reply,
                replyTo
            })


            const replies = await Reply.find({
                commentID
            }).countDocuments().exec();

            await Comment.findByIdAndUpdate(commentID, {
                replies
            });

            const repliedTo = await User.findById(replyTo);
            const replyData = {
                id: thisReply._id,
                postId: postID,
                commentID,
                replierId: thisReply.userID,
                replierName: user.username,
                replierProfile: user.profile,
                reply,
                likes: 0,
                replies: 0,
                repliedTo,
                repliesCount: replies,
                postedOn: dateDifference(thisReply.postedOn),
            }

            res.json({
                success: true,
                type: 'reply',
                replyData
            });
        }
    });

}

const commentEdit = (req, res) => {
    const token = req.cookies.jwt;
    if (!token) return res.json({
        unsigned: true
    });

    const {
        type,
        commentID,
        comment
    } = req.body;

    jwt.verify(token, JWT_TOKEN, async (err, decoded) => {
        try {
            if (err) return res.json({
                unsigned: true
            });
            const user = await User.findById(decoded.id);
          if(type == 'comment'){
            const commentDb = await Comment.findById(commentID);

            if (!belongsTo(user, commentDb)) return res.json({
                success: false,
                message: 'This comment does not belong to you'
            });

            commentDb.comment = comment;
            commentDb.save();
            res.json({
                success: true,
                newComment: comment
            });
          }else{
            const replyDb = await Reply.findById(commentID);

            if (!belongsTo(user, replyDb)) return res.json({
                success: false,
                message: 'This comment does not belong to you'
            });

            replyDb.reply = comment;
            replyDb.save();

            res.json({
                success: true,
                newComment: comment
            });
          }
        } catch (error) {
            console.log(error);
        }
    });

}

const commentDelete = (req, res) => {
    // here we delete comment upon the user's request
    const token = req.cookies.jwt;
    const {
        type,
        commentID
    } = req.body;

    jwt.verify(token, JWT_TOKEN, async (err, decoded) => {
        try {
            if (err) return res.json({
                unsigned: true
            });

            const user = await User.findById(decoded.id);

            if (!user) return res.json({
                unsigned: true
            });

            if (type == 'comment') {
                const comment = await Comment.findById(commentID);
                const postID = comment.postID;
                // check if this comment belongs to user
                if (!belongsTo(user, comment)) return res.json({
                    success: false,
                    message: 'This comment does not belong to you'
                });

                // fetch and delete all replies belonging to this comment
                (await Reply.find({
                    commentID
                })).forEach(async (reply) => {
                    if (reply) {
                        //  fetch and delete all likes to this and replies to this reply
                        (await Reply.find({
                            commentID: reply._id
                        })).forEach(async (reply) => {
                            if (reply) {
                                await CommentLike.deleteMany({
                                    commentID: reply.commentID
                                });

                                await Reply.deleteMany({
                                    commentID: reply.commentID
                                });
                            }
                        })

                        await CommentLike.deleteMany({
                            commentID: reply.commentID
                        });

                        await Reply.deleteMany({
                            commentID: reply.commentID
                        });
                    }
                });

                // Delete all likes to this comment
                await CommentLike.deleteMany({
                    commentID
                });

                await Reply.deleteMany({
                    commentID
                });

                // Delete comment
                await comment.deleteOne();
                // Update post comments count
                const comments = await Comment.find({
                    postID
                }).countDocuments();
                await Post.findByIdAndUpdate(postID, {
                    comments
                });

                return res.json({
                    success: true,
                    comments
                })
            } else {
                const reply = await Comment.findById(commentID);
                console.log(reply);

            }
        } catch (error) {
            console.log(error);
        }


    });
}


module.exports = {
    commentPost,
    replyPost,
    commentEdit,
    commentDelete
}