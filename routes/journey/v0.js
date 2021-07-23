const express = require('express');
const moment = require('moment');
const asyncRoute = require('../../utils/asyncRoute');
const db = require('../../models');
const auth = require('../../middlewares/auth');
const { getWeekOfMonth } = require('../../utils/weekCalculation');
const { getRandomValue } = require('../../utils/random');
const {
  Errors,
  HttpBadRequest,
  HttpInternalServerError,
  HttpNotFound,
} = require('../../middlewares/error');

const { Journey, ToDo } = db;

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

  return res.status(201).json({
    idx: journeyResult.idx,
    title: journeyResult.title,
    value1: journeyResult.value1,
    value2: journeyResult.value2,
  });
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

  let journey;
  try {
    journey = await Journey.findOne({
      where: { idx: journeyIdx, userIdx: user.idx },
    });
  } catch (e) {
    throw new HttpInternalServerError(Errors.SERVER.UNEXPECTED_ERROR, e);
  }

  if (!journey) throw new HttpNotFound(Errors.JOURNEY.NOT_FOUND);

  if (journey.title === 'default' && title) {
    throw new HttpBadRequest(Errors.JOURNEY.DEFAULT_CANNOT_UPDATE);
  }

  if (title) {
    title = title.trim();
  }

  if (title) journey.title = title;
  if (value1) journey.value1 = value1;
  if (value2) journey.value2 = value2;

  let journeyData;
  try {
    journeyData = await journey.save();
  } catch (e) {
    HttpInternalServerError(Errors.SERVER.UNEXPECTED_ERROR, e);
  }

  return res.status(201).json({
    idx: journeyData.idx,
    title: journeyData.title,
    value1: journeyData.value1,
    value2: journeyData.value2,
  });
};

/**
 * 여정 제목 목록 조회
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<*>}
 */
const getJourneyTitleList = async (req, res) => {
  const { user } = res.locals.auth;
  const { date } = req.query;

  if (!date) throw new HttpBadRequest(Errors.TODO.DATE_MISSING);

  const weekInfo = await getWeekOfMonth(new Date(date));

  let journeys;
  try {
    journeys = await Journey.findAll({
      attributes: ['idx', 'title', 'year', 'month', 'weekNo', 'userIdx'],
      where: {
        year: weekInfo.year,
        month: weekInfo.month,
        weekNo: weekInfo.weekNo,
        userIdx: user.idx,
      },
    });
  } catch (e) {
    throw new HttpInternalServerError(Errors.SERVER.UNEXPECTED_ERROR, e);
  }

  return res.status(200).json(journeys);
};

/**
 * 여정 목록 조회
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<*>}
 */
