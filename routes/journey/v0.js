const express = require('express');
const asyncRoute = require('../../utils/asyncRoute');
const db = require('../../models');
const auth = require('../../middlewares/auth');
const { getWeekOfMonth } = require('../../utils/weekCalculation');
const {
  Errors,
  HttpBadRequest,
  HttpInternalServerError,
  HttpNotFound,
} = require('../../middlewares/error');

const { Journey } = db;

/**
 * 여정 생성
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<*>}
 */
const createJourney = async (req, res) => {
  const { user } = res.locals.auth;
  let { title } = req.body;
  const { value1, value2, date } = req.body;

  if (!title) throw new HttpBadRequest(Errors.JOURNEY.TITLE_MISSING);
  if (!date) throw new HttpBadRequest(Errors.JOURNEY.DATE_MISSING);
  if (!value1) throw new HttpBadRequest(Errors.JOURNEY.VALUES_MISSING);

  [value1, value2].forEach((value) => {
    if (value && !Object.values(Journey.VALUES).includes(value)) {
      throw new HttpBadRequest(Errors.JOURNEY.VALUES_INCORRECT);
    }
  });

  title = title.trim();
  const weekInfo = await getWeekOfMonth(new Date(date));

  const journeyData = {
    title,
    value1,
    value2,
    year: weekInfo.year,
    month: weekInfo.month,
    weekNo: weekInfo.weekNo,
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

/**
 * 여정 수정
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<*>}
 */
const updateJourney = async (req, res) => {
  const { user } = res.locals.auth;
  const { journeyIdx } = req.params;
  let { title } = req.body;
  const { value1, value2 } = req.body;

  [value1, value2].forEach((value) => {
    if (value && !Object.values(Journey.VALUES).includes(value)) {
      throw new HttpBadRequest(Errors.JOURNEY.VALUES_INCORRECT);
    }
  });

  if (title) {
    title = title.trim();
  }

  let journey;
  try {
    journey = await Journey.findOne({
      where: { idx: journeyIdx, userIdx: user.idx },
    });
  } catch (e) {
    throw new HttpInternalServerError(Errors.SERVER.UNEXPECTED_ERROR, e);
  }

  if (!journey) throw new HttpNotFound(Errors.JOURNEY.NOT_FOUND);

  if (title) journey.title = title;
  if (value1) journey.value1 = value1;
  if (value2) journey.value2 = value2;

  let journeyData;
  try {
    journeyData = await journey.save();
  } catch (e) {
    HttpInternalServerError(Errors.SERVER.UNEXPECTED_ERROR, e);
  }

  return res.status(201).json(journeyData);
};

const router = express.Router();

// 여정 생성
router.post('/', auth.authenticate({}), asyncRoute(createJourney));

// 여정 수정
router.patch('/:journeyIdx', auth.authenticate({}), asyncRoute(updateJourney));

module.exports = { router, createJourney, updateJourney };
