import env from "@server/env";

export default {
  EXTERNAL_AUTH_CLIENT_ID: env.EXTERNAL_AUTH_CLIENT_ID,
  EXTERNAL_AUTH_CLIENT_SECRET: env.EXTERNAL_AUTH_CLIENT_SECRET,
  EXTERNAL_AUTH_AUTHORIZATION_URL: env.EXTERNAL_AUTH_AUTHORIZATION_URL || "https://your-external-auth.com/oauth2/authorize",
  EXTERNAL_AUTH_TOKEN_URL: env.EXTERNAL_AUTH_TOKEN_URL || "https://your-external-auth.com/oauth2/token",
  EXTERNAL_AUTH_USER_INFO_URL: env.EXTERNAL_AUTH_USER_INFO_URL || "https://your-external-auth.com/oauth2/userinfo",
};