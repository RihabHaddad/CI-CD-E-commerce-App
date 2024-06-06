const request = require('supertest');
const mongoose = require('mongoose');
let server;

beforeAll(async () => {
  const app = require('../app');
  server = app.listen(3005); 
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect('mongodb://localhost:27017/testbd', { useNewUrlParser: true, useUnifiedTopology: true, serverSelectionTimeoutMS: 30000 });
  }
});

afterAll(async () => {
  await server.close();
  await mongoose.connection.close();
});

describe('GET /products', () => {
  it('should fetch all products', async () => {
    const res = await request(server).get('/products');
    expect(res.statusCode).toEqual(200);
   
    expect(res.body).toBeInstanceOf(Object);
    
  }, 20000); 
});