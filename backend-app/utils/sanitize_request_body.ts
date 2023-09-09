import { Model } from 'mongoose';

const sanitizeRequestBody = (schema: Model<any>, body: any): any => {
    const sanitizedData: any = {};

    for (const key in body) {
        // @ts-ignore
        if (schema.path(key)) {
            // @ts-ignore
            sanitizedData[key] = schema.path(key).applySetters(body[key]);
        }
    }

    return sanitizedData;
};

export default sanitizeRequestBody;
