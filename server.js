if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}

const express = require('express')
const app = express()
const expressLayouts = require('express-ejs-layouts')
const bodyParser = require('body-parser')
const methodOverride = require('method-override')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const bcrypt = require('bcrypt')
const localStrategy = require('passport-local')
const passportLocalMongoose = require('passport-local-mongoose')

const indexRouter = require('./routes/index')
const artistRouter = require('./routes/artists')
const albumRouter = require('./routes/albums')
const User = require('./models/user')


app.set('view engine', 'ejs')
app.set('views', __dirname + '/views')
app.set('layout', 'layouts/layout')
app.use(expressLayouts)
app.use(methodOverride('_method'))
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ limit: '10mb', extended: false }))
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())

passport.use(new localStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

const mongoose = require('mongoose')
mongoose.connect(process.env.DATABASE_URL)

const db = mongoose.connection
db.on('error', error => console.error(error))
db.once('open', () => console.log('Connected to Mongoose'))    


app.use('/', indexRouter)
app.use('/artists', artistRouter)
app.use('/albums', albumRouter)

app.get('/register', (req, res) => {
    res.render('register')
})

app.post('/register', async (req, res) =>{
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        try{
            const user =  await User.create({
                name: req.body.name,
                username: req.body.username,
                password: hashedPassword
            })
            console.log(user)
            res.redirect('/login')
        } catch (e) {
            console.log(e, 'error creating user')
            res.redirect('/register')
        }
    } catch (error) {
        console.log(error, 'error hashing password')
        res.redirect('/register')
    }
    
})

app.get('/login', (req, res)=> {
    res.render('login')
})

app.post('/login', async (req, res) => {
    try {
        const user = await User.findOne({username: req.body.username})
        if (user) {
          if  (await bcrypt.compare(req.body.password, user.password)){
                res.render('userpage')
          } else {
            res.status(400).json({error: 'passwords dont match'})
          }
        } else {
            res.status(400).json({error: 'user doesnt exist'})
        }
    } catch (error) {
        res.status(400).json({error})
    }
})

app.listen(process.env.PORT || 3000)
