const mongoose = require('mongoose');
async function globalTeardown() {
    // check if db isn't already connected
    while (mongoose.connection.readyState > 0) {
        await mongoose.connection.close();
    }

    // if (mongoose.connection.readyState === 0) {
    mongoose.set('strictQuery', false);
    mongoose.connect(process.env.MONGO_URI_TEST, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    mongoose.connection.on('error', (err) => {
        throw err;
    });
    mongoose.connection.on('connected', () => {
        mongoose.connection.dropDatabase();
        mongoose.disconnect();
        console.log('Global teardown done');
    });
}

module.exports = globalTeardown;
