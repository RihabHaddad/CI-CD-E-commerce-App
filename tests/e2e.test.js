const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app'); 
let server;

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect('mongodb://localhost:27017/testbd', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 60000
    });
  }
  
  server = app.listen(5000);
});

afterAll(async () => {
  await server.close();
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
});

describe('End-to-End Test', () => {
  it('should load the home page', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toEqual(200);
    expect(res.text).toContain('BestBags');
  });
});
