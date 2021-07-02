const express = require('express');

const {
  Errors,
  HttpBadRequest,
  HttpInternalServerError,
} = require('../../middlewares/error');
const db = require('../../models');
const auth = require('../../middlewares/auth');

const asyncRoute = require('../../utils/asyncRoute');

const { Journey } = db;

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

  if (!(year && month && weekNo)) {
    throw new HttpBadRequest(Errors.JOURNEY.DATE_MISSING);
  }

  let journey;
  try {
    journey = await Journey.findAll({
      attributes: ['value1', 'value2'],
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

  const values = [];
  for (let i = 0; i < journey.length; i += 1) {
    values.push(journey[i].dataValues.value1);
    if (journey[i].dataValues.value2) {
      values.push(journey[i].dataValues.value2);
    }
  }

  const set = new Set(values);
  const response = [...set];

  return res
    .status(200)
    .json(response);
};

const router = express.Router();

router.get('/value', auth.authenticate({}), asyncRoute(listValues));

module.exports = {
  router,
  listValues,
};
