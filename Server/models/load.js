const express=require('express');
const mongoose=require('mongoose');

const loadsSchema= mongoose.Schema({
    source :{
        type: String,
        required: true
    },
    destination :{
        type: String,
        required: true
    },
    truckType: {
        type: String,
        required: true
    },
    date : {
        type: Date,
        required: true
    },
    weight : {
        type: String,
        required: true
    },
    loadDetails : {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'cancelled'],
        default: 'pending' // Default status
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    driverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null // Initially no driver is assigned}
    },
    acceptedAt: {
        type: Date,
        default: null
    }
})
const Load= mongoose.model('Load',loadsSchema);
module.exports=Load;