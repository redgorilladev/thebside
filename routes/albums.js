const express = require('express')
const router = express.Router()
const Album = require('../models/album')
const Artist = require('../models/artist')
const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif']

// all albums route
router.get('/',  async (req, res) => {
    let query = Album.find()
    if (req.query.title != null && req.query.title != '') {
        query = query.regex('title', new RegExp(req.query.title, 'i'))
    }
    if (req.query.releasedBefore != null && req.query.releasedBefore != '') {
        query = query.lte('releaseDate', req.query.releasedBefore)
    }
    if (req.query.releasedAfter != null && req.query.releasedAfter != '') {
        query = query.gte('releaseDate', req.query.releasedAfter)
    }
    try {
        const albums = await query.exec()
        res.render('albums/index', {
            albums: albums,
            searchoptions: req.query
        })
    } catch {
        res.redirect('/')
    }
 })

// new album route
router.get('/new', async (req, res) =>{
    renderNewPage(res, new Album())
})


// create album route
router.post('/', async (req, res) => {
    const album = new Album({
        title: req.body.title,
        artist: req.body.artist,
        releaseDate: new Date(req.body.releaseDate),
        tracks: req.body.tracks,
        description: req.body.description
    })
    saveCover(album, req.body.cover)

    try {
        const newAlbum = await album.save()
        // res.redirect(`albums/${newAlbum.id}`)
        res.redirect(`albums`)
    } catch {
        renderNewPage(res, album, true)
    }
})

async function renderNewPage(res, album, hasError = false) {
    try {
        const artists = await Artist.find({})
        const params = {
            artists: artists,
            album: album
        }
        if (hasError) params.errorMessage = 'Error Creating Album'
        res.render('albums/new', params)

    } catch {
        res.redirect('/albums')
    }
}

function saveCover(album, coverEncoded) {
    if (coverEncoded == null) return
    const cover = JSON.parse(coverEncoded)
    if (cover != null && imageMimeTypes.includes(cover.type)) {
        album.coverImage = new Buffer.from(cover.data, 'base64')
        album.coverImageType = cover.type
    }
}

module.exports = router