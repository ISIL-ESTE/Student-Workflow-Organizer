import mongoose, { Schema, Document } from 'mongoose';
import metaData from '@constants/meta_data';

export interface ICalendar extends Document {
    Name: string;
    Type: string;
    isPublic: boolean;
    isShareAble: boolean;
    participants: mongoose.Schema.Types.ObjectId[];
    events: mongoose.Schema.Types.ObjectId[];
    description?: string;
    accessCode?: string;
    tags: string[];
    allowedUsers: mongoose.Schema.Types.ObjectId[];
    deniedUsers: mongoose.Schema.Types.ObjectId[];
    deleted: boolean;
    deletedBy?: string;
    deletedAt?: Date;
    createdBy?: string;
    updatedBy?: string;
}

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
