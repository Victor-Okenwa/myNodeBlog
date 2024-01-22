const mongoose = require('mongoose');
const Schema = require('mongoose').Schema;

const commentLikesSchema = new Schema({
    type: {
        type: String,
        required: true
    },
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
    commentID: {
        type: mongoose.Types.ObjectId,
        required: true
    },
    ipAddress: String,
    likedOn: {
        type: Date,
        default: mongoose.now()
    }
});

// commentLikesSchema.pre('save', function(next){
//     next()
// })

module.exports = mongoose.model('commentLike', commentLikesSchema)