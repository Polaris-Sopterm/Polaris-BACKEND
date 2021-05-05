/**
 * @param {function} asyncFunction
 * @returns {function(...[*]=)}
 */
const asyncRoute = (asyncFunction) => async (req, res, next) => {
  try {
    return await asyncFunction(req, res, next);
  } catch (e) {
    return next(e);
  }
};

/*
* Implements using Promise
*
const asyncRoute = (route) => (
  req, res, next = console.error,
) => Promise.resolve(route(req, res)).catch(next);
 */

module.exports = asyncRoute;
