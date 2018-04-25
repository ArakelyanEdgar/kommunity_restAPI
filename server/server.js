const express = require('express')
const app = express()

//database libraries
const {mongoose} = require('../db/server/mongoose')
const {User} = require('../db/models/user')

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
        //create user
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


let port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Server deployed on port: ${port}`)
})