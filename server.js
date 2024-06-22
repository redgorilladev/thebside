if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}

const express = require('express')
const app = express()
const expressLayouts = require('express-ejs-layouts')
const bodyParser = require('body-parser')
const methodOverride = require('method-override')
const path = require('path')


const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const bcrypt = require('bcrypt')
const LocalStrategy = require('passport-local').Strategy


const indexRouter = require('./routes/index')
const artistRouter = require('./routes/artists')
const albumRouter = require('./routes/albums')

const User = require('./models/user')


app.set('view engine', 'ejs')
app.set('views', __dirname + '/views')
app.set('layout', 'layouts/layout')
app.use(expressLayouts)
app.use(methodOverride('_method'))
app.use(express.static(__dirname + '/public'))
app.use(bodyParser.urlencoded({ limit: '10mb', extended: false }))

const MongoStore = require('connect-mongo')
const mongoose = require('mongoose')
mongoose.connect(process.env.DATABASE_URL)
const db = mongoose.connection
db.on('error', error => console.error(error))
db.once('open', () => console.log('Connected to Mongoose')) 

// required for login/register functionality
app.use(flash())
app.use(session({
     secret: process.env.SESSION_SECRET,
     resave: false,
     saveUninitialized: false,
     store: new MongoStore({ mongoUrl: db.client.s.url})
 }))

const strategy = new LocalStrategy(User.authenticate())
passport.use(strategy)
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())
app.use(passport.initialize())
app.use(passport.session())

   


app.use('/', indexRouter)
app.use('/artists', artistRouter)
app.use('/albums', albumRouter)



app.get('/register', (req, res) => {
     res.render('register')
 })

app.post('/register',  (req, res) =>{
    User.register(
        new User({
            name: req.body.name,
            username: req.body.username
        }), req.body.password, function (err, msg) {
            if (err) {
                res.send(err)
            } else {
                console.log('register successful?')
                res.redirect('/login')
            }
        }
    ) 
       
})

app.get('/login', (req, res) => {
    res.render('login')
})

app.post('/login', passport.authenticate('local', {
    failureRedirect: '/login-failure',
    successRedirect: '/profile'
}), (err, req, res, next) => {
    if (err) next(err)
})

app.get('/login-success', (req, res, next) => {
    console.log(req.session)
    res.render('login-success')
})

app.get('/login-failure', (req, res, next) => {
    console.log(req.session)
    res.render('login-failure')
})

app.get('/logout', (req, res, next) => {
    req.logout((err) =>{
        if (err){
            return next(err)
        }
        console.log('logged out')
        res.redirect('/')
    })
})

app.get('/profile', async (req, res) => {
    if (req.isAuthenticated()) {
        console.log(req.session)
        console.log(req.user.username)
        console.log(req.user.id)
        console.log('authenticated')
        res.render('profile', {username: req.user.username})
    } else {
        console.log('not authenticated')
        res.redirect('login')
    }
})

app.listen(process.env.PORT || 3000)
