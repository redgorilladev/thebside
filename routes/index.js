const express = require('express')
const router = express.Router()
const Album = require('../models/album')

router.get('/', async (req, res) =>{
    let albums
    try {
       albums = await Album.find().sort({ createdAt: 'desc'}).limit(10).exec() 
    } catch {
        albums = []
    }
    if (req.isAuthenticated()){
        console.log('logged in')
        res.render('index', { albums: albums, loggedIn: true })
    } else {
        console.log('logged out')
        res.render('index', { albums: albums, loggedIn: false })
    }
})

module.exports = router