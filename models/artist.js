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

module.exports = mongoose.model('Artist', artistSchema)