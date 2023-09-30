const mongoose = require('mongoose');
const { describe } = require('node:test');
require('dotenv').config();

before(() => {
    // check if db isn't already connected
    if (mongoose.connection.readyState === 0) {
        mongoose.set('strictQuery', false);
        mongoose.connect(process.env.MONGO_URI_TEST, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
    }
    // const res = await request(app).post('/api/auth/signup').send({
    //     name: testUserCredentials.userName,
    //     email: testUserCredentials.userEmail,
    //     password: testUserCredentials.userPassword,
    // });
});
after(async () => {
    await mongoose.disconnect();
});

describe('Database connection', () => {
    it('should connect to the database', () => {
        expect(mongoose.connection.readyState).to.equal(1);
    });
});
