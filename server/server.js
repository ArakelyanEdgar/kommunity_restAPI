const express = require('express')
const app = express()

//database libraries
const {mongoose} = require('../db/server/mongoose')
const {User} = require('../db/models/user')
const {Geolocation} = require('../db/models/geolocation')

//libraries
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const _ = require('lodash')
const {authenticate} = require('./middleware/authenticate')
const nodemailer = require('nodemailer')

app.use(bodyParser.json())             
app.use(cookieParser())

//POST /signup | creates a new user
app.post('/users/signup', async (req, res) => {
    let body = _.pick(req.body, 'username', 'password')
    if (!body.username || !body.password)
        return res.status(400).send()
    let user = new User(body)
    try{
        user = await user.save()
        //clear possible cookie x-auth token from past session
        res.clearCookie('x-auth')
        //get auth token and create cookie
        let token = await user.generateAuthToken()
        res.status(200).cookie('x-auth', token).send()
    }catch(e){
        return res.status(400).send()
    }
})

//POST /users/login | users logs in if password is verified for username
app.post('/users/login', async (req, res) => {
    let body = _.pick(req.body, 'username', 'password')

    if (!body.username || !body.password)
        return res.status(400).send()

    try{
        let user = await User.findOne({username: body.username})
        if (!user)
            return res.status(404).send()

        //verify password
        let userVerification = await user.verifyPassword(body.password)
        //user verified, so log them in by setting auth cookie
        res.status(200).clearCookie('x-auth').cookie('x-auth', user.token).send()
    }catch(err){
        return res.status(400).send()
    }
})

//GET /users/logout | user logouts by clearing auth token
app.get('/users/logout', authenticate, (req, res) => {
    if(!req.cookies['x-auth'])
        return res.status(400).send()

    res.clearCookie('x-auth')
    res.status(200).send()
})


//DELETE /users/username | removes user with username if user is authenticated
app.delete('/users/removeUser', authenticate, async (req, res) => {
    let body = _.pick(req.body, 'username', 'password')
    try{
        //find user with current auth token and determine if it is the same user they are trying to delete
        let user = await User.findByToken(req.token)
        if (body.username !== user.username)
            return res.status(401).send()
        await user.verifyPassword(body.password)
        await user.remove()
        res.clearCookie('x-auth')
        return res.status(200).send()
    }catch(e){
        return res.status(400).send()
    }
})

//POST /geolocation | adds user's geolocation
app.post('/geolocation', authenticate, async (req, res) => {
    let body = _.pick(req.body, 'latitude', 'longitude')
    try{
        let user = await User.findByToken(req.token)
        body.user = user._id
        //only allow user to have one geolocation at a time
        let userGeo = await Geolocation.findOne({user: body.user})
        if (userGeo)
            throw new Error()
        let geolocation = await new Geolocation(body)
        await geolocation.save()
        res.status(200).send()
    }catch(err){
        res.status(400).send()
    }
})

//DELETE /geolocation | removes user's geolocation
app.delete('/geolocation', authenticate, async (req, res) => {
    let user = await User.findByToken(req.token)
    let deletedGeolocation = await Geolocation.findOneAndRemove({user: user._id})
    res.status(200).send()
})

app.patch('/geolocation', authenticate, async(req, res) => {
    let body = _.pick(req.body, 'latitude', 'longitude')
    let user = await User.findByToken(req.token)
    let userGeo = await Geolocation.findOne({user: user._id})
    await userGeo.update(body)
    res.status(200).send()
})

//GET /findNearbyUsers | returns with all users near the threshold
app.post('/findNearbyUsers', authenticate, async (req, res) => {
    let threshold = req.body.threshold
    if (!threshold)
        threshold = 25
    let user = await User.findByToken(req.token)
    let userGeo = await Geolocation.findOne({user: user._id})
    let nearbyUsers = await Geolocation.findNearbyUsersByGeolocation(userGeo, user.username, threshold)
    res.status(200).send(nearbyUsers)
})

let port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Server deployed on port: ${port}`)
})