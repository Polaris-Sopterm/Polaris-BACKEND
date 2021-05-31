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

const { Journey, ToDo } = db;

// TODO: 추후 createToDoByJourney 의 변경사항이 없다면 crateToDoBtDate 와 하나로 통합
/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<*>}
 */
const createToDo = async (req, res) => {
  const { user: currentUser } = res.locals.auth;

  const {
    title, date, journeyIdx, isTop,
  } = req.body;

  // TODO: 여정 제목이 없음에 대한 케이스 추가
  if (!date) throw new HttpBadRequest(Errors.TODO.DATE_MISSING);
  if (!title) throw new HttpBadRequest(Errors.TODO.TITLE_MISSING);
  if (isTop.isNull) throw new HttpBadRequest(Errors.TODO.IS_TOP_MISSING);

  if (journeyIdx) {
    let journey;
    try {
      journey = Journey.findByPk(journeyIdx, {
        attributes: ['idx', 'year', 'month', 'weekNo'],
      });
    } catch (err) {
      throw new HttpInternalServerError(Errors.SERVER.UNEXPECTED_ERROR, err);
    }

    if (!journey) throw new HttpNotFound(Errors.JOURNEY.NOT_FOUND);

    const checkWeekNo = await getWeekOfMonth(new Date(date));
    if (
      journey.year !== checkWeekNo.year
      || journey.month !== checkWeekNo.month
      || journey.weekNo !== checkWeekNo.weekNo
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
    todo = await ToDo.create(toDoData);
  } catch (err) {
    throw new HttpInternalServerError(Errors.SERVER.UNEXPECTED_ERROR, err);
  }

  return res.status(201).json(todo);
};

const router = express.Router();

router.post('/', auth.authenticate({}), asyncRoute(createToDo));

module.exports = { router, createToDo };
