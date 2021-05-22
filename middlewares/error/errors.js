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
  USER: {
    EMAIL_ALREADY_EXIST: {
      code: 7,
      message: '이미 존재하는 이메일 입니다.',
    },
    EMAIL_MISSING: {
      code: 4,
      message: '이메일이 없습니다.',
    },
    NAME_MISSING: {
      code: 5,
      message: '이름이 없습니다.',
    },
    NOT_FOUND: {
      code: 3,
      message: '사용자를 찾을 수 없습니다.',
    },
    PASSWORD_MISSING: {
      code: 6,
      message: '비밀번호가 없습니다.',
    },
  },
  JOURNEY: {
    TITLE_MISSING: {
      code: 8,
      message: '여정 제목이 없습니다.',
    },
    DATE_MISSING: {
      code: 9,
      message: '날짜가 없습니다.',
    },
    VALUES_MISSING: {
      code: 10,
      message: '가치가 없습니다.',
    },
    VALUES_INCORRECT: {
      code: 11,
      message: '존재하지 않는 가치입니다.',
    },
  },
};

module.exports = errors;
