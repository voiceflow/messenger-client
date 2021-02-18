/* eslint-disable no-await-in-loop */
import RuntimeClientFactory from '@voiceflow/runtime-client-js';
import dotenv from 'dotenv';
import { RequestHandler } from 'express';

import { sendImage, sendMessage, sendTypingStatus } from './request';
import kvstore from './store';

// load in environment variables from .env file
dotenv.config();

const runtimeClientFactory = new RuntimeClientFactory({
  versionID: process.env.VOICEFLOW_VERSION_ID!, // voiceflow project versionID
  endpoint: process.env.VOICEFLOW_RUNTIME_ENDPOINT,
  dataConfig: {
    includeTypes: ['speak', 'visual'],
  },
});

// Fetch the conversation state from persistence
const getState = async (senderID: string, appID: string): Promise<any | undefined> => {
  const stateKey = `${appID}-${senderID}`;
  return kvstore.get(stateKey);
};

const saveState = async (senderID: string, appID: string, state: any) => {
  const stateKey = `${appID}-${senderID}`;
  return kvstore.set(stateKey, state);
};

const handleMessage = async (senderID: string, appID: string, message: string): Promise<any> => {
  const state = await getState(senderID, appID);
  const client = runtimeClientFactory.createClient(state);

  const context = await client.sendText(message);

  await saveState(senderID, appID, context.toJSON().state);
  const chips = context.getChips().map(({ name }) => name);

  const response = context.getResponse();
  const lastSpeakIndex = response.map(({ type }) => type).lastIndexOf('speak' as any);

  // eslint-disable-next-line no-restricted-syntax
  for (let i = 0; i < response.length; i++) {
    const trace = response[i];
    if (trace.type === 'speak') {
      const quickReplies = i === lastSpeakIndex ? chips : [];
      // only send suggestion chips with the last speak
      await sendMessage(trace.payload.message, quickReplies, senderID);
      console.log(`sent message: ${trace.payload.message}`);
    }
    if (trace.type === 'visual') {
      await sendImage((trace.payload as any).image, senderID);
    }
  }

  return 'ok';
};

const interact: RequestHandler = async (req, res) => {
  const { body } = req;
  if (body.object !== 'page') {
    res.sendStatus(404);
    return;
  }

  // Iterates over each entry - there may be multiple if batched
  body.entry.forEach(async (entry: any) => {
    // do not handle messages older than 5 seconds
    if (Date.now() - entry.time > 5000) {
      return;
    }

    // Gets the body of the webhook event
    const webhookEvent = entry.messaging[0];

    // Discard uninteresting events
    if ('read' in webhookEvent) {
      // console.log("Got a read event");
      return;
    }

    if ('delivery' in webhookEvent) {
      // console.log("Got a delivery event");
      return;
    }

    // SenderID -> Who is interacting with the app?
    // AppID -> What is the target "skill"?
    // Message -> Text
    await sendTypingStatus(true, webhookEvent.sender.id);
    await handleMessage(webhookEvent.sender.id, webhookEvent.recipient.id, webhookEvent.message.text);
    await sendTypingStatus(false, webhookEvent.sender.id);
  });

  res.send('EVENT_RECEIVED');
};

export default interact;
