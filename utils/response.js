/**
 * @param {Response} res
 * @param {Object} error
 */
const response400 = (res, error) => {
  res
    .status(400)
    .json(error);
};

/**
 * @param {Response} res
 */
const response401 = (res) => {
  res
    .status(401)
    .end();
};

/**
 * @param {Response} res
 * @param {Object} error
 */
const response403 = (res, error) => {
  res
    .status(403)
    .json(error);
};

/**
 * @param {Response} res
 * @param {Object} error
 */
const response404 = (res, error) => {
  res
    .status(404)
    .json(error);
};

/**
 * @param {Response} res
 * @param {Object} error
 */
const response500 = (res, error) => {
  res
    .status(500)
    .json(error);
};

module.exports = {
  response400,
  response401,
  response403,
  response404,
  response500,
};
