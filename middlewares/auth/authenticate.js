const env = process.env.NODE_ENV;

const jwt = require('jsonwebtoken');

const actions = require('./action');
const { extractToken } = require('./token');
const {
  Errors,
  HttpNotFound,
  HttpInternalServerError,
  HttpUnauthorized,
} = require('../error');
const AuthConfig = require('../../config/auth')[env];
const db = require('../../models');
const asyncRoute = require('../../utils/asyncRoute');

const { User } = db;

/**
 * @param {{[onAuthenticated]: function, [onNotAuthenticated]: function}} options
 * @returns {function(...[*]=)}
 */
const authenticate = (options) => {
  let { onAuthenticated, onNotAuthenticated } = options;

  if (!onAuthenticated) onAuthenticated = actions.callNext;
  if (!onNotAuthenticated) onNotAuthenticated = actions.returnUnauthorized;

  const fnc = async (req, res, next) => {
    const token = extractToken(req);
    if (!token) {
      res.locals.auth = {};
      return onNotAuthenticated(req, res, next);
    }

    // Verify token if it is valid.
    let tokenData;
    try {
      tokenData = jwt.verify(token, AuthConfig.accessTokenSecret);
    } catch (e) {
      res.locals.auth = {};
      throw new HttpUnauthorized(Errors.AUTH.ACCESS_TOKEN_EXPIRED);
    }

    let user;
    try {
      user = await User.findByPk(tokenData.userIdx);
    } catch (e) {
      throw new HttpInternalServerError(Errors.SERVER.UNEXPECTED_ERROR, e);
    }

    if (!user) throw new HttpNotFound(Errors.USER.NOT_FOUND);

    res.locals.auth = {
      tokenData,
      user,
    };
    return onAuthenticated(req, res, next);
  };

  return asyncRoute(fnc);
};

module.exports = authenticate;
