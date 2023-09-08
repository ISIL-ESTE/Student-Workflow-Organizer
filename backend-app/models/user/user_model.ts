import mongoose, { Document, Model, Schema } from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcrypt';
import Actions from '../../constants/actions';
import metaData from '../../constants/meta_data';
import { randomBytes, createHash } from 'crypto';

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

const userSchema: Schema = new mongoose.Schema<IUser>(
    {
        name: {
            type: String,
            required: [true, 'Please fill your name'],
        },
        email: {
            type: String,
            required: [true, 'Please fill your email'],
            lowercase: true,
            validate: [validator.isEmail, ' Please provide a valid email'],
        },
        address: {
            type: String,
            trim: true,
        },
        password: {
            type: String,
            minLength: 6,
            select: false,
        },
        authorities: {
            type: [String],
            default: [],
            validate: {
                validator: function (el: string[]) {
                    return el.every((action) =>
                        // @ts-ignore
                        Object.values(Actions).includes(action)
                    );
                },
            },
            message: 'Please provide a valid action',
        },
        restrictions: {
            type: [String],
            default: [],
            validate: {
                validator: function (el: string[]) {
                    return el.every((action) =>
                        // @ts-ignore
                        Object.values(Actions).includes(action)
                    );
                },
                message: 'Please provide a valid action',
            },
        },
        roles: {
            type: [String],
            default: [],
        },
        active: {
            type: Boolean,
            default: true,
        },
        activationKey: {
            type: String,
            select: false,
        },
        accessRestricted: {
            type: Boolean,
            default: false,
        },
        githubOauthAccessToken: {
            type: String,
            select: false,
            default: null,
        },
        resetKey: {
            type: String,
            select: false,
        },
    },
    { timestamps: true }
);

// add meta data to the schema
metaData.apply(userSchema);

userSchema.pre<IUser>('save', async function (next) {
    if (
        !this.isModified('password') ||
        this.password === undefined ||
        (this.password === null && this.githubOauthAccessToken !== null)
    ) {
        return next();
    }
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

userSchema.methods.correctPassword = async function (
    typedPassword: string,
    originalPassword: string
) {
    const isTrue = await bcrypt.compare(typedPassword, originalPassword);
    return isTrue;
};

// verify if the user is authorized or restricted from an action
userSchema.methods.isAuthorizedTo = function (action: Actions) {
    return this.authorities.includes(action);
};
userSchema.methods.isRestrictedFrom = function (action: Actions) {
    return this.restrictions.includes(action);
};

// generateResetKey
userSchema.methods.generateResetKey = function () {
    const resetKey = randomBytes(32).toString('hex');
    this.resetKey = createHash('sha256').update(resetKey).digest('hex');
    return resetKey;
};

userSchema.index(
    { email: 1 },
    { unique: true, partialFilterExpression: { deleted: false } }
);

userSchema.pre('find', function () {
    // @ts-ignore
    this.where({ deleted: false });
});

userSchema.pre('findOne', function () {
    // @ts-ignore
    this.where({ deleted: false });
});

const User: Model<IUser> = mongoose.model<IUser>('User', userSchema);
export default User;
