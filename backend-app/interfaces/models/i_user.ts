import { Document } from 'mongoose';
import Actions from '@constants/actions';

export interface IUser extends Document {
    name: string;
    email: string;
    address?: string;
    password?: string;
    authorities: Actions[];
    restrictions: Actions[];
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
    isAuthorizedTo(action: Actions): boolean;
    isRestrictedFrom(action: Actions): boolean;
    generateResetKey(): string;
}
