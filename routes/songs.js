const express = require('express')
const router = express.Router()
const Album = require('../models/album')
const Artist = require('../models/artist')
const Song = require('../models/song')

// all Songs route
router.get('/',  async (req, res) => {
    let query = Song.find()
    if (req.query.title != null && req.query.title != '') {
        query = query.regex('title', new RegExp(req.query.title, 'i'))
    }
    try {
        const songs = await query.exec()
        const artists = await Artist.find({})
        const albums = await Album.find({})
        res.render('songs/index', {
            songs: songs,
            searchoptions: req.query,
            artists: artists,
            albums: albums
        })
    } catch {
        res.redirect('/')
    }
 })

// new song route
router.get('/new', async (req, res) =>{
    renderNewPage(res, new Song())
})


// create song route
router.post('/', async (req, res) => {
    const song = new Song({
        title: req.body.title,
        artist: req.body.artist,
        album: req.body.album
    })
    try {
        const newSong = await song.save()
        // res.redirect(`albums/${newAlbum.id}`)
        res.redirect(`songs`)
    } catch (err) {
        console.log("error creating song" + err)
    }
})

async function renderNewPage(res, song, hasError = false) {
    try {
        const artists = await Artist.find({})
        const albums = await Album.find({})
        const params = {
            song: song,
            artists: artists,
            albums: albums
        }
        if (hasError) params.errorMessage = 'Error Creating Song'
        res.render('songs/new', params)

    } catch {
        res.redirect('/songs')
    }
}

module.exports = router