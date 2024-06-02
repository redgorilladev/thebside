const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const Album = require('../models/album')
const uploadPath = path.join('public', Album.coverImageBasePath)
const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif']
const Artist = require('../models/artist')
const upload = multer({
    dest: uploadPath,
    fileFilter: (req, file, callback) => {
        callback(null, imageMimeTypes.includes(file.mimetype))
    }
})

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
router.post('/', upload.single('cover'), async (req, res) => {
    const fileName = req.file != null ? req.file.filename : null
    const album = new Album({
        title: req.body.title,
        artist: req.body.artist,
        releaseDate: new Date(req.body.releaseDate),
        tracks: req.body.tracks,
        coverImageName: fileName,
        description: req.body.description
    })

    try {
        const newAlbum = await album.save()
        // res.redirect(`albums/${newAlbum.id}`)
        res.redirect(`albums`)
    } catch {
        if (album.coverImageName != null) {
            removeAlbumCover(album.coverImageName)
        }
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

function removeAlbumCover(fileName) {
    fs.unlink(path.join(uploadPath, fileName), err => {
        if (err) console.error(err)
    })
}

module.exports = router