const Errors = require('./errors');
const HttpError = require('./httpError');
const HttpInternalServerError = require('./httpInternalServerError');

// eslint-disable-next-line no-unused-vars
const handler = async (err, req, res, next) => {
  if (!(err instanceof HttpError) || !err.status) {
    // eslint-disable-next-line no-param-reassign
    err = new HttpInternalServerError(Errors.SERVER.UNEXPECTED_ERROR, err);
  }

  if (req.body.password) delete req.body.password;
  if (res.locals.auth && res.locals.auth.user) delete res.locals.auth.user.dataValues.password;

  const data = {
    ...err.data,
  };

  if (err instanceof HttpInternalServerError) {
    data.id = err.id;
  }
  console.error(err);

  return res
    .status(err.status)
    .json(data);
};

module.exports = handler;
