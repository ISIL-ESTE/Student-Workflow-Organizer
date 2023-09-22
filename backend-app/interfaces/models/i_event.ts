import { Document } from 'mongoose';

export interface IEvent extends Document {
    name: string;
    description?: string;
    location?: string;
    startDate: Date;
    endDate: Date;
    startTime: string;
    endTime: string;
    color: string;
    recurring?: boolean;
    recurringType?: 'Daily' | 'Weekly' | 'Monthly' | 'Yearly';
    recurringEndDate?: Date;
    reminder?: Date;
    deleted: boolean;
    deletedBy?: string;
    deletedAt?: Date;
    createdBy?: string;
    updatedBy?: string;
}
