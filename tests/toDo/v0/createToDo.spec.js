/* eslint-disable func-names */

const moment = require('moment');
const httpMocks = require('node-mocks-http');
const should = require('should');

const { createEmailUser } = require('../../common');
const toDoRouter = require('../../../routes/toDo');
const { truncateAllTables } = require('../../../utils/db');

const method = 'POST';
const url = '/toDo/v0';

describe(`toDo.v0.createToDo ${method} ${url}`, function () {
  let user;

  before(async function () {
    await truncateAllTables();

    user = await createEmailUser();
  });

  it('[user] 날짜별 할 일 생성 시 "선택없음" 을 선택했을 때', async function () {
    const request = httpMocks.createRequest({
      method,
      url,
      body: {
        date: moment(),
        journeyTitle: 'default',
        isTop: false,
        title: '오늘 할 일',
      },
    });
    const response = httpMocks.createResponse({
      locals: {
        auth: {
          user,
        },
      },
    });

    let error;
    try {
      await toDoRouter.v0.createToDo(request, response);
    } catch (err) {
      error = err;
    }

    should.equal(error, undefined);

    response.statusCode.should.equal(201);
  });

  // TODO: 테스트 케이스 추가 예정
});
