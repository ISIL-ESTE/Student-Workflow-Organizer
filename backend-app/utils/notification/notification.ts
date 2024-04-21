import Notification, {
    INotification,
} from '@root/models/notifications/notification_model';
import logger from '../logger';
type notificationInput = Pick<
    INotification,
    'content' | 'sender' | 'receiver' | 'category' | 'sendThrough'
>;
// type notificationOutput = Required<INotification>;
export default class NotificationHandler {
    public static async createNotification(
        data: notificationInput
    ): Promise<INotification> {
        const { content, sender, receiver, category, sendThrough } = data;

        if (!content || !sender || !receiver || !category || !sendThrough) {
            logger.warn('Failed to create Notification.');
            return null;
        }
        if (sender.toString() === receiver.toString()) return null;
        try {
            const notification = await Notification.create({
                content,
                sender,
                receiver,
                category,
                sendThrough,
            });
            return notification;
        } catch (e) {
            logger.error('Failed to create Notification');
            logger.error(e.message);
            return null;
        }
    }
    // public static async sendNotification(notification: notificationOutput) {
    //     //send with SSE
    // }
    public static async seenNotification(id: string) {
        try {
            await Notification.findOneAndUpdate({ id }, { seen: true });
        } catch (error) {
            logger.error('Failed to update Notificaton');
            logger.error(error.message);
        }
    }
    public static async getNotification(
        recieverId: string,
        limit: number = 10
    ): Promise<INotification[]> {
        const notifications = await Notification.find({
            receiver: recieverId,
            seen: false,
        })
            .sort({ createdAt: -1 })
            .limit(limit);
        for (const notification of notifications) {
            notification.seen = true;
            await notification.save();
        }
        return notifications;
    }
}

