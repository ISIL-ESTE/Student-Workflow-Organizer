import { IReq } from '@root/interfaces/vendors';
import { EventEmitter } from 'events';
import { Response } from 'express';
import NotificationHandler, {
    NotificationInput,
} from './notification/notification';
import {
    INotification,
    SendThrough,
} from '@root/models/notifications/notification_model';
import Logger from '@utils/logger';

class TaskEmitter extends EventEmitter {
    public connectedClients: Map<string, Response> = new Map();
    constructor() {
        super();
    }

    public emitEvent<T>(event: string, data?: T): void {
        this.emit(event, data);
    }
    public registerClient(req: IReq, res: Response): void {
        let userId = String(req.user._id);
        if (this.connectedClients.has(userId)) {
            this.connectedClients.delete(userId);
            this.connectedClients.set(userId, res);
        } else {
            this.connectedClients.set(userId, res);
        }
    }
    public listenIncomingNotification(): void {
        this.on('live-notification', (notification: INotification) => {
            if (this.connectedClients.has(notification.receiver.toString())) {
                const resObj = this.connectedClients.get(
                    notification.receiver.toString()
                );
                const jsonNotificationString = JSON.stringify(notification);
                resObj.write(`data: ${jsonNotificationString}\n\n`);
            }
        });
    }
    public async emitNotification(
        payload: Omit<NotificationInput, 'sendThrough'>
    ): Promise<void> {
        try {
            if (payload.sender.toString() === payload.receiver.toString())
                return;
            const notificationInstance =
                await NotificationHandler.createNotification({
                    ...payload,
                    sendThrough: SendThrough.Notification,
                });
            this.emitEvent('live-notification', notificationInstance);
        } catch (err) {
            Logger.error('Failed to send Notification.');
            Logger.error(err);
        }
    }
    public removeConnectedClient(userId: string) {
        this.connectedClients.delete(userId);
    }
}

export default new TaskEmitter();
