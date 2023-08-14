const mongoose = require('mongoose');
require('dotenv').config();
// const { MONGO_URI_TEST } = require('../config/config');

beforeAll(() => {
    // check if db isn't already connected
    if (mongoose.connection.readyState === 0) {
        mongoose.set('strictQuery', false);
        mongoose.connect(process.env.MONGO_URI_TEST, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
    }
});
afterAll(async () => {
    await mongoose.disconnect();
});
