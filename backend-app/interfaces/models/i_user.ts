import { ObjectId } from 'mongoose';
import { Document } from 'mongoose';

export interface IUser extends Document {
    _id: ObjectId;
    name: string;
    email: string;
    address?: string;
    password?: string;
    authorities: string[];
    restrictions: string[];
    roles: string[];
    active: boolean;
    activationKey?: string;
    accessRestricted: boolean;
    githubOauthAccessToken?: string;
    resetKey?: string;
    createdAt: Date;
    updatedAt: Date;
    deleted: boolean;
    deletedBy?: string;
    deletedAt?: Date;
    createdBy?: string;
    updatedBy?: string;
    correctPassword(
        typedPassword: string,
        originalPassword: string
    ): Promise<boolean>;
    isAuthorizedTo(action: string[]): boolean;
    isRestrictedFrom(action: string[]): boolean;
    generateResetKey(): string;
}
