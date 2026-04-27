const e = require('express');
const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    role: {
        type: String,
        enum: ['driver', 'customer', 'admin'],
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
        sparse: true
    },
    licenseNumber: {
        type: String,
        unique: true,
        sparse: true
    },
  fcmTokens: {
  type: [String],
  default: []
},
    walletBalance: {
        type: Number,
        default: 0
    },
    cancellationCount: {
        type: Number,
        default: 0
    },
    isApproved: {
        type: Boolean,
        default: false
    },
    documents: {
        photo: { type: String, default: null },
        rcBook: { type: String, default: null },
        aadhar: { type: String, default: null }
    }

},
    {
        timestamps: true
    });
    userSchema.index({ location: "2dsphere" });

const User = mongoose.model('User', userSchema);
module.exports = User;