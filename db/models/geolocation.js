//DEFINED GEOLOCATION SCHEMA
const mongoose = require('mongoose')
const haversine = require('haversine')
const {User} = require('./user')
const {forEach} = require('async-foreach')
const _ = require('lodash')

const geolocationSchema = new mongoose.Schema({
    latitude: {
        type: Number,
        required: true
    },
    longitude: {
        type: Number,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    }
})

//Finds all nearby geolocations given the threshold and returns the users associated with them
geolocationSchema.statics.findNearbyUsersByGeolocation = async function(userGeolocation, username, threshold){
    let closeUsers = []
    let geolocations = await this.find({})
    for (let geoloc of geolocations){
        if (haversine(userGeolocation, geoloc, {unit: 'mile', threshold})){
            let nearbyUser = await User.findById(geoloc.user)
            if (nearbyUser.username === username)
                continue
            closeUsers.push(nearbyUser.username)
        }
    }
    
    return closeUsers
}

const Geolocation = mongoose.model('Geolocation', geolocationSchema)

module.exports = {
    Geolocation
}