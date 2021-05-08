const HttpError = require('./httpError');

class HttpForbidden extends HttpError {
  /**
   * @param {{code: number, message: string}} data
   * @param {(Error|undefined)} [error]
   * @param [params]
   */
  constructor(data, error, ...params) {
    super(403, data, error, ...params);
  }
}

module.exports = HttpForbidden;
