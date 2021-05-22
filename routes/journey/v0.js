const express = require('express');
const asyncRoute = require('../../utils/asyncRoute');
const db = require('../../models');
const auth = require('../../middlewares/auth');
const {
  Errors,
  HttpBadRequest,
  HttpInternalServerError,
} = require('../../middlewares/error');

const { Journey } = db;

// 해당 날짜가 월의 몇주차인지 계산
const getWeekOfMonth = (date) => {
  const firstDate = new Date(`${date.getFullYear()}/${date.getMonth() + 1}/01`);
  let monthFirstDateDay = firstDate.getDay();
  if (monthFirstDateDay === 0) monthFirstDateDay = 7;
  return Math.ceil((date.getDate() + monthFirstDateDay - 1) / 7);
};

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<*>}
 */
const createJourney = async (req, res) => {
  const { user } = res.locals.auth;
  const {
    title, value1, value2, date,
  } = req.body;

  if (!title) throw new HttpBadRequest(Errors.JOURNEY.TITLE_MISSING);
  if (!date) throw new HttpBadRequest(Errors.JOURNEY.DATE_MISSING);
  if (!value1) throw new HttpBadRequest(Errors.JOURNEY.VALUES_MISSING);

  [value1, value2].forEach((value) => {
    if (value && !Object.values(Journey.VALUES).includes(value)) {
      throw new HttpBadRequest(Errors.JOURNEY.VALUES_INCORRECT);
    }
  });

  const weekInfo = getWeekOfMonth(new Date(date));

  const journeyData = {
    title,
    value1,
    value2,
    weekInfo,
    date,
    userIdx: user.idx,
  };

  let journeyResult;
  try {
    journeyResult = await Journey.create(journeyData);
  } catch (e) {
    throw new HttpInternalServerError(Errors.SERVER.UNEXPECTED_ERROR, e);
  }

  return res.status(201).json(journeyResult);
};

const router = express.Router();

router.post('/', auth.authenticate({}), asyncRoute(createJourney));

module.exports = { router, createJourney };
