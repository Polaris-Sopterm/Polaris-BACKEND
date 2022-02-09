/* eslint-disable no-restricted-syntax, no-await-in-loop */

const express = require('express');

const asyncRoute = require('../../utils/asyncRoute');
const { getWeekOfMonth } = require('../../utils/weekCalculation');
const { Errors, HttpInternalServerError } = require('../../middlewares/error');

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
  let weekNo;
  let lastDate;
  let lastDay;
  let date;

  const resBody = {
    data: [],
  };

  try {
    const today = new Date();
    const todayYear = today.getFullYear();

    const fiveYears = [todayYear - 2, todayYear - 1, todayYear, todayYear + 1, todayYear + 2];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    let index;
    let tmpMonth;
    for (const year of fiveYears) {
      index = fiveYears.indexOf(year);

      if (JSON.stringify(resBody.data[index]) !== '[]') {
        resBody.data.push({ year });
      }

      for (const month of months) {
        tmpMonth = months.indexOf(month) + 1;

        if (resBody.data[index][month] !== '{}') {
          resBody.data[index][month] = {};
        }

        lastDate = new Date(year, tmpMonth, 0);
        lastDay = lastDate.getDate();

        date = `${year}-${month}-${lastDay}`;

        weekNo = await getWeekOfMonth(new Date(date));

        if (weekNo.weekNo === 1) {
          while (weekNo.weekNo === 1) {
            lastDay -= 1;
            date = `${year}-${tmpMonth}-${lastDay}`;

            weekNo = await getWeekOfMonth(new Date(date));

            if (weekNo.weekNo !== 1) break;
          }
        }
        resBody.data[index][month] = { weekNo: weekNo.weekNo };
      }
    }
  } catch (e) {
    throw new HttpInternalServerError(Errors.SERVER.UNEXPECTED_ERROR, e);
  }

  return res.status(200).json(resBody);
};

const router = express.Router();

router.get('/lastWeekOfMonth', asyncRoute(lastMonthWeekNo));

router.get('/:date', asyncRoute(getWeekNo));

module.exports = {
  router, getWeekNo, lastMonthWeekNo,
};
