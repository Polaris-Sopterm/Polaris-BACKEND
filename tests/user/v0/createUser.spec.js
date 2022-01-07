/* eslint-disable func-names */

require('moment');
const httpMocks = require('node-mocks-http');
const should = require('should');

const { truncateAllTables } = require('../../common');
const userRouter = require('../../../routes/user');

const {
  Errors,
  HttpBadRequest,
} = require('../../../middlewares/error');

const method = 'POST';
const url = '/user/v0';

describe(`user.v0.createUser ${method} ${url}`, function () {
  before(async function () {
    await truncateAllTables();
  });

  it('[guest] 정상적인 회원가입을 요청한 경우 201', async function () {
    const request = httpMocks.createRequest({
      method,
      url,
      body: {
        email: 'adaf@email.com',
        password: 'p@ssw@ord',
        nickname: 'adaf',
      },
    });
    const response = httpMocks.createResponse({});

    let error;
    try {
      await userRouter.v0.createUser(request, response);
    } catch (e) {
      error = e;
    }

    should.equal(error, undefined);

    response.statusCode.should.equal(201);

    // eslint-disable-next-line no-underscore-dangle
    const userData = response._getJSONData();

    userData.should.have.properties('idx', 'nickname', 'email', 'createdAt', 'updatedAt');

    userData.idx.should.be.a.Number();
    userData.nickname.should.be.a.String();
    userData.email.should.be.a.String();
    userData.createdAt.should.be.a.String();
    userData.updatedAt.should.be.a.String();
  });

  it('[guest] 아미 존재하는 회원인 경우 400', async function () {
    const request = httpMocks.createRequest({
      method,
      url,
      body: {
        email: 'adaf@email.com',
        password: 'p@ssw@ord',
        nickname: 'adaf',
      },
    });
    const response = httpMocks.createResponse({});

    let error;
    try {
      await userRouter.v0.createUser(request, response);
    } catch (e) {
      error = e;
    }

    error.should.instanceof(HttpBadRequest);
    error.data.should.deepEqual(Errors.USER.EMAIL_ALREADY_EXIST);
  });

  it('[guest] 이메일이 존재하지 않는 경우 400', async function () {
    const request = httpMocks.createRequest({
      method,
      url,
      body: {
        password: 'p@ssw@ord',
        nickname: 'adaf',
      },
    });
    const response = httpMocks.createResponse({});

    let error;
    try {
      await userRouter.v0.createUser(request, response);
    } catch (e) {
      error = e;
    }

    error.should.instanceof(HttpBadRequest);
    error.data.should.deepEqual(Errors.USER.EMAIL_MISSING);
  });

  it('[guest] 닉네임이 없는 경우 400', async function () {
    const request = httpMocks.createRequest({
      method,
      url,
      body: {
        email: 'adaf@email.com',
        password: 'p@ssw@ord',
      },
    });
    const response = httpMocks.createResponse({});

    let error;
    try {
      await userRouter.v0.createUser(request, response);
    } catch (e) {
      error = e;
    }

    error.should.instanceof(HttpBadRequest);
    error.data.should.deepEqual(Errors.USER.NAME_MISSING);
  });

  it('[guest] 비밀번호가 없는 경우 400', async function () {
    const request = httpMocks.createRequest({
      method,
      url,
      body: {
        email: 'adaf@email.com',
        nickname: 'adaf',
      },
    });
    const response = httpMocks.createResponse({});

    let error;
    try {
      await userRouter.v0.createUser(request, response);
    } catch (e) {
      error = e;
    }

    error.should.instanceof(HttpBadRequest);
    error.data.should.deepEqual(Errors.USER.PASSWORD_MISSING);
  });
});
