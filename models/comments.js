const mongoose = require('mongoose')

const commentsSchema = new mongoose.Schema({
    createdAt: {
        type: Date,
        required: true,
        default: Date.now
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    commentContent: {
        type: String,
        required: true
    },
    album: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Album'
    }
})

module.exports = mongoose.model('Comments', commentsSchema)