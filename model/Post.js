const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const moment = require('moment');

const postSchema = new Schema({
    posterID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'poster id is required'],
    },
    title: {
        type: String,
        required: [true, 'title is required'],
    },
    content: {
        type: String,
        required: [true, 'content is required']
    },
    category: {
        type: String,
        required: [true, 'category is required']
    },
    thumbnail: {
        type: String,
        required: [true, 'Thumbnail is required']
    },
    comments: {
        type: Number,
        default: 0
    },
    likes: {
        type: Number,
        default: 0
    },
    views: {
        type: Number,
        default: 0
    },
    postedOn: {
        type: Date,
        default: mongoose.now()
    }
});

module.exports = mongoose.model('post', postSchema);