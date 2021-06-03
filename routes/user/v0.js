const express = require('express');
const moment = require('moment');

const {
  Errors,
  HttpBadRequest,
  HttpInternalServerError,
} = require('../../middlewares/error');
const { getRandomValue } = require('../../utils/random');
const { getWeekOfMonth } = require('../../utils/weekCalculation');
const db = require('../../models');
const { createToken } = require('../../utils/token');

const asyncRoute = require('../../utils/asyncRoute');

const { Journey, Token, User } = db;

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

  const transaction = await db.sequelize.transaction();
  let user;
  try {
    user = await User.create(userData, { transaction });
  } catch (e) {
    throw new HttpInternalServerError(Errors.SERVER.UNEXPECTED_ERROR, e);
  }

  const date = moment();
  const weekInfo = await getWeekOfMonth(new Date(date));
  const value1 = await getRandomValue(Object.values(Journey.VALUES));
  const value2 = await getRandomValue(Object.values(Journey.VALUES), value1);

  const journeyData = {
    title: 'default',
    value1,
    value2,
    year: weekInfo.year,
    month: weekInfo.month,
    weekNo: weekInfo.weekNo,
    date,
    userIdx: user.idx,
  };

  try {
    await Journey.create(journeyData, { transaction });
    await transaction.commit();
  } catch (err) {
    await transaction?.rollback();
    throw new HttpInternalServerError(Errors.SERVER.UNEXPECTED_ERROR, err);
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
