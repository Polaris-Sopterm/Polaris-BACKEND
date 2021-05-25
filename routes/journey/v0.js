const express = require('express');
const asyncRoute = require('../../utils/asyncRoute');
const db = require('../../models');
const auth = require('../../middlewares/auth');
const {
  Errors,
  HttpBadRequest,
  HttpInternalServerError,
  HttpNotFound,
} = require('../../middlewares/error');

const { Journey } = db;

// 해당 날짜가 월의 몇주차인지 계산
const getWeekOfMonth = (journeyDate) => {
  const year = journeyDate.getFullYear();
  const month = journeyDate.getMonth() + 1;
  const date = journeyDate.getDate();

  const firstDate = new Date(year, month - 1, 1);
  const lastDate = new Date(year, month, 0);

  // 월:1, 화:2, ..., 일:7
  const firstDateDay = firstDate.getDay() === 0 ? 7 : firstDate.getDay();

  // 월의 마지막 날이 포함된 주가 목요일을 포함하지 않아 다음 달의 첫째 주가 되는 경우
  if (lastDate.getDay() < 4 && date > lastDate.getDate() - lastDate.getDay()) {
    return { year, month: month + 1, weekNo: 1 };
  }

  // 1일이 목요일 이후인 경우
  if (firstDateDay > 4) {
    // journeyDate의 날짜가 1일을 포함한 주의 마지막 날짜보다 큰 경우
    if (date > 7 - firstDateDay + 1) {
      return {
        year,
        month,
        weekNo: Math.ceil((date + firstDateDay - 1) / 7) - 1,
      };
    }

    // 해당 경우에서 1일을 포함한 주는 전 월의 마지막 주에 해당된다.
    return month === 1
      ? getWeekOfMonth(new Date(year - 1, 11, 31))
      : getWeekOfMonth(new Date(year, month - 1, 0));
  }

  // 1일이 목요일 이전인 경우
  return { year, month, weekNo: Math.ceil((date + firstDateDay - 1) / 7) };
};

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
  const weekInfo = getWeekOfMonth(new Date(date));

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
