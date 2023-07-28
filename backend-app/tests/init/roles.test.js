// do import and then create test to see if user can update roles
require('dotenv').config();
require('../../utils/logger');
const app = require('../../app');
const createRoles = require('../../utils/authorization/role/create_roles');
const createDefaultUser = require('../../utils/create_default_user');
const request = require('supertest');
const mongoose = require('mongoose');




describe('Role tests', () => {
    it('should create roles', async () => {
        await createRoles();
    }
    )
    it('should create default user', async () => {
        await createDefaultUser();
    })
})
