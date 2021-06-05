const env = process.env.NODE_ENV;

if (!['server', 'ci'].includes(env)) {
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET 환경변수가 설정되어 있지 않습니다.');
}

// eslint-disable-next-line camelcase
const server = {
  accessTokenSecret: '1234567890',
  accessTokenExpire: '4h',
  refreshTokenExpire: '30d',
};

const ci = {
  accessTokenSecret: '1234567890',
  accessTokenExpire: '4h',
  refreshTokenExpire: '30d',
};

const dev = {
  accessTokenSecret: process.env.JWT_SECRET,
  accessTokenExpire: '4h',
  refreshTokenExpire: '30d',
};

const production = {
  accessTokenSecret: process.env.JWT_SECRET,
  accessTokenExpire: '4h',
  refreshTokenExpire: '30d',
};

const config = {
  server,
  ci,
  dev,
  production,
};

module.exports = config;
