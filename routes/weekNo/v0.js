const express = require('express');

const asyncRoute = require('../../utils/asyncRoute');
const { getWeekOfMonth } = require('../../utils/weekCalculation');
const { HttpBadRequest, Errors, HttpInternalServerError } = require('../../middlewares/error');

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<*>}
 */
const getWeekNo = async (req, res) => {
  const { date } = req.params;

  const weekNo = await getWeekOfMonth(new Date(date));

  const resBody = {
    weekNo: weekNo.weekNo,
  };

  return res.status(200).json(resBody);
};

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<*>}
 */
const lastMonthWeekNo = async (req, res) => {
  const { year, month } = req.body;

  if (!year) throw new HttpBadRequest(Errors.WEEK_NO.YEAR_MISSING);
  if (!month) throw new HttpBadRequest(Errors.WEEK_NO.MONTH_MISSING);

  let weekNo;
  let lastDate;
  let lastDay;
  let date;
  try {
    lastDate = new Date(year, month, 0);
    lastDay = lastDate.getDate();
    date = `${year}-${month}-${lastDay}`;

    weekNo = await getWeekOfMonth(new Date(date));

    if (weekNo.weekNo === 1) {
      while (weekNo.weekNo === 1) {
        lastDay -= 1;
        date = `${year}-${month}-${lastDay}`;

        // eslint-disable-next-line no-await-in-loop
        weekNo = await getWeekOfMonth(new Date(date));

        if (weekNo.weekNo !== 1) break;
      }
    }
  } catch (e) {
    throw new HttpInternalServerError(Errors.SERVER.UNEXPECTED_ERROR, e);
  }

  const resBody = {
    weekNo: weekNo.weekNo,
  };

  return res.status(200).json(resBody);
};

const router = express.Router();

router.get('/:date', asyncRoute(getWeekNo));

router.post('/lastWeekOfMonth', asyncRoute(lastMonthWeekNo));

module.exports = {
  router, getWeekNo, lastMonthWeekNo,
};
