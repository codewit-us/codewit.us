function check_if_boolean(value: string): boolean {
  switch (value.toLowerCase()) {
    case "true": return true;
    case "false": return false;
    default: return false
  }
}

const HOST = process.env.API_HOST ?? '0.0.0.0';
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URL = process.env.GOOGLE_REDIRECT_URL;
const COOKIE_KEY = process.env.COOKIE_KEY as string;
const FRONTEND_URL = process.env.FRONTEND_URL;
const ENABLE_ASSET_SERVING = check_if_boolean(process.env.ENABLE_ASSET_SERVING ?? "");

export {
  HOST,
  PORT,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URL,
  COOKIE_KEY,
  FRONTEND_URL,
  ENABLE_ASSET_SERVING,
};
