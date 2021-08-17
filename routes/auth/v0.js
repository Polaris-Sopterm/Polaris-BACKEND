const env = process.env.NODE_ENV;

const express = require('express');
const moment = require('moment');
const ms = require('ms');

const authConfig = require('../../config/auth')[env];
const auth = require('../../middlewares/auth');
const {
  Errors,
  HttpBadRequest,
  HttpNotFound,
  HttpInternalServerError,
} = require('../../middlewares/error');
const db = require('../../models');
const asyncRoute = require('../../utils/asyncRoute');

const { RefreshToken, User } = db;

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<*>}
 */
const emailLogin = async (req, res) => {
  const { email, password } = req.body;

  if (!email) throw new HttpBadRequest(Errors.USER.EMAIL_MISSING);
  if (!password) throw new HttpBadRequest(Errors.USER.PASSWORD_MISSING);

  let user;
  try {
    user = await User.findOne({
      where: {
        email,
      },
    });
  } catch (e) {
    throw new HttpInternalServerError(Errors.SERVER.UNEXPECTED_ERROR, e);
  }

  if (user === null || !user.validatePasswordHash(password)) {
    throw new HttpBadRequest(Errors.AUTH.LOGIN_INFO_INCORRECT);
  }

  let refreshToken;
  try {
    const queryData = {
      refreshToken: auth.tokens.generateRefreshToken(),
      userIdx: user.idx,
      expiresAt: moment().add(ms(authConfig.refreshTokenExpire), 'milliseconds')
        .format('YYYY-MM-DD hh:mm:ss'),
    };
    refreshToken = await RefreshToken.create(queryData);
  } catch (e) {
    throw new HttpInternalServerError(Errors.SERVER.UNEXPECTED_ERROR, e);
  }

  let accessToken;
  try {
    const accessTokenData = {
      userIdx: user.idx,
      refreshTokenIdx: refreshToken.id,
    };
    accessToken = auth.tokens.generateAccessToken(accessTokenData);
  } catch (e) {
    await refreshToken.destroy();
    throw new HttpInternalServerError(Errors.SERVER.UNEXPECTED_ERROR, e);
  }

  const resBody = {
    accessToken,
    refreshToken: refreshToken.refreshToken,
  };

  return res
    .status(201)
    .json(resBody);
};

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<*>}
 */
const logout = async (req, res) => {
  const { tokenData } = res.locals.auth;
  let refreshToken;
  try {
    refreshToken = await RefreshToken.findByPk(tokenData.refreshTokenIdx);
  } catch (e) {
    throw new HttpInternalServerError(Errors.SERVER.UNEXPECTED_ERROR, e);
  }

  if (!refreshToken) throw new HttpNotFound(Errors.AUTH.REFRESH_TOKEN_NOT_FOUND);

  try {
    await refreshToken.destroy();
  } catch (e) {
    throw new HttpInternalServerError(Errors.SERVER.UNEXPECTED_ERROR, e);
  }

  return res.status(200).json({
    isSuccess: true,
  });
};

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<*>}
 */
const refreshLogin = async (req, res) => {
  const { refreshToken: refreshTokenValue } = req.body;
  if (!refreshTokenValue) throw new HttpBadRequest(Errors.AUTH.REFRESH_TOKEN_MISSING);

  let refreshToken;
  try {
    refreshToken = await RefreshToken.findOne({
      where: {
        refreshToken: refreshTokenValue,
        expiresAt: {
          [db.Sequelize.Op.gte]: moment(),
        },
      },
    });
  } catch (e) {
    throw new HttpInternalServerError(Errors.SERVER.UNEXPECTED_ERROR, e);
  }

  if (!refreshToken) throw new HttpNotFound(Errors.AUTH.REFRESH_TOKEN_NOT_FOUND);

  let accessToken;
  try {
    const accessTokenData = {
      userIdx: refreshToken.userIdx,
      refreshTokenIdx: refreshToken.id,
    };
    accessToken = auth.tokens.generateAccessToken(accessTokenData);
  } catch (e) {
    throw new HttpInternalServerError(Errors.SERVER.UNEXPECTED_ERROR, e);
  }

  try {
    refreshToken.refreshToken = auth.tokens.generateRefreshToken();
    refreshToken.expiresAt = moment().add(ms(authConfig.refreshTokenExpire), 'milliseconds')
      .format('YYYY-MM-DD hh:mm:ss');
    await refreshToken.save();
  } catch (e) {
    throw new HttpInternalServerError(Errors.SERVER.UNEXPECTED_ERROR, e);
  }

  const resBody = {
    accessToken,
    refreshToken: refreshToken.refreshToken,
  };

  return res
    .status(200)
    .json(resBody);
};

const router = express.Router();

router.post('/', asyncRoute(emailLogin));

router.put('/', asyncRoute(refreshLogin));

router.delete('/', auth.authenticate({}), asyncRoute(logout));

module.exports = {
  router,
  emailLogin,
  refreshLogin,
  logout,
};
