const express = require('express')
const router = express.Router()
const Artist = require('../models/artist')
const Album = require('../models/album')
const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif']

// all artists route
router.get('/',  async (req, res) => {
    let searchoptions = {}
    if (req.query.name != null && req.query.name !== '') {
        searchoptions.name = new RegExp(req.query.name, 'i')
    }
    try {
        const artists = await Artist.find(searchoptions)
        res.render('artists/index', { 
            artists: artists, 
            searchoptions: req.query 
        })
    } catch {
        res.redirect('/')
    }
 })

// new artist route
router.get('/new', (req, res) =>{
    res.render('artists/new', { artist: new Artist() })
})

// create artist route
router.post('/', async (req, res) => {
    const artist = new Artist({
        name: req.body.name,
        description: req.body.description
    })
    saveCover(artist, req.body.cover)

    try {
        const newArtist = await artist.save()
        res.redirect(`artists/${newArtist.id}`)
    } catch {
        res.render('artists/new', {
            artist: artist,
            errorMessage: 'Error Creating Artist'
        })
    }
})
// show artists route
router.get('/:id', async (req, res) => {
    try {
        const artist = await Artist.findById(req.params.id)
        const albums = await Album.find({ artist: artist.id})
        res.render('artists/show', {
            artist: artist,
            albumsByArtist: albums
        })
    } catch {
        res.redirect('/')
    }
})
// edit artist route
router.get('/:id/edit', async (req, res) => {
    try{
        const artist = await Artist.findById(req.params.id)
        res.render('artists/edit', { artist: artist})
    } catch {
        res.redirect('/artists')
    }
})
// update artist route
router.put('/:id', async (req, res) => {
    let artist
    try {
        artist = await Artist.findById(req.params.id)
        artist.name = req.body.name
        artist.description = req.body.description
        if (req.body.cover != null && req.body.cover !== '') {
            saveCover(artist, req.body.cover)
        }
        await artist.save()
        res.redirect(`/artists/${artist.id}`)
    } catch {
        if (artist == null) {
            res.redirect('/')
        } else {
            res.render('artists/edit', {
                artist: artist,
                errorMessage: 'Error Updating Artist'
            })
        }
    }
})
// delete artist route
router.delete('/:id', async (req, res) => {
    let artist
    try {
        artist = await Artist.findById(req.params.id)
        
        await artist.deleteOne()
        
        res.redirect('/artists')
    } catch {
        if (artist == null) {
            res.redirect('/')
        } else {
            console.log("skipped delete and redirected to artist page")
            res.redirect(`/artists/${artist.id}`)
        }
    }
})

function saveCover(artist, coverEncoded) {
    if (coverEncoded == null) return
    const cover = JSON.parse(coverEncoded)
    if (cover != null && imageMimeTypes.includes(cover.type)) {
        artist.coverImage = new Buffer.from(cover.data, 'base64')
        artist.coverImageType = cover.type
    }
}

module.exports = router