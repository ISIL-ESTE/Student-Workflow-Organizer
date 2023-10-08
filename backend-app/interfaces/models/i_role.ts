import { Document } from 'mongoose';

export interface IRole extends Document {
    name: string;
    authorities: string[];
    restrictions: string[];
    deleted: boolean;
    deletedBy?: string;
    deletedAt?: Date;
    createdBy?: string;
    updatedBy?: string;
}
