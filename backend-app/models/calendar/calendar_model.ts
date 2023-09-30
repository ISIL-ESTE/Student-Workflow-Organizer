import mongoose, { Schema } from 'mongoose';
import metaData from '@constants/meta_data';
import { ICalendar } from '@interfaces/models/i_calendar';

const calendarSchema: Schema = new Schema<ICalendar>(
    {
        Name: {
            type: String,
            required: [true, 'Please fill your calendar name'],
        },
        Type: {
            type: String,
            required: [true, 'Please fill your calendar type'],
            validate: {
                validator: function (el: string) {
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
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
        events: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Event',
            },
        ],
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
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
        deniedUsers: [
            {
                type: mongoose.Schema.Types.ObjectId,
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

const Calendar = mongoose.model<ICalendar>('Calendar', calendarSchema);

export default Calendar;
