const mongoose = require('mongoose');
const Schema = require('mongoose').Schema;
const Reply = require('./Reply');
const CommentLike = require('./CommentLike');
const Comment = require('./Comment');

const replySchema = new Schema({
    userID: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true
    },
    postID: {
        type: mongoose.Types.ObjectId,
        ref: 'Post',
        required: true
    },
    commentID:{
        type: mongoose.Types.ObjectId,
        ref: 'Comment',
        required: true
    },
    reply: {
        type: String,
        required: true
    },
    replyTo:{
        type: mongoose.Types.ObjectId,
        ref: 'reply',
        required: true
    },
    replies: {
        type: Number,
        default: 0
    },
    likes: {
        type: Number,
        default: 0
    },
    postedOn: {
        type: Date,
        default: mongoose.now()
    }
});

replySchema.pre('deleteMany', async function(next){
    await CommentLike.deleteMany({
        commentID: this._id
    });
    // fetch and delete all replies belonging to this comment
    // const repliesToThis = await this.find({
    //     commentID: this._id
    // });

    // console.log(repliesToThis);

    // repliesToThis.forEach(reply=>{
    //     if(reply){
    //         reply.deleteOne();
    //     }
    // });
    // const replies = await this.find({commentID: this.commentID}).countDocuments();
    // await Comment.findByIdAndUpdate(this.commentID, {replies});
    next();
});

module.exports = mongoose.model('reply', replySchema);