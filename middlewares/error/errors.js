const errors = {
  AUTH: {
    NOT_LOGGED_IN: {
      code: 1,
      message: '로그인하지 않았습니다.',
    },
    LOGIN_INFO_INCORRECT: {
      code: 13,
      message: '로그인 정보가 잘못되었습니다.',
    },
    REFRESH_TOKEN_NOT_FOUND: {
      code: 14,
      message: '재발급 토큰이 없습니다.',
    },
    ACCESS_TOKEN_EXPIRED: {
      code: 21,
      message: '액세스 토큰이 만료되었습니다.',
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
    DEFAULT_CANNOT_UPDATE: {
      code: 20,
      message: '기본 여정은 제목을 수정할 수 없습니다.',
    },
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
    NOT_FOUND: {
      code: 12,
      message: '해당 여정이 존재하지 않습니다.',
    },
  },
  TODO: {
    DATE_MISSING: {
      code: 17,
      message: '날짜가 없습니다.',
    },
    INCORRECT_WEEK_NO: {
      code: 18,
      message: '여정과 할 일 날짜의 주차 정보가 일치하지 않습니다',
    },
    IS_TOP_MISSING: {
      code: 16,
      message: '할 일 상단 여부가 없습니다.',
    },
    JOURNEY_IDX_MISSING: {
      code: 19,
      message: '여정 인덱스가 없습니다.',
    },
    TITLE_MISSING: {
      code: 15,
      message: '할 일 제목이 없습니다.',
    },
  },
};

module.exports = errors;
