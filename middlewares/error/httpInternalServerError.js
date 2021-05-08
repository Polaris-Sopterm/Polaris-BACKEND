const { v4: uuidv4 } = require('uuid');

const HttpError = require('./httpError');

class HttpInternalServerError extends HttpError {
  /**
   * @param {{code: number, message: string}} data
   * @param {(Error|undefined)} [error]
   * @param [params]
   */
  constructor(data, error, ...params) {
    super(500, data, error, ...params);

    this.id = uuidv4();
  }
}

module.exports = HttpInternalServerError;
