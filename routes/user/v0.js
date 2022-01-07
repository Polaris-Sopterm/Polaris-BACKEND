const express = require('express');

const {
  Errors,
  HttpBadRequest,
  HttpNotFound,
  HttpInternalServerError,
} = require('../../middlewares/error');
const db = require('../../models');
const auth = require('../../middlewares/auth');
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

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<*>}
 */
const updateUser = async (req, res) => {
  const { user: currentUser } = res.locals.auth;

  const { nickname } = req.body;

  if (nickname) {
    currentUser.nickname = nickname;
  }

  let user;
  try {
    user = await currentUser.save();
  } catch (err) {
    throw new HttpInternalServerError(Errors.SERVER.UNEXPECTED_ERROR, err);
  }

  return res
    .status(200)
    .json(user);
};

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<*>}
 */
const deleteUser = async (req, res) => {
  const { user: currentUser } = res.locals.auth;

  let user;
  try {
    user = await User.findByPk(currentUser.idx);
  } catch (err) {
    throw new HttpInternalServerError(Errors.SERVER.UNEXPECTED_ERROR, err);
  }

  if (!user) throw new HttpNotFound(Errors.USER.NOT_FOUND);

  try {
    await user.destroy();
  } catch (err) {
    throw new HttpInternalServerError(Errors.SERVER.UNEXPECTED_ERROR, err);
  }

  return res.status(200).json({
    isSuccess: true,
  });
};

const router = express.Router();

router.post('/', asyncRoute(createUser));

router.post('/checkEmail', asyncRoute(checkEmail));

router.patch('/me', auth.authenticate({}), asyncRoute(updateUser));

router.delete('/', auth.authenticate({}), asyncRoute(deleteUser));

module.exports = {
  router,
  createUser,
  checkEmail,
  updateUser,
  deleteUser,
};
