const HttpError = require('./httpError');

class HttpNotFound extends HttpError {
  /**
   * @param {{code: number, message: string}} data
   * @param {(Error|undefined)} [error]
   * @param [params]
   */
  constructor(data, error, ...params) {
    super(404, data, error, ...params);
  }
}

module.exports = HttpNotFound;
