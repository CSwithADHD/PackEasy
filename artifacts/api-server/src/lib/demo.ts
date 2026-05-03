export const DEMO_USER = {
  id: "demo-user",
  email: process.env["DEMO_AUTH_EMAIL"]?.trim() || "demo@packeasy.local",
  name: process.env["DEMO_AUTH_NAME"]?.trim() || "Demo User",
};

export const DEMO_PASSWORD =
  process.env["DEMO_AUTH_PASSWORD"]?.trim() || "password123";

export const DEMO_SESSION_TOKEN = "demo-session-token";

export function isDemoCredentials(email: string, password: string): boolean {
  return (
    email.trim().toLowerCase() === DEMO_USER.email.toLowerCase() &&
    password === DEMO_PASSWORD
  );
}

export function isDemoSessionToken(token: string): boolean {
  return token === DEMO_SESSION_TOKEN;
}
