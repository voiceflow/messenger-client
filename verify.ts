import { RequestHandler } from 'express';

const verify: RequestHandler = (req, res) => {
  // Parse the query params
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  // Checks if a token and mode is in the query string of the request
  // Checks the mode and token sent is correct
  if (mode === 'subscribe' && token === process.env.VERIFY_TOKEN) {
    // Responds with the challenge token from the request
    console.log('WEBHOOK_VERIFIED');
    res.status(200).send(challenge);
    return;
  }

  // Responds with '403 Forbidden' if verify tokens do not match
  res.sendStatus(403);
};

export default verify;
