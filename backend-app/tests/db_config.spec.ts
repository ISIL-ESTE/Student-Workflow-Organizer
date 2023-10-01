const mongoose = require('mongoose');
const expect = require('chai').expect;
require('dotenv').config();
import createDefaultUser from '@utils/create_default_user';
import createRoles from '@utils/authorization/roles/create_roles';

before(async () => {
    mongoose.set('strictQuery', false);
    await mongoose.connect(process.env.MONGO_URI_TEST, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    await createRoles();
    await createDefaultUser();
    // const res = await request(app).post('/api/auth/signup').send({
    //     name: testUserCredentials.userName,
    //     email: testUserCredentials.userEmail,
    //     password: testUserCredentials.userPassword,
    // });
});
after(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
});

describe('Database connection', () => {
    it('should connect to the database', () => {
        expect(mongoose.connection.readyState).to.equal(1);
    });
});
