const express = require('express');

const {
  Errors,
  HttpBadRequest,
  HttpNotFound,
  HttpInternalServerError,
} = require('../../middlewares/error');
const db = require('../../models');
const auth = require('../../middlewares/auth');
const asyncRoute = require('../../utils/asyncRoute');

const { Journey, Retrospect } = db;

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<*>}
 */
const listValues = async (req, res) => {
  const { user: currentUser } = res.locals.auth;
  const {
    year, month, weekNo,
  } = req.query;

  const where = {};
  if (year && month && weekNo) {
    where.year = year;
    where.month = month;
    where.weekNo = weekNo;
  }
  where.userIdx = currentUser.idx;

  let journey;
  try {
    journey = await Journey.findAll({
      attributes: ['value1', 'value2'],
      where,
    });
  } catch (err) {
    throw new HttpInternalServerError(Errors.SERVER.UNEXPECTED_ERROR, err);
  }

  const values = [];
  for (let i = 0; i < journey.length; i += 1) {
    if (journey[i].dataValues.value1) {
      values.push(journey[i].dataValues.value1);
    }
    if (journey[i].dataValues.value2) {
      values.push(journey[i].dataValues.value2);
    }
  }

  const response = {};
  values.forEach((data) => {
    if (response[data]) {
      response[data] += 1;
    } else {
      response[data] = 1;
    }
  });

  return res
    .status(200)
    .json(response);
};

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<*>}
 */
const createRetrospect = async (req, res) => {
  const { user: currentUser } = res.locals.auth;

  const {
    value,
    record1,
    record2,
    record3,
    year,
    month,
    weekNo,
  } = req.body;

  if (!(year && month && weekNo)) {
    throw new HttpBadRequest(Errors.RETROSPECT.WEEK_DATA_MISSING);
  }

  if (value === undefined) {
    throw new HttpBadRequest(Errors.RETROSPECT.WEEK_DATA_MISSING);
  }

  {
    let retrospect;
    try {
      retrospect = await Retrospect.findOne({
        where: {
          year,
          month,
          weekNo,
          userIdx: currentUser.idx,
        },
      });
    } catch (err) {
      throw new HttpInternalServerError(Errors.SERVER.UNEXPECTED_ERROR, err);
    }

    if (retrospect) throw new HttpBadRequest(Errors.RETROSPECT.ALREADY_EXIST);
  }

  const valueYes = value.y;
  const valueNo = value.n;

  valueYes.forEach((value1) => {
    if (value1 && !Object.values(Journey.VALUES).includes(value1)) {
      throw new HttpBadRequest(Errors.JOURNEY.VALUES_INCORRECT);
    }
  });

  valueNo.forEach((value2) => {
    if (value2 && !Object.values(Journey.VALUES).includes(value2)) {
      throw new HttpBadRequest(Errors.JOURNEY.VALUES_INCORRECT);
    }
  });

  const {
    health, happy, challenge, moderation, emoticon, need,
  } = value;

  if ((health || happy || challenge || moderation) > 5
    || (Math.sign(happy) || Math.sign(health) || Math.sign(challenge)
      || Math.sign(moderation)) === -1) {
    throw new HttpBadRequest(Errors.RETROSPECT.DEGREE_INCORRECT);
  }

  emoticon.forEach((v) => {
    if (v && !Object.values(Retrospect.EMOTION).includes(v)) {
      throw new HttpBadRequest(Errors.RETROSPECT.EMOTION_INCORRECT);
    }
  });

  need.forEach((value3) => {
    if (value3 && !Object.values(Journey.VALUES).includes(value3)) {
      throw new HttpBadRequest(Errors.JOURNEY.VALUES_INCORRECT);
    }
  });

  const retrospectData = {
    value,
    record1,
    record2,
    record3,
    year,
    month,
    weekNo,
    userIdx: currentUser.idx,
  };

  let retrospect;
  try {
    retrospect = await Retrospect.create(retrospectData);
  } catch (err) {
    throw new HttpInternalServerError(Errors.SERVER.UNEXPECTED_ERROR, err);
  }

  return res
    .status(201)
    .json(retrospect);
};

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<*>}
 */
const getRetrospect = async (req, res) => {
  const { user: currentUser } = res.locals.auth;

  const { year, month, weekNo } = req.query;

  let retrospect;
  try {
    retrospect = await Retrospect.findOne({
      where: {
        year,
        month,
        weekNo,
        userIdx: currentUser.idx,
      },
    });
  } catch (err) {
    throw new HttpInternalServerError(Errors.SERVER.UNEXPECTED_ERROR, err);
  }

  if (!retrospect) throw new HttpNotFound(Errors.RETROSPECT.NOT_FOUND);

  return res
    .status(200)
    .json(retrospect);
};

/**
 * ?????? ????????????
 * @param {*} req
 * @param {*} res
 */
const skipRetrospect = async (req, res) => {
  const { user } = res.locals.auth;
  const { year, month, weekNo } = req.body;

  if (!year || !month || !weekNo) {
    throw new HttpBadRequest(Errors.RETROSPECT.WEEK_DATA_MISSING);
  }

  let defaultJourney;
  try {
    defaultJourney = await Journey.findOne({
      where: {
        title: 'default',
        year,
        month,
        weekNo,
        userIdx: user.idx,
      },
    });
  } catch (e) {
    throw new HttpInternalServerError(Errors.SERVER.UNEXPECTED_ERROR, e);
  }
  if (!defaultJourney) throw new HttpNotFound(Errors.JOURNEY.NOT_FOUND);
  defaultJourney.isRetrospectSkipped = true;

  try {
    await defaultJourney.save();
  } catch (err) {
    throw new HttpInternalServerError(Errors.SERVER.UNEXPECTED_ERROR, err);
  }

  return res.status(201).json({ isRetrospectSkipped: defaultJourney.isRetrospectSkipped });
};

const router = express.Router();

router.get('/value', auth.authenticate({}), asyncRoute(listValues));

router.post('/', auth.authenticate({}), asyncRoute(createRetrospect));

router.get('/', auth.authenticate({}), asyncRoute(getRetrospect));

router.patch('/skip', auth.authenticate({}), asyncRoute(skipRetrospect));

module.exports = {
  router,
  listValues,
  createRetrospect,
  getRetrospect,
  skipRetrospect,
};
