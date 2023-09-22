import mongoose, { Schema } from 'mongoose';
import metaData from '@constants/meta_data';
import { IEvent } from '@interfaces/models/i_event';

const eventSchema: Schema = new Schema<IEvent>({
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
            validator: function (this: IEvent, el: Date) {
                return el < this.startDate;
            },
        },
    },
});

metaData.apply(eventSchema);

const Event = mongoose.model<IEvent>('Event', eventSchema);

export default Event;
