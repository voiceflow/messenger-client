import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import express from 'express';
import path from 'path';

import interact from './interact';
import verify from './verify';

// load in environment variables from .env file
dotenv.config();

// Create Express server
const app = express();

// Express configuration
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'pug');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

/**
 * Primary app routes.
 */
app.get('/', (_, res) => res.send("I'm alive!"));
app.get('/webhook', verify);
app.post('/webhook', interact);

export default app;
