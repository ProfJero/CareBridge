//#region node_modules/.nitro/vite/services/ssr/assets/application-inbox-CJtu-P2W.js
/**
* Caregiver applications are delivered by email through FormSubmit.
* FormSubmit needs no API key — the first real submission emails
* profjero947@gmail.com a one-time activation link. After that, every
* application arrives in that inbox.
*
* Web3Forms is slightly nicer for pure JSON APIs, but it needs an access
* key this project does not have. FormSubmit works immediately.
*/
var APPLICATION_INBOX = "profjero947@gmail.com";
var STORE_KEY = "carebridge.applications";
function readSubmittedApplications() {
	if (typeof window === "undefined") return [];
	try {
		const raw = window.localStorage.getItem(STORE_KEY);
		if (!raw) return [];
		const parsed = JSON.parse(raw);
		return Array.isArray(parsed) ? parsed : [];
	} catch {
		return [];
	}
}
function remember(application) {
	const current = readSubmittedApplications().filter((item) => item.id !== application.id);
	window.localStorage.setItem(STORE_KEY, JSON.stringify([application, ...current].slice(0, 40)));
}
function makeReference() {
	return `CB-2026-${Date.now().toString(36).toUpperCase().slice(-5)}${Math.random().toString(36).slice(2, 5).toUpperCase()}`;
}
async function sendCaregiverApplication(input, reference) {
	const form = new FormData();
	form.append("_subject", `CareBridge caregiver application — ${input.role} (${reference})`);
	form.append("_template", "table");
	form.append("_captcha", "false");
	form.append("_replyto", input.email.trim());
	form.append("_honey", "");
	form.append("Reference", reference);
	form.append("Full name", input.name.trim());
	form.append("Email", input.email.trim());
	form.append("Phone", input.phone.trim());
	form.append("Role", input.role);
	form.append("Preferred area", input.area);
	form.append("Availability", input.availability);
	form.append("Experience", input.experience.trim() || "Not provided");
	form.append("Message", `${input.name.trim()} applied for ${input.role} in ${input.area}. They can start: ${input.availability}.`);
	if (input.cv) form.append("attachment", input.cv, input.cv.name);
	const response = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(APPLICATION_INBOX)}`, {
		method: "POST",
		headers: { Accept: "application/json" },
		body: form
	});
	let payload = {};
	try {
		payload = await response.json();
	} catch {
		payload = {};
	}
	const message = payload.message ?? "";
	const awaitingInboxConfirmation = /activat/i.test(message);
	if (!(response.ok && (String(payload.success) !== "false" || awaitingInboxConfirmation))) throw new Error(message || "The application could not be sent. Please try again in a moment.");
	const saved = {
		id: reference,
		reference,
		name: input.name.trim(),
		email: input.email.trim(),
		phone: input.phone.trim(),
		role: input.role,
		area: input.area,
		experience: input.experience.trim(),
		availability: input.availability,
		cvName: input.cv?.name ?? "",
		submittedAt: (/* @__PURE__ */ new Date()).toISOString()
	};
	remember(saved);
	return saved;
}
//#endregion
export { sendCaregiverApplication as i, makeReference as n, readSubmittedApplications as r, APPLICATION_INBOX as t };
