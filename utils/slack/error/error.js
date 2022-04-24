const moment = require('moment');

const { sendErrorMessage } = require('./webhook');
const { HttpError, HttpInternalServerError, Errors } = require('../../../middlewares/error');

// eslint-disable-next-line consistent-return
const errorHandler = (err, req, res) => {
  if (!(err instanceof HttpError) || !err.status) {
    // eslint-disable-next-line no-param-reassign
    err = new HttpInternalServerError(Errors.SERVER.UNEXPECTED_ERROR, err);
  }

  if (req.body.password) delete req.body.password;
  if (res.locals.auth && res.locals.auth.user) delete res.locals.auth.user.dataValues.password;

  const data = {
    ...err.data,
  };
  data.id = err.id;
  res.status(err.status).json(data);

  if (err instanceof HttpInternalServerError) {
    const message = {
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `An *internal server error* \`${err.id}\` occured on \`${req.method} \
            ${req.path}\` at \`${moment().format()}\`.`,
          },
        },
        { type: 'divider' },
        {
          type: 'section',
          text: { type: 'mrkdwn', text: '*Request Object*' },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `Route\n\`\`\`${JSON.stringify(req.route, null, 2)}\`\`\``,
          },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `Params\n\`\`\`${JSON.stringify(req.params, null, 2)}\`\`\``,
          },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `Query\n\`\`\`${JSON.stringify(req.query, null, 2)}\`\`\``,
          },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `Body\n\`\`\`${JSON.stringify(req.body, null, 2)}\`\`\``,
          },
        },
        { type: 'divider' },
        {
          type: 'section',
          text: { type: 'mrkdwn', text: '*Response Object*' },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `Locals\n\`\`\`${JSON.stringify(res.locals, null, 2)}\`\`\``,
          },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `Body\n\`\`\`${JSON.stringify({ ...err.content, id: err.id }, null, 2)}\`\`\``,
          },
        },
        { type: 'divider' },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Stack Trace*\n\`\`\`${err.stack}\`\`\``,
          },
        },
        { type: 'divider' },
      ],
    };

    return sendErrorMessage(message);
  }
};

module.exports = {
  errorHandler,
};
