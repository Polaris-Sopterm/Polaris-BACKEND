const { response400, response401 } = require('../../utils/response');

/**
 * @param {Request} req
 * @param {Response} res
 * @param {Next} next
 * @returns {*}
 */
const callNext = (req, res, next) => next();

/**
 * @param {Error} error
 * @returns {function(*, *=): void}
 */
const returnBadRequest = (error) => (req, res) => response400(res, error);

/**
 * @param {Request} req
 * @param {Response} res
 */
const returnUnauthorized = (req, res) => response401(res);

module.exports = {
  callNext,
  returnBadRequest,
  returnUnauthorized,
};
