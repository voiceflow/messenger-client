> [!CAUTION]
> Update Nov 25, 2025: This repository has been archived and will not accept further changes.

# Voiceflow Messenger JS

This creates an node/express server for creating and handling a messenger chatbot running off a Voiceflow project.

## Getting Started

### Code Setup

- make sure you have `nodejs` and `npm`/`yarn` installed
- Fork/Clone this repository
- run `yarn` or `npm install`
- create an `.env` file in your root folder and populate it with this:

```
PORT=4000

VERIFY_TOKEN='[your messenger verify token]'
PAGE_ACCESS_TOKEN='[your messenger page access token]'

VOICEFLOW_VERSION_ID='[voiceflow version id]'
VOICEFLOW_API_KEY='[your voiceflow workspace api-key]'
# VOICEFLOW_RUNTIME_ENDPOINT='[optional]'

NODE_TLS_REJECT_UNAUTHORIZED='0'
```

### Voiceflow Setup

First, you build a fully-functioning conversational app on [Voiceflow](https://creator.voiceflow.com). This project can also be reused for various other channels. Make sure to test your project with the Test Tool on Voiceflow, and everything is working the way you want it.

When you are inside a Voiceflow project on , your address bar should have a URL that looks like this.
![Screen Shot 2021-03-01 at 12 23 40 PM](https://user-images.githubusercontent.com/5643574/109534188-0e107580-7a89-11eb-808f-c7a97227847c.png)
This is your `VOICEFLOW_VERSION_ID` that you will put into your `.env` file.

Go to `https://creator.voiceflow.com/workspace/[YOUR WORKSPACE]/api-keys` to generate an API Key. Add that to your `.env` file as `VOICEFLOW_API_KEY`.

By now you should have `VOICEFLOW_VERSION_ID` and `VOICEFLOW_RUNTIME_ENDPOINT` defined in your `.env` file.

### Messenger Setup

You first need a public Facebook page, go [here](https://www.facebook.com/pages/create) to create one if you don't have a page already.

You now need a Facebook application that is connected to your page. If you don't have one, go [here](https://developers.facebook.com/quickstarts) to create an application for your bot.

When you are on the dashboard of your app, add the **Messenger** product.

![Screen Shot 2021-03-01 at 11 59 37 AM](https://user-images.githubusercontent.com/5643574/109531233-a278d900-7a85-11eb-926a-30b7e7eef752.png)

On the **Messenger** page, locate the _Access Tokens_ section and then connect your app to the Facebook page. Then generate a token.

![Screen Shot 2021-03-01 at 12 03 31 PM](https://user-images.githubusercontent.com/5643574/109531632-26cb5c00-7a86-11eb-86c5-78bb78ffad99.png)

This is your `PAGE_ACCESS_TOKEN` that you will put in your `.env` file.

Next, go to the **Webhooks** section, and hit _Add Callback URL_. There you want to run a tunneling service like [ngrok](https://www.npmjs.com/package/ngrok) (It is recommended you signup and authenticate ngrok so your link is consistent). Next run:

```
ngrok http 4000
```

This will give you a link, take it and put it into the Callback section, along with `/webhook` behind it.

![Screen Shot 2021-03-01 at 12 39 32 PM](https://user-images.githubusercontent.com/5643574/109536003-326d5180-7a8b-11eb-9d93-ea817b6881de.png)

In the **Verify Token** field, think of a token yourself, ideally a random string. This is your `VERIFY_TOKEN` that you will put in your `.env` file.

Now run your server with `yarn start`, hit _Verify and Save_.

Finally link your page to the Callback section, and add `messages` and `messaging_postbacks` as subscription fields.

![Screen Shot 2021-03-01 at 12 41 46 PM](https://user-images.githubusercontent.com/5643574/109536239-7fe9be80-7a8b-11eb-8108-f5d4946e098d.png)

Now just chat up your bot!

## Notes

To update the chatbot with your Voiceflow changes, run the Test Tool again. It is always synced with the latest version of your test.
