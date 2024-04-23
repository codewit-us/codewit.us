import * as dotenv from 'dotenv';

dotenv.config({path: '../../.env'});

const HOST = process.env.API_HOST ?? 'localhost';
const PORT = process.env.API_PORT ? Number(process.env.API_PORT) : 3000;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URL = process.env.GOOGLE_REDIRECT_URL;
const COOKIE_KEY = process.env.COOKIE_KEY as string;

export {
  HOST,
  PORT,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URL,
  COOKIE_KEY,
};
