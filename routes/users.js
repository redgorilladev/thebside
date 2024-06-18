const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const User = require('../models/user')
const passport = require('passport')

const initializePassport = require('../passport-config')
initializePassport(passport, 
     (req, res), async username => await User.findOne({username: req.body.username}))

    
router.get('/', (req, res) => {
    res.render('users/userpage')
})

router.get('/register', (req, res) => {
    res.render('users/register')
})

router.post('/register', async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        try{
            const user =  await User.create({
                name: req.body.name,
                username: req.body.username,
                password: hashedPassword
            })
            console.log(user)
            res.redirect('login')
        } catch (e) {
            console.log(e, 'error creating user')
            res.redirect('register')
        }
    } catch (error) {
        console.log(error, 'error hashing password')
        res.redirect('register')
    }
})

router.get('/login', (req, res) => {
    res.render('users/login')
})

router.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}))

// function initialize(passport, getUserByUsername) {
//     const authenticateUser = async (username, password, done) => {
//         const user = getUserByUsername(username)
//         if (user == null) {
//             return done(null, false, { message: 'no user with that username'})
//         }

//         try {
//             if (await bcrypt.compare(password, user.password)) {
//                 return done(null, user)
//             } else {
//                 return done(null, false, { message: 'password incorrect'})
//             }
//         } catch (error) {
//             return done(error)
//         }

//     }


    // passport.use(new LocalStrategy({ usernameField: 'username', passwordField: 'password'}, authenticateUser))
    // passport.serializeUser((user, done) => { })
    // passport.deserializeUser((id, done) => { })
//}

module.exports = router