
const mongoose = require('mongoose');
const validator = require('validator');
const metaData = require('../constants/meta_data');

const eventSchema = new mongoose.Schema(
    {
        eventName: {
            type: String,
            required: [true, 'Please fill your event name'],
        },
        eventDescription: {
            type: String,
        },
        eventLocation: {
            type: String,
        },
        eventStartDate: {
            type: Date,
            required: [true, 'Please fill your event start date'],
        },
        eventEndDate: {
            type: Date,
            required: [true, 'Please fill your event end date'],
        },
        eventStartTime: {
            type: String,
            required: [true, 'Please fill your event start time'],
        },
        eventEndTime: {
            type: String,
            required: [true, 'Please fill your event end time'],
        },
        eventColor: {
            type: String,
            required: [true, 'Please fill your event color'],
        },
        eventRecurring: {
            type: Boolean,
            default: false,
        },
        eventRecurringType: {
            type: String,
            enum: ['Daily', 'Weekly', 'Monthly', 'Yearly'],
        },
        eventRecurringEndDate: {
            type: Date,
        },
        eventRecurringTime: {
            type: String,
        },
    })

