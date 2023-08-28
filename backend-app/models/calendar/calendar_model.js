const mongoose = require('mongoose');
const metaData = require('../constants/meta_data');

const calendarSchema = new mongoose.Schema(
    {
        calendarName: {
            type: String,
            required: [true, 'Please fill your calendar name'],
        },
        calendarType: {
            type: String,
            required: [true, 'Please fill your calendar type'],
            validate: {
                validator: function (el) {
                    return el === 'Personal' || el === 'Group';
                },
            },
        },
        isPublic: {
            type: Boolean,
            default: false,
        },
        isShareAble: {
            type: Boolean,
            default: false,
            description: 'If true, the calendar can be shared with other users',
        },
        participants: [
            {
                type: mongoose.Schema.ObjectId,
                ref: 'User',
            },
        ],
        events: [
            {
                type: mongoose.Schema.ObjectId,
                ref: 'Event',
            },
        ],
        creationDate: {
            type: Date,
            default: Date.now(),
        },
        description: {
            type: String,
        },
        accessCode: {
            type: String,
        },
        tags: [
            {
                type: String,
            },
        ],
        allowedUsers: [
            {
                type: mongoose.Schema.ObjectId,
                ref: 'User',
            },
        ],
        deniedUsers: [
            {
                type: mongoose.Schema.ObjectId,
                ref: 'User',
            },
        ],
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

metaData.apply(calendarSchema);

const Calendar = mongoose.model('Calendar', calendarSchema);

module.exports = Calendar;
