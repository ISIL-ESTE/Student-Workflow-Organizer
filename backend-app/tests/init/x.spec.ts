import { describe, it } from 'mocha';
import { expect } from 'chai';
import supertest from 'supertest';
import app from '@root/app';
import { API_VERSION } from '@config/app_config';

const agent = supertest.agent(app);

describe('handleAPIVersion middleware', () => {
    it('should set default API version if not provided', async () => {
        const res = await agent.get('/api/public');
        expect(res.status).to.equal(200);
        expect(res.header['api-version']).to.equal(API_VERSION);
    });
    it('should validate the API version and throw an error if invalid', async () => {
        const res = await agent
            .post('/api/public')
            .set('api-version', 'invalid');
        expect(res.status).to.equal(400);
        expect(res.body).to.have.property('message', 'Invalid API version');
    });

    it('should pass control to the next middleware if API version is the latest', async () => {
        const res = await agent.get('/api/public').set('api-version', API_VERSION);
        expect(res.status).to.equal(200);
    });

    it('should return a 400 error if the API version is greater than the latest version', async () => {
        // get greater version
        const g_version = `v${parseInt(API_VERSION.split('v')[1]) + 1}`;
        const res = await agent
            .get('/api/public')
            .set('api-version', g_version);
        expect(res.status).to.equal(400);
        expect(res.body).to.have.property('message', 'Invalid API version');
    });

});
