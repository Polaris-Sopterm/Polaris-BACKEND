const { IncomingWebhook } = require('@slack/webhook');

const sendErrorMessage = (message) => {
  const webhookUrl = process.env.ERROR_WEBHOOK_URL;
  const incomingWebhook = new IncomingWebhook(webhookUrl);

  return incomingWebhook.send(message);
};

module.exports = { sendErrorMessage };
