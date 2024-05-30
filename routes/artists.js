const express = require('express')
const router = express.Router()
const Artist = require('../models/artist')

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
        name: req.body.name
    })
    
    try {
        const newArtist = await artist.save()
        // res.redirect(`artists/${newArtist.id}`)
        res.redirect(`artists`)

    } catch {
        res.render('artists/new', {
            artist: artist,
            errorMessage: 'Error Creating Artist'
        })
    }
})

module.exports = router