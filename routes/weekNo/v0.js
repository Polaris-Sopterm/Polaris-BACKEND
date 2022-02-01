const express = require('express');

const asyncRoute = require('../../utils/asyncRoute');
const { getWeekOfMonth } = require('../../utils/weekCalculation');

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

const router = express.Router();

router.get('/:date', asyncRoute(getWeekNo));

module.exports = {
  router, getWeekNo,
};
