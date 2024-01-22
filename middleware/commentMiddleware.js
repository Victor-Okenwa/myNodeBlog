const User = require('../model/User');
const Post = require('../model/Post');
const Comment = require('../model/Comment');
const dateDifference = require('./dateDiff');

const jwt = require('jsonwebtoken');
const Reply = require('../model/Reply');
const CommentLike = require('../model/CommentLike');
const JWT_TOKEN = process.env.JWT_TOKEN;


const getPostComments = async (req, res, next) => {
    // Here we get comments & replies to a particular post

    try {
        const token = await req.cookies.jwt;
        const postId = await req.params.id;
        const currentUser = await jwt.verify(token, JWT_TOKEN, async (err, decoded) => {
            try {
                if (!err) {
                    const currentUser = await User.findById(decoded.id);
                    return currentUser;
                }
            } catch (error) {
                console.log(error);
            }
        });
        const commentsDb = await Comment.find({
            postID: postId
        }).sort({postedOn: 'desc'}).exec();

        // find out how to sort docs
        // sort({postedOn: 'desc'})
        const comments = [];

        // commentsDb.forEach(async (item) => {
        //     const id = item._id;
        //     const commenterId = item.userID;
        //     const commenter = await User.findById(item.userID);
        //     const commenterName = commenter.username;
        //     const commenterProfile = commenter.profile;
        //     const comment = item.comment;
        //     const likes = item.likes ? item.likes : 0;
        //     const replies = item.replies ? item.replies : 0;
        //     const postedOn = dateDifference(item.postedOn);
        //     const isCurrentUser = currentUser ? (currentUser._id.equals(commenterId) ? true : false) : false;
        //     const likedBy = await CommentLike.findOne({userID: currentUser._id, commentID: id}) ? true : false;

        //     const repliesDb = await Reply.find({ commentID: id });
        //     const commentReplies = [];

        //     repliesDb.forEach(async (item) => {
        //         const id = item._id;
        //         const replierId = item.userID;
        //         const replier = await User.findById(item.userID);
        //         const replierName = replier.username;
        //         const replierProfile = replier.profile;
        //         const reply = item.reply;
        //         const likes = item.likes ? item.likes : 0;
        //         const replies = item.replies ? item.replies : 0;
        //         const postedOn = dateDifference(item.postedOn);
        //         const isCurrentUser = currentUser ? (currentUser._id.equals(replierId) ? true : false) : false;
        //         const replyTo = await Comment.findById(item.replyTo);
        //         const replyToUser = await User.findById(replyTo.userID);
        //         const likedBy = await CommentLike.findOne({userID: currentUser._id, commentID: id}) ? true : false;

        //         commentReplies.push({
        //             id,
        //             replierId,
        //             replier,
        //             replierName,
        //             replierProfile,
        //             reply,
        //             likes,
        //             replies,
        //             postedOn,
        //             isCurrentUser,
        //             likedBy,
        //             replyToUser
        //         });
        //     });

        //     comments.push({
        //         id,
        //         commenterId,
        //         commenter,
        //         commenterName,
        //         commenterProfile,
        //         comment,
        //         likes,
        //         replies,
        //         postedOn,
        //         isCurrentUser,
        //         likedBy,
        //         commentReplies
        //     });
        // })

        for (var i = 0; i < commentsDb.length; i++) {
            const id = commentsDb[i]._id;
            const commenterId = commentsDb[i].userID;
            const commenter = await User.findById(commentsDb[i].userID);
            const commenterName = commenter.username;
            const commenterProfile = commenter.profile;
            const comment = commentsDb[i].comment;
            const likes = commentsDb[i].likes ? commentsDb[i].likes : 0;
            const replies = commentsDb[i].replies ? commentsDb[i].replies : 0;
            const postedOn = dateDifference(commentsDb[i].postedOn);
            const isCurrentUser = currentUser ? (currentUser._id.equals(commenterId) ? true : false) : false;
            const likedBy = currentUser ? (await CommentLike.findOne({userID: currentUser._id, commentID: id}) ? true : false) : false;

            const repliesDb = await Reply.find({ commentID: id });
            const commentReplies = [];

            for (var j = 0; j < repliesDb.length; j++) {
                const id = repliesDb[j]._id;
                const replierId = repliesDb[j].userID;
                const replier = await User.findById(repliesDb[j].userID);
                const replierName = replier.username;
                const replierProfile = replier.profile;
                const reply = repliesDb[j].reply;
                const likes = repliesDb[j].likes ? repliesDb[j].likes : 0;
                const replies = repliesDb[j].replies ? repliesDb[j].replies : 0;
                const postedOn = dateDifference(repliesDb[j].postedOn);
                const isCurrentUser = currentUser ? (currentUser._id.equals(replierId) ? true : false) : false;
                // MAKE REPLY TO TO BE USER ID INSTEAD OD COMMENT OR REPLY ID
                const repliedTo = await User.findById(repliesDb[j].replyTo);
                const likedBy = currentUser ? (await CommentLike.findOne({userID: currentUser._id, commentID: id}) ? true : false) : false;

                commentReplies.push({
                    id,
                    replierId,
                    replier,
                    replierName,
                    replierProfile,
                    reply,
                    likes,
                    replies,
                    postedOn,
                    isCurrentUser,
                    likedBy,
                    repliedTo
                });
            }

            comments.push({
                id,
                commenterId,
                commenter,
                commenterName,
                commenterProfile,
                comment,
                likes,
                replies,
                postedOn,
                isCurrentUser,
                likedBy,
                commentReplies
            });
        }
        res.locals.comments = comments;
        next();
    } catch (error) {
        console.log(error);
        res.locals.comments = null;
    }
}

module.exports = {
    getPostComments
}