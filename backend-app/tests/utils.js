const request = require('supertest');

createUser = async (app, name, email, password) => {
    const res = await request(app).post('/api/auth/signup').send({
        name,
        email,
        password,
    });
    return res;
};

loginUser = async (app, email, password) => {
    const res = await request(app).post('/api/auth/login').send({
        email,
        password,
    });
    return res;
};

deleteUser = async (app, email, password) => {
    // login user
    const res = await loginUser(app, email, password);
    const accessToken = res.body.accessToken;
    // delete user
    const res2 = await request(app)
        .delete('/api/users/me')
        .set('Authorization', `Bearer ${accessToken}`);

    return res2;
};
module.exports = {
    createUser,
    loginUser,
    deleteUser,
};
