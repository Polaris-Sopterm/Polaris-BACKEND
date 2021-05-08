const HttpError = require('./httpError');

class HttpBadRequest extends HttpError {
  /**
   * @param {{code: number, message: string}} data
   * @param {(Error|undefined)} [error]
   * @param [params]
   */
  constructor(data, error, ...params) {
    super(400, data, error, ...params);
  }
}

module.exports = HttpBadRequest;
