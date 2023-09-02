const mongoose = require('mongoose');
const metaData = require('../constants/meta_data');

const eventSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please fill your event name'],
    },
    description: {
        type: String,
    },
    location: {
        type: String,
    },
    startDate: {
        type: Date,
        required: [true, 'Please fill your event start date'],
    },
    endDate: {
        type: Date,
        required: [true, 'Please fill your event end date'],
    },
    startTime: {
        type: String,
        required: [true, 'Please fill your event start time'],
    },
    endTime: {
        type: String,
        required: [true, 'Please fill your event end time'],
    },
    color: {
        type: String,
        required: [true, 'Please fill your event color'],
    },
    recurring: {
        type: Boolean,
        default: false,
    },
    recurringType: {
        type: String,
        enum: ['Daily', 'Weekly', 'Monthly', 'Yearly'],
    },
    recurringEndDate: {
        type: Date,
    },
    reminder: {
        type: Date,
        validate: {
            validator: function (el) {
                return el < this.eventStartDate;
            },
        },
    },
});

metaData.apply(eventSchema);

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
