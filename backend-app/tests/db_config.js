const mongoose = require('mongoose');

beforeAll(() => {
    // check if db isn't already connected
    if (mongoose.connection.readyState >= 1) {
        return;
    }
    mongoose.set('strictQuery', false);
    mongoose.connect(process.env.MONGO_URI_TEST, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    mongoose.connection.on('error', (err) => {
        throw err;
    });
});
afterAll(async () => {
    await mongoose.disconnect();
});
