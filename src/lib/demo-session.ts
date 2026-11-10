export const DEMO_EMAIL = "demo@carebridge.app";
export const DEMO_PASSWORD = "CareBridge2026!";

const KEY = "carebridge.demo.session";

export function isDemoSignedIn() {
  if (typeof window === "undefined") return false;
  return window.sessionStorage.getItem(KEY) === "1";
}

export function signInDemo() {
  window.sessionStorage.setItem(KEY, "1");
}

export function signOutDemo() {
  window.sessionStorage.removeItem(KEY);
}

export function credentialsMatch(email: string, password: string) {
  return email.trim().toLowerCase() === DEMO_EMAIL && password === DEMO_PASSWORD;
}
