const Errors = require('./errors');
const HttpError = require('./httpError');
const HttpBadRequest = require('./httpBadRequest');
const HttpUnauthorized = require('./httpUnauthorized');
const HttpForbidden = require('./httpForbidden');
const HttpNotFound = require('./httpNotFound');
const HttpInternalServerError = require('./httpInternalServerError');

module.exports = {
  Errors,
  HttpError,
  HttpBadRequest,
  HttpUnauthorized,
  HttpForbidden,
  HttpNotFound,
  HttpInternalServerError,
};
