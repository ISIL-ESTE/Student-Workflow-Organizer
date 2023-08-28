const mongoose = require('mongoose');
async function globalTeardown() {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
}

module.exports = globalTeardown;
