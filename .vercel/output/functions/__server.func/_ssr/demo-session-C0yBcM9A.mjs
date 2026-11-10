//#region node_modules/.nitro/vite/services/ssr/assets/demo-session-C0yBcM9A.js
var DEMO_EMAIL = "demo@carebridge.app";
var DEMO_PASSWORD = "CareBridge2026!";
var KEY = "carebridge.demo.session";
function isDemoSignedIn() {
	if (typeof window === "undefined") return false;
	return window.sessionStorage.getItem(KEY) === "1";
}
function signInDemo() {
	window.sessionStorage.setItem(KEY, "1");
}
function signOutDemo() {
	window.sessionStorage.removeItem(KEY);
}
function credentialsMatch(email, password) {
	return email.trim().toLowerCase() === "demo@carebridge.app" && password === "CareBridge2026!";
}
//#endregion
export { signInDemo as a, isDemoSignedIn as i, DEMO_PASSWORD as n, signOutDemo as o, credentialsMatch as r, DEMO_EMAIL as t };
