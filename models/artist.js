const mongoose = require('mongoose')
const Album = require('./album')

const artistSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },

    description: {
        type: String,
        required: true
    },
    coverImage: {
        type: Buffer,
        required: true
    },
    coverImageType: {
        type: String,
        required: true
    }
})

artistSchema.pre("deleteOne", async function (next) {
    try {
        const query = this.getFilter()
        const hasAlbum = await Album.exists({ artist: query._id })
  
        if (hasAlbum) {
            next(new Error("This artist still has albums."))
            console.log("still has albums")
        } else {
            next()
        }
    } catch (err) {
        next(err)
    }
});

artistSchema.virtual('coverImagePath').get(function() {
    if (this.coverImage != null && this.coverImageType != null) {
        return `data:${this.coverImageType};charset=utf-8;base64,
        ${this.coverImage.toString('base64')}`
    }
})

module.exports = mongoose.model('Artist', artistSchema)