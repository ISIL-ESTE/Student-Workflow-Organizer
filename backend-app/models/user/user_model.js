const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const Actions = require('../constants/actions');
const metaData = require('../constants/meta_data');
const { REQUIRE_ACTIVATION } = require('../config/app_config');

const userSchema = new mongoose.Schema(
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
            allowNull: true,
            minLength: 6,
            select: false,
        },
        authorities: {
            type: Array,
            default: [],
            validate: {
                validator: function (el) {
                    return el.every((action) =>
                        Object.values(Actions).includes(action)
                    );
                },
            },
            message: 'Please provide a valid action',
        },
        restrictions: {
            type: Array,
            default: [],
            validate: {
                validator: function (el) {
                    return el.every((action) =>
                        Object.values(Actions).includes(action)
                    );
                },
                message: 'Please provide a valid action',
            },
        },
        roles: {
            type: Array,
            default: [],
        },
        active: {
            type: Boolean,
            default: !REQUIRE_ACTIVATION,
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
    },
    { timestamps: true }
);

// add meta data to the schema
metaData.enableMetaData(userSchema);

userSchema.pre('save', async function (next) {
    if (
        !this.isModified('password') ||
        this.password === undefined ||
        (this.password == null && this.githubOauthAccessToken != null)
    ) {
        return next();
    }
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

userSchema.methods.correctPassword = async function (
    typedPassword,
    originalPassword
) {
    return await bcrypt.compare(typedPassword, originalPassword);
};

// verify if the user is authorized or restricted from an action
userSchema.methods.isAuthorizedTo = function (action) {
    return this.authorities.includes(action);
};
userSchema.methods.isRestrictedFrom = function (action) {
    return this.restrictions.includes(action);
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

const User = mongoose.model('User', userSchema);
module.exports = User;
