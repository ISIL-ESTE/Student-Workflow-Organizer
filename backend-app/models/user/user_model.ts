import mongoose, { Model, Schema } from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcrypt';
import Actions from '@constants/actions';
import metaData from '@constants/meta_data';
import { randomBytes, createHash } from 'crypto';
import { IUser } from '@interfaces/models/i_user';

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
userSchema.methods.isAuthorizedTo = function (actions: string[]) {
    return actions.every((action) => this.authorities.includes(action));
};

userSchema.methods.isRestrictedFrom = function (actions: string[]) {
    return actions.some((action) => this.restrictions.includes(action));
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
    this.where({ deleted: false });
});

userSchema.pre('findOne', function () {
    this.where({ deleted: false });
});

const User: Model<IUser> = mongoose.model<IUser>('User', userSchema);
export default User;
