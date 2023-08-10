

const mongoose = require('mongoose');
const validator = require('validator');
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
                }
            }
        },
        isPublic: {
            type: Boolean,
            default: false,
        },
        isShared: {
            type: Boolean,
            default: false,
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
        // reminders: [
        //     {
        //         type: mongoose.Schema.ObjectId,
        //         ref: 'Reminder',
        //     },
        // ],
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
        // attachment: {
        //     type: Buffer,
        // },
        tags: [
            {
                type: String,
            },
        ],
        // categories: [
        //     {
        //         type: mongoose.Schema.ObjectId,
        //         ref: 'Category',
        //     },
        // ],
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

