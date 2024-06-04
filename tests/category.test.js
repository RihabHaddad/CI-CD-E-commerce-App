const request = require('supertest');
const mongoose = require('mongoose');
let server;

beforeAll(async () => {
  const app = require('../app');
  server = app.listen(3004); 
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect('mongodb://localhost:27017/testdbb', { useNewUrlParser: true, useUnifiedTopology: true });
  }
});

afterAll(async () => {
  await server.close();
  await mongoose.connection.close();
});

describe('GET /', () => {
  it('should return 200 OK', async () => {
    const res = await request(server).get('/');
    expect(res.statusCode).toEqual(200);
  }, 20000); 
});