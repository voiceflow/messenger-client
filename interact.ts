/* eslint-disable no-await-in-loop */
import RuntimeClientFactory from '@voiceflow/runtime-client-js';
import axios from 'axios';
import dotenv from 'dotenv';
import { RequestHandler } from 'express';

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

const MESSENGER_API_ENDPOINT = process.env.MESSENGER_API_ENDPOINT || 'https://graph.facebook.com/v9.0';

// Fetch the conversation state from persistence
const getState = async (senderID: string, appID: string): Promise<any | undefined> => {
  const stateKey = `${appID}-${senderID}`;
  return kvstore.get(stateKey);
};

const saveState = async (senderID: string, appID: string, state: any) => {
  const stateKey = `${appID}-${senderID}`;
  return kvstore.set(stateKey, state);
};

const sendRequest = async (message: any, recipient: string) => {
  return axios
    .post(
      `${MESSENGER_API_ENDPOINT}/me/messages`,
      {
        messaging_type: 'RESPONSE',
        recipient: {
          id: recipient,
        },
        message,
      },
      {
        params: {
          access_token: process.env.PAGE_ACCESS_TOKEN,
        },
      }
    )
    .catch((error) => {
      console.error(error?.response?.data || error);
    });
};

const sendMessage = async (text: string, chips: string[], recipient: string) =>
  sendRequest(
    {
      text,
      ...(chips.length && {
        quick_replies: chips.map((name) => ({
          content_type: 'text',
          title: name,
          payload: name,
        })),
      }),
    },
    recipient
  );

const sendImage = async (url: string, recipient: string) =>
  sendRequest(
    {
      attachment: {
        type: 'image',
        payload: {
          url,
        },
      },
    },
    recipient
  );

const handleMessage = async (senderID: string, appID: string, message: string): Promise<any> => {
  const state = await getState(senderID, appID);
  const client = runtimeClientFactory.createClient(state);

  const context = await client.sendText(message);

  await saveState(senderID, appID, context.toJSON().state);
  const chips = context.getChips().map(({ name }) => name);

  // eslint-disable-next-line no-restricted-syntax
  for (const trace of context.getResponse()) {
    if (trace.type === 'speak') {
      await sendMessage(trace.payload.message, chips, senderID);
      console.log(`sent message: ${trace.payload.message}`);
    }
    if (trace.type === 'visual') {
      await sendImage((trace.payload as any).image, senderID);
    }
  }

  return 'ok';
};

const interact: RequestHandler = (req, res) => {
  const { body } = req;
  if (body.object !== 'page') {
    res.sendStatus(404);
    return;
  }

  // Iterates over each entry - there may be multiple if batched
  body.entry.forEach(async (entry: any) => {
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
    await handleMessage(webhookEvent.sender.id, webhookEvent.recipient.id, webhookEvent.message.text);
  });

  res.send('EVENT_RECEIVED');
};

export default interact;
