import mongoose, { Document, Model, Schema } from 'mongoose';
import validator from 'validator';
import metaData from '@constants/meta_data';

enum SendThrough {
    SMS = "sms",
    Gmail = "gmail",
    Notification = "notification"
}
enum CategoryType{
    Message = "message",
    Alert = "alert",
    Reminder = "reminder",
    Other = "other"
}

interface INotification extends Document {
    id: string;
    sentDate: Date;
    receivedDate: Date;
    seen: boolean;
    content: string;
    category: CategoryType;
    sender: string | mongoose.Types.ObjectId;
    receiver: mongoose.Types.ObjectId;
    sendThrough: SendThrough;
}

const notificationSchema: Schema = new mongoose.Schema<INotification>(
    {
        sentDate: {
            type: Date,
            default: Date.now(),
        },
        receivedDate: {
            type: Date,
        },
        seen: {
            type: Boolean,
            default: false,
        },
        content: {
            type: String,
            required: [true, 'Notification must have a content'],
        },
        category: {
            type: String,
            enum: [
                CategoryType.Message,
                CategoryType.Reminder,
                CategoryType.Alert,
                CategoryType.Other,
            ],
            default: CategoryType.Alert,
            validate: {
                validator: function (value: string) {
                    return validator.isIn(value, [
                        CategoryType.Message,
                        CategoryType.Reminder,
                        CategoryType.Alert,
                        CategoryType.Other,
                    ]);
                },
                message: 'Invalid Category value',
            },
        },
        sender: {
            type: String,
            required: [
                true,
                'The sender is required & please contact the admin to fix this issue',
            ],
            ref: 'User',
        },
        receiver: {
            type: Schema.Types.ObjectId,
            required: [true, 'The receiver cannot be empty'],
            ref: 'User',
        },
        sendThrough: {
            type: String,
            enum: [
                SendThrough.SMS,
                SendThrough.Gmail,
                SendThrough.Notification,
            ],
            default: SendThrough.Notification,
            validate: {
                validator: function (value: string) {
                    return validator.isIn(value, [
                        SendThrough.SMS,
                        SendThrough.Gmail,
                        SendThrough.Notification,
                    ]);
                },
                message: 'Invalid sendThrough value',
            },
        },
    },
    {
        timestamps: true,
    }
);

// add meta data to the schema
metaData.apply(notificationSchema)

notificationSchema.pre('find', function () {
    this.where({ deleted: false });
});

notificationSchema.pre('findOne', function () {
    this.where({ deleted: false });
});

const Notification: Model<INotification> = mongoose.model<INotification>("Notification", notificationSchema);
export default Notification;

