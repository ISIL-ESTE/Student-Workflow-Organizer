import { IReq } from '@root/interfaces/vendors';
import { expressAuthentication } from '@root/middlewares/authentications';
import TaskEmitter from '@root/utils/TaskEmitter';
import { NextFunction, Response } from 'express';

export default [
    async (req: IReq, res: Response, next: NextFunction) => {
        try {
            await expressAuthentication(req, 'jwt');
            next();
        } catch (err) {
            res.json(err.message);
        }
    },
    (req: IReq, res: Response) => {
        TaskEmitter.registerClient(req, res);
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Content-Encoding': 'none',
            Connection: 'keep-alive',
        });
        TaskEmitter.listenIncomingNotification();
        res.on('close', () => {
            TaskEmitter.removeConnectedClient(String(req.user._id));
            res.end();
        });
    },
];
