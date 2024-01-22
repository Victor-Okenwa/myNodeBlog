const mongoose = require('mongoose');
const Schema = require('mongoose').Schema;

const likesSchema = new Schema({
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
    ipAddress: String,
    likedOn: {
        type: Date,
        default: mongoose.now()
    }
});

// likesSchema.pre('save', function(next){
//     next()
// })

module.exports = mongoose.model('like', likesSchema)