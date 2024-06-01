const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app');

chai.use(chaiHttp);
const expect = chai.expect;

describe('Routes', () => {
  it('should return 200 OK status for GET /', done => {
    chai.request(app)
      .get('/')
      .end((err, res) => {
        expect(res).to.have.status(200);
        done();
      });
  });

  it('should return 404 Not Found for GET /nonexistent', done => {
    chai.request(app)
      .get('/nonexistent')
      .end((err, res) => {
        expect(res).to.have.status(404);
        done();
      });
  });
});
