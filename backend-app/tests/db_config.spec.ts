const mongoose = require('mongoose');
const expect = require('chai').expect;
import '@config/app_config';
import createDefaultUser from '@utils/create_default_user';
import createRoles from '@utils/authorization/roles/create_roles';
// import logger from '@root/utils/logger';

before(async () => {
    mongoose.set('strictQuery', false);
    await mongoose.connect(process.env.MONGO_URI_TEST, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    await createRoles();
    await createDefaultUser();
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