const getJourneyList = async (req, res) => {
  const { user } = res.locals.auth;
  const {
    date, year, month, weekNo,
  } = req.query;

  if (!(date || (year && month && weekNo))) {
    throw new HttpBadRequest(Errors.JOURNEY.DATE_MISSING);
  }

  // 주차 리스트 생성 (사용자 가입 전 주 ~ 현재 기준 다다음주)
  const joinedWeek = moment(user.createdAt).subtract(7, 'days');
  const joinedWeekInfo = getWeekOfMonth(new Date(joinedWeek));
  const todayWeekInfo = getWeekOfMonth(new Date());

  const weekList = [joinedWeekInfo];
  let nextWeek = joinedWeek;
  let nextWeekInfo;

  while (JSON.stringify(nextWeekInfo) !== JSON.stringify(todayWeekInfo)) {
    nextWeek = new Date(moment(nextWeek).add(7, 'days'));
    nextWeekInfo = getWeekOfMonth(nextWeek);
    weekList.push(nextWeekInfo);
  }

  for (let i = 0; i < 2;) {
    i += 1;
    nextWeek = new Date(moment(nextWeek).add(7, 'days'));
    nextWeekInfo = getWeekOfMonth(nextWeek);
    weekList.push(nextWeekInfo);
  }

  // 여정 목록 조회
  let journeyYear;
  let journeyMonth;
  let journeyWeek;

  if (date) {
    const weekInfo = await getWeekOfMonth(new Date(date));
    journeyYear = weekInfo.year;
    journeyMonth = weekInfo.month;
    journeyWeek = weekInfo.weekNo;
  } else {
    journeyYear = year;
    journeyMonth = month;
    journeyWeek = weekNo;
  }

  let journeys;
  try {
    journeys = await Journey.findAll({
      include: {
        model: ToDo,
        required: false,
        attributes: ['idx', 'title', 'date', 'isTop', 'isDone'],
      },
      order: [
        [{ model: ToDo }, 'isTop', 'DESC'],
        [{ model: ToDo }, 'date', 'ASC'],
      ],
      attributes: ['idx', 'title', 'year', 'month', 'weekNo', 'userIdx', 'value1', 'value2'],
      where: {
        year: journeyYear,
        month: journeyMonth,
        weekNo: journeyWeek,
        userIdx: user.idx,
      },
    });
  } catch (e) {
    throw new HttpInternalServerError(Errors.SERVER.UNEXPECTED_ERROR, e);
  }

  if (journeys.length === 0) {
    const journeyRandomTitle = [
      '지금 이런 별이 필요할 것 같아요',
      '이런 별을 찾는건 어떠세요?',
    ];

    const randomJourneyPromise = journeyRandomTitle.map(async (title) => {
      const value1 = await getRandomValue(Object.values(Journey.VALUES), null);
      const value2 = await getRandomValue(
        Object.values(Journey.VALUES),
        value1,
      );
      const randomJourney = {
        idx: null,
        title,
        year: journeyYear,
        month: journeyMonth,
        weekNo: journeyWeek,
        userIdx: user.idx,
        value1,
        value2,
        toDos: [],
      };
      await journeys.push(randomJourney);
    });
    await Promise.all(randomJourneyPromise);

    return res.status(200).json({ weekList, journeys });
  }

  journeys.forEach((journey) => {
    journey.toDos.forEach((toDo) => {
      const utcDate = new Date(toDo.dataValues.date).toUTCString();
      // eslint-disable-next-line no-param-reassign
      toDo.dataValues.date = moment(utcDate)
        .locale('ko')
        .format('M월 D일 dddd');
    });
  });

  return res.status(200).json({ weekList, journeys });
};

/**
 * 여정 삭제
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<*>}
 */
const deleteJourney = async (req, res) => {
  const { user } = res.locals.auth;
  const { journeyIdx } = req.params;

  let journey;
  try {
    journey = await Journey.findOne({
      where: { idx: journeyIdx, userIdx: user.idx },
    });
  } catch (e) {
    throw new HttpInternalServerError(Errors.SERVER.UNEXPECTED_ERROR, e);
  }

  if (!journey) throw new HttpNotFound(Errors.JOURNEY.NOT_FOUND);

  try {
    await journey.destroy();
  } catch (e) {
    throw new HttpInternalServerError(Errors.SERVER.UNEXPECTED_ERROR, e);
  }

  return res.status(204).end();
};

const router = express.Router();

// 여정 생성
router.post('/', auth.authenticate({}), asyncRoute(createJourney));

// 여정 수정
router.patch('/:journeyIdx', auth.authenticate({}), asyncRoute(updateJourney));

// 여정 제목 목록 조회
router.get('/title', auth.authenticate({}), asyncRoute(getJourneyTitleList));

// 여정 목록 조회
router.get('/', auth.authenticate({}), asyncRoute(getJourneyList));

// 여정 삭제
router.delete('/:journeyIdx', auth.authenticate({}), asyncRoute(deleteJourney));

module.exports = {
  router,
  createJourney,
  updateJourney,
  getJourneyTitleList,
  getJourneyList,
  deleteJourney,
};
