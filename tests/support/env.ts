export const defaultBaseUrl =
  "https://sandbox.verifyiq-mercury-dev.boost-frontend.app/";

export type AuthEnv = {
  username: string;
  password: string;
};

export function requireAuthEnv(): AuthEnv {
  const username = process.env.VERIFYIQ_USERNAME;
  const password = process.env.VERIFYIQ_PASSWORD;

  if (!username || !password) {
    throw new Error(
      [
        "Missing VerifyIQ auth environment.",
        "Provide playwright/.auth/user.json, VERIFYIQ_STORAGE_STATE_JSON, VERIFYIQ_STORAGE_STATE_PATH, or VERIFYIQ_USERNAME/VERIFYIQ_PASSWORD.",
        "Do not commit real credentials; use .env.example as the template."
      ].join(" ")
    );
  }

  return { username, password };
}
