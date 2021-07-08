const Errors = require('./errors');
const HttpError = require('./httpError');

class HttpUnauthorized extends HttpError {
  /**
   * @param {{code: number, message: string}} data
   * @param {(Error|undefined)} [error]
   * @param [params]
   */
  constructor(data, error, ...params) {
    if (data) super(401, data, error, ...params);
    else super(401, Errors.AUTH.NOT_LOGGED_IN, ...params);
  }
}

module.exports = HttpUnauthorized;
