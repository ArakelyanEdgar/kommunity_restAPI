//DEFINED GEOLOCATION SCHEMA
const mongoose = require('mongoose')
const haversine = require('haversine')
const {User} = require('./user')

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

//Finds all nearby geolocations given the threshold
geolocationSchema.statics.findNearbyGeolocations = async function(userGeolocation, threshold){
    let geolocations = this
    const closeUsers = []

    geolocations.forEach(geoloc => {
        if (haversine(userGeolocation, geoloc, {unit: 'mile', threshold})){
            let nearbyUser = await User.findById(geoloc.user)
            closeUsers.push(nearbyUser)
        }
    })

    return closeUsers
}

const Geolocation = mongoose.model('Geolocation', geolocationSchema)

module.exports = {
    Geolocation
}