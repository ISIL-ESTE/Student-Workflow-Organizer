const mongoose = require('mongoose');
require('dotenv').config();

beforeAll(() => {
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
afterAll(async () => {
    await mongoose.disconnect();
});
