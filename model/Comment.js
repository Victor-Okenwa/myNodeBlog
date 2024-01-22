const mongoose = require('mongoose');
const Schema = require('mongoose').Schema;
const Reply = require('./Reply');
const CommentLike = require('./CommentLike');
const Comment = require('./Comment');
const Post = require('./Post');

const commentSchema = new Schema({
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
    comment: {
        type: String,
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

// commentSchema.pre('deleteOne', async function(next){
    
  

//     // const comments = await this.find({postID: this.postID}).countDocuments();
//     // await Post.findByIdAndUpdate(this.postID, comments);
//     next();
// });

module.exports = mongoose.model('comment', commentSchema);