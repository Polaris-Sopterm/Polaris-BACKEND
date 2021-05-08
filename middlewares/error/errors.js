const errors = {
  AUTH: {
    NOT_LOGGED_IN: {
      code: 1,
      message: '로그인하지 않았습니다.',
    },
  },
  SERVER: {
    UNEXPECTED_ERROR: {
      code: 2,
      message: '예기치 못한 서버 오류가 발생했습니다.',
    },
  },
};

module.exports = errors;
