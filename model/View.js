const mongoose = require('mongoose');
const Schema = require('mongoose').Schema;

const viewsSchema = new Schema({
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

module.exports = mongoose.model('view', viewsSchema)