class HttpError extends Error {
  /**
   * @param {number} status
   * @param {{code: number, message: string}} data
   * @param {(Error|undefined)} [error]
   * @param [params]
   */
  constructor(status, data, error, ...params) {
    super(...params);

    this.status = status;
    this.data = data;

    if (error instanceof Error) {
      this.message = error.message;
      this.name = error.name;
      this.stack = error.stack;
    }
  }
}

module.exports = HttpError;
