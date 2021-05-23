const express = require('express');

const {
  Errors,
  HttpBadRequest,
  HttpInternalServerError,
} = require('../../middlewares/error');
const db = require('../../models');
const { createToken } = require('../../utils/token');

const asyncRoute = require('../../utils/asyncRoute');

const { Token, User } = db;

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<*>}
 */
const createUser = async (req, res) => {
  const { email, nickname, password } = req.body;

  if (!email) throw new HttpBadRequest(Errors.USER.EMAIL_MISSING);
  if (!nickname) throw new HttpBadRequest(Errors.USER.NAME_MISSING);
  if (!password) throw new HttpBadRequest(Errors.USER.PASSWORD_MISSING);

  {
    let existingUser;
    try {
      existingUser = await User.findOne({
        attributes: ['idx'],
        where: {
          email,
        },
      });
    } catch (e) {
      throw new HttpInternalServerError(Errors.SERVER.UNEXPECTED_ERROR, e);
    }
    if (existingUser) throw new HttpBadRequest(Errors.USER.EMAIL_ALREADY_EXIST);
  }

  const userData = {
    email,
    nickname,
    password,
  };

  let user;
  try {
    user = await User.create(userData);
  } catch (e) {
    throw new HttpInternalServerError(Errors.SERVER.UNEXPECTED_ERROR, e);
  }

  try {
    await createToken(user, {
      action: Token.ACTION.VALIDATE_LOGIN_EMAIL,
    });
  } catch (e) {
    // do nothing
  }

  delete user.dataValues.password;

  return res.status(201).json(user);
};

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<*>}
 */
const checkEmail = async (req, res) => {
  const { email } = req.body;

  if (!email) throw new HttpBadRequest(Errors.USER.EMAIL_MISSING);

  {
    let existingUser;
    try {
      existingUser = await User.findOne({
        attributes: ['idx'],
        where: {
          email,
        },
      });
    } catch (e) {
      throw new HttpInternalServerError(Errors.SERVER.UNEXPECTED_ERROR, e);
    }
    if (existingUser) throw new HttpBadRequest(Errors.USER.EMAIL_ALREADY_EXIST);
  }

  const resData = {
    email,
    isDuplicated: false,
  };

  return res.status(201).json(resData);
};

const router = express.Router();

router.post('/', asyncRoute(createUser));

router.post('/checkEmail', asyncRoute(checkEmail));

module.exports = {
  router,
  createUser,
  checkEmail,
};
