const express = require('express')
const router = express.Router()
const Album = require('../models/album')
const Comment = require('../models/comments')
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
        if (req.isAuthenticated()){
            res.render('albums/index', {
                albums: albums,
                searchoptions: req.query,
                loggedIn: true
            })
            
        } else {
            res.render('albums/index', {
                albums: albums,
                searchoptions: req.query,
                loggedIn: false
            })
            
        }
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
        tracks: req.body.tracks.split(","),
        description: req.body.description
    })
    saveCover(album, req.body.cover)

    try {
        const newAlbum = await album.save()

        res.redirect(`albums/${newAlbum.id}`)
        
    } catch {
        renderNewPage(res, album, true)
    }
})

async function renderNewPage(res, album, hasError = false) {
    renderFormPage(res, album, 'new', hasError)
}


// show albums route
router.get('/:id', async (req, res) => {
    try {
        const album = await Album.findById(req.params.id).populate('artist').exec()

        const comments = await Comment.find().populate('user').exec()
        console.log(comments)

        if (req.isAuthenticated()){
            res.render('albums/show', { album: album, comments: comments, loggedIn: true })
        } else {
            res.render('albums/show', { album: album, comments: comments, loggedIn: false })
        }

    } catch (e) {
        console.log(e)
        res.redirect('/')
    }
})

// edit album route
router.get('/:id/edit', async (req, res) =>{
    try {
        const album = await Album.findById(req.params.id)
        renderEditPage(res, album)
    } catch {
        res.redirect('/')
    }
})

// post albums comments route
router.post('/:id', async (req, res) => {
    let album
    album = await Album.findById(req.params.id)
    const comments = await Comment.find().populate('user').exec()

    if (req.isAuthenticated()){
        try {
            const comment = new Comment({
                user: req.user.id,
                commentContent: req.body.comment,
                album: album
            })
            await comment.save()
            
            res.redirect(`${album.id}`)
        } catch (error) {
            console.log(error)
                if (album != null) {
                    res.render ('albums/show', {
                        album: album,
                        comments: comments,
                        loggedIn: true,
                        errorMessage: 'Error Posting Comment'
                    })
            }
        }
    } else {
            if (album != null) {
                res.render ('albums/show', {
                    album: album,
                    comments: comments,
                    loggedIn: false,
                    errorMessage: 'Must Be Logged In To Comment'
                })
        }
    } 
})

// update album route
router.put('/:id', async (req, res) =>{
    let album

    try {
        album = await Album.findById(req.params.id)
        album.title = req.body.title
        album.artist = req.body.artist
        album.releaseDate = new Date(req.body.releaseDate)
        album.tracks = req.body.tracks.split(",")
        album.description = req.body.description
        if (req.body.cover != null && req.body.cover !== '') {
            saveCover(album, req.body.cover)
        }
        await album.save()
        res.redirect(`/albums/${album.id}`)
    } catch {
        if (album != null){
            renderEditPage(res, album, true)
        } else {
            res.redirect('/')
        }
    }
})

// delete album page
router.delete('/:id', async (req, res) => {
    let album
    album = await Album.findById(req.params.id)
    const comments = await Comment.find().populate('user').exec()
    if(req.isAuthenticated()){
        try {
            await album.deleteOne()
            res.redirect('/albums')
        } catch {
            if (album != null) {
                res.render ('albums/show', {
                    album: album,
                    comments: comments,
                    loggedIn: true,
                    errorMessage: 'Could Not Remove Album'
                })
            } else {
                res.redirect('/')
            }
        }
    }
    res.render ('albums/show', {
        album: album,
        comments: comments,
        errorMessage: 'Must Be Admin To Delete Album'
    })
})

async function renderEditPage(res, album, hasError = false) {
    renderFormPage(res, album, 'edit', hasError)
}

async function renderFormPage(res, album, form, hasError = false) {
    try {
        const artists = await Artist.find({})
        const params = {
            artists: artists,
            album: album
        }
            if (hasError) {
                if (form === 'edit'){
                    params.errorMessage = 'Error Updating Album'
                } else {
                    params.errorMessage = 'Error Creating Album'
                }
            }
            // no auth check or loggedIn true passed here as the edit function should be only available to authed admins
            res.render(`albums/${form}`, params)        

    } catch (e) {
        console.log(e)
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