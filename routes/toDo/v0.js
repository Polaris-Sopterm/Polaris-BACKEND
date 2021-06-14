const express = require('express');
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
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<*>}
 */
const createToDo = async (req, res) => {
  const { user: currentUser } = res.locals.auth;

  const {
    title, date, journeyTitle, journeyIdx, isTop,
  } = req.body;

  if (!date) throw new HttpBadRequest(Errors.TODO.DATE_MISSING);
  if (!title) throw new HttpBadRequest(Errors.TODO.TITLE_MISSING);
  if (isTop.isNull) throw new HttpBadRequest(Errors.TODO.IS_TOP_MISSING);

  const weekInfo = await getWeekOfMonth(new Date(date));

  const transaction = await db.sequelize.transaction();

  if (journeyTitle === 'default') {
    // 해당 주차의 기본 여정 여부 체크
    let defaultJourney;
    try {
      defaultJourney = await Journey.findOne({
        where: {
          title: 'default',
          userIdx: currentUser.idx,
          year: weekInfo.year,
          month: weekInfo.month,
          weekNo: weekInfo.weekNo,
        },
      });
    } catch (err) {
      throw new HttpInternalServerError(Errors.SERVER.UNEXPECTED_ERROR, err);
    }

    // 해당 주차의 기본 여정이 없다면 생성
    if (!defaultJourney) {
      const value1 = await getRandomValue(Object.values(Journey.VALUES), null);
      const value2 = await getRandomValue(Object.values(Journey.VALUES), value1);

      const defaultJourneyData = {
        title: 'default',
        value1,
        value2,
        year: weekInfo.year,
        month: weekInfo.month,
        weekNo: weekInfo.weekNo,
        date,
        userIdx: currentUser.idx,
      };

      try {
        await Journey.create(defaultJourneyData, { transaction });
      } catch (err) {
        throw new HttpInternalServerError(Errors.SERVER.UNEXPECTED_ERROR, err);
      }
    }
  } else if (!journeyTitle) {
    // 기본 여정 선택이 아닌데 여정의 idx 없는 경우 에러 처리
    if (!journeyIdx) throw new HttpBadRequest(Errors.TODO.JOURNEY_IDX_MISSING);
  }

  if (journeyIdx) {
    let journey;
    try {
      journey = await Journey.findByPk(journeyIdx, {
        attributes: ['idx', 'year', 'month', 'weekNo'],
      });
    } catch (err) {
      throw new HttpInternalServerError(Errors.SERVER.UNEXPECTED_ERROR, err);
    }

    if (!journey) throw new HttpNotFound(Errors.JOURNEY.NOT_FOUND);

    if (
      journey.year !== weekInfo.year
      || journey.month !== weekInfo.month
      || journey.weekNo !== weekInfo.weekNo
    ) {
      throw new HttpBadRequest(Errors.TODO.INCORRECT_WEEK_NO);
    }
  }

  const toDoData = {
    title,
    date,
    isTop,
    journeyIdx,
    userIdx: currentUser.idx,
  };

  let todo;
  try {
    todo = await ToDo.create(toDoData, { transaction });
    await transaction.commit();
  } catch (err) {
    await transaction?.rollback();
    throw new HttpInternalServerError(Errors.SERVER.UNEXPECTED_ERROR, err);
  }

  return res.status(201).json(todo);
};

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
const updateToDo = async (req, res) => {
  const { user: currentUser } = res.locals.auth;

  const { toDoIdx } = req.params;

  const {
    title,
    date,
    journeyIdx,
    isTop,
  } = req.body;

  let toDo;

  try {
    toDo = await ToDo.findOne({
      where: {
        idx: toDoIdx,
        userIdx: currentUser.idx,
      },
    });
  } catch (err) {
    throw new HttpInternalServerError(Errors.SERVER.UNEXPECTED_ERROR, err);
  }

  if (!toDo) throw new HttpNotFound(Errors.TODO.NOT_FOUND);

  if (title) toDo.title = title;
  if (isTop !== undefined) toDo.isTop = isTop;

  if (journeyIdx && date) {
    const weekInfo = await getWeekOfMonth(new Date(date));

    let journey;
    try {
      journey = await Journey.findByPk(journeyIdx, {
        attributes: ['idx', 'year', 'month', 'weekNo'],
      });
    } catch (err) {
      throw new HttpInternalServerError(Errors.SERVER.UNEXPECTED_ERROR, err);
    }

    if (!journey) throw new HttpNotFound(Errors.JOURNEY.NOT_FOUND);

    if (
      journey.year !== weekInfo.year
      || journey.month !== weekInfo.month
      || journey.weekNo !== weekInfo.weekNo
    ) {
      throw new HttpBadRequest(Errors.TODO.INCORRECT_WEEK_NO);
    }

    toDo.journeyIdx = journeyIdx;
    toDo.date = date;
  }

  try {
    await toDo.save();
  } catch (err) {
    throw new HttpInternalServerError(Errors.SERVER.UNEXPECTED_ERROR, err);
  }

  return res.status(200).json(toDo);
};

const router = express.Router();

router.post('/', auth.authenticate({}), asyncRoute(createToDo));

router.patch('/:toDoIdx', auth.authenticate({}), asyncRoute(updateToDo));

module.exports = { router, createToDo, updateToDo };
