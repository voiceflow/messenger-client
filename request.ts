import axios from 'axios';
import dotenv from 'dotenv';

// load in environment variables from .env file
dotenv.config();

const MESSENGER_API_ENDPOINT = process.env.MESSENGER_API_ENDPOINT || 'https://graph.facebook.com/v9.0';

const sendRequest = async (body: any, recipient: string, messaging_type = 'RESPONSE') => {
  return axios
    .post(
      `${MESSENGER_API_ENDPOINT}/me/messages`,
      {
        messaging_type,
        recipient: {
          id: recipient,
        },
        ...body,
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

export const sendTypingStatus = (status: boolean, recipient: string): Promise<any> =>
  sendRequest(
    {
      sender_action: status ? 'typing_on' : 'typing_off',
    },
    recipient
  );

export const sendMessage = async (text: string, chips: string[], recipient: string): Promise<any> =>
  sendRequest(
    {
      message: {
        text,
        ...(chips.length && {
          quick_replies: chips.map((name) => ({
            content_type: 'text',
            title: name,
            payload: name,
          })),
        }),
      },
    },
    recipient
  );

export const sendImage = async (url: string, recipient: string): Promise<any> =>
  sendRequest(
    {
      message: {
        attachment: {
          type: 'image',
          payload: {
            url,
          },
        },
      },
    },
    recipient
  );
