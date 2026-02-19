const e = require('express');
const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    role: {
        type: String,
        enum: ['driver', 'customer'],
        required: true,
    },

    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    phone: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true
    },
   location: {
  type: {
    type: String,
    enum: ["Point"],
    default: "Point"
  },
  coordinates: {
    type: [Number], // [lng, lat]
    default: [0, 0]}
}
,
    truckType:{
        enum:["","Container","Open","Trailer"],
        type: String,
    },
    truckNumber: {
        type: String,
        unique: true,
         sparse: true, // Allows multiple null values
        default: null
    },
    licenseNumber: {
        type: String,
        unique: true,
        default: null
    },
  fcmTokens: {
  type: [String],
  default: []
}

},
    {
        timestamps: true
    });
    userSchema.index({ location: "2dsphere" });

const User = mongoose.model('User', userSchema);
module.exports = User;