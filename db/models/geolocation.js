//DEFINED GEOLOCATION SCHEMA

const mongoose = require('mongoose')

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

const Geolocation = mongoose.model('Geolocation', geolocationSchema)

module.exports = {
    Geolocation
}