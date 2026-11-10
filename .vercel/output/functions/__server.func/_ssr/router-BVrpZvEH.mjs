import { i as __toESM } from "../_runtime.mjs";
import { J as require_react, S as require_jsx_runtime, _ as createFileRoute, d as Scripts, f as HeadContent, g as lazyRouteComponent, h as Outlet, m as createRouter, v as createRootRoute, x as useRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as TriangleAlert } from "../_libs/lucide-react.mjs";
import { a as union, i as string, n as number, r as object, t as literal } from "../_libs/zod.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/demo-Bu7b7yzn.js
var SECTIONS = [
	"overview",
	"clients",
	"caregivers",
	"plans",
	"schedule",
	"visits",
	"recruitment",
	"finance",
	"reports",
	"messages",
	"settings"
];
var NAV = [
	{
		id: "overview",
		label: "Overview",
		group: "Workspace"
	},
	{
		id: "clients",
		label: "Clients",
		group: "Care operations"
	},
	{
		id: "caregivers",
		label: "Caregivers",
		group: "Care operations"
	},
	{
		id: "plans",
		label: "Care plans",
		group: "Care operations"
	},
	{
		id: "schedule",
		label: "Schedule",
		group: "Care operations"
	},
	{
		id: "visits",
		label: "Visits",
		group: "Care operations"
	},
	{
		id: "recruitment",
		label: "Recruitment",
		group: "People"
	},
	{
		id: "finance",
		label: "Finance",
		group: "Management"
	},
	{
		id: "reports",
		label: "Reports",
		group: "Management"
	},
	{
		id: "messages",
		label: "Messages",
		group: "Management"
	},
	{
		id: "settings",
		label: "Settings",
		group: "System"
	}
];
var NAV_GROUPS = [
	"Workspace",
	"Care operations",
	"People",
	"Management",
	"System"
];
var ROLES = [
	"Home Care Assistant",
	"Registered Nurse",
	"Enrolled Nurse",
	"Caregiver",
	"Companion Caregiver",
	"Live-in Caregiver"
];
var AREAS = [
	"Accra",
	"Tema",
	"Cape Coast",
	"Elmina",
	"Mankessim",
	"Kumasi",
	"Central Region",
	"Flexible / several areas"
];
var JOBS = [
	{
		title: "Home Care Assistant",
		type: "Full-time",
		location: "Cape Coast",
		category: "Non-clinical care",
		summary: "Personal care, meals, mobility and companionship for clients at home.",
		applicants: 12,
		status: "Published"
	},
	{
		title: "Registered Nurse",
		type: "Part-time",
		location: "Cape Coast & Elmina",
		category: "Clinical care",
		summary: "Nursing visits, observations and documentation within professional scope.",
		applicants: 7,
		status: "Published"
	},
	{
		title: "Companion Caregiver",
		type: "Flexible",
		location: "Accra",
		category: "Non-clinical care",
		summary: "Company, errands and daily routines for older adults living alone.",
		applicants: 4,
		status: "Published"
	},
	{
		title: "Live-in Caregiver",
		type: "Contract",
		location: "Central Region",
		category: "Non-clinical care",
		summary: "Overnight presence and daily living support for one household.",
		applicants: 0,
		status: "Draft"
	}
];
var STAGES = [
	"New",
	"Screening",
	"Shortlisted",
	"Interview",
	"Credential checks",
	"Hired",
	"Declined"
];
var CANDIDATES = [
	{
		id: "seed-1",
		name: "Nana Akua Boateng",
		role: "Registered Nurse",
		location: "Cape Coast",
		experience: "5 years in ward and community nursing",
		date: "Today, 09:42",
		stage: "New",
		skills: [
			"Wound care",
			"Medication support",
			"Elderly care"
		]
	},
	{
		id: "seed-2",
		name: "Michael Osei",
		role: "Home Care Assistant",
		location: "Cape Coast",
		experience: "3 years of personal care support",
		date: "Today, 08:15",
		stage: "Screening",
		skills: [
			"Personal care",
			"Mobility support",
			"Companionship"
		]
	},
	{
		id: "seed-3",
		name: "Abigail Mensimah",
		role: "Caregiver",
		location: "Elmina",
		experience: "2 years with older adults at home",
		date: "Yesterday",
		stage: "Shortlisted",
		skills: [
			"Daily living",
			"Meal preparation",
			"Elderly care"
		]
	},
	{
		id: "seed-4",
		name: "Kwesi Arthur",
		role: "Enrolled Nurse",
		location: "Cape Coast",
		experience: "4 years of clinical support",
		date: "Yesterday",
		stage: "Interview",
		skills: [
			"Vital signs",
			"Documentation",
			"Patient support"
		]
	},
	{
		id: "seed-5",
		name: "Akosua Frimpong",
		role: "Companion Caregiver",
		location: "Mankessim",
		experience: "1 year of companionship care",
		date: "6 Nov 2026",
		stage: "Credential checks",
		skills: ["Companionship", "Dementia support"]
	}
];
var CLIENTS = [
	{
		name: "Mrs. Grace Mensah",
		area: "Accra — Labone",
		service: "Personal care",
		plan: "Morning support",
		status: "Active"
	},
	{
		name: "Mr. Daniel Asare",
		area: "Cape Coast",
		service: "Nursing visit",
		plan: "Wound review",
		status: "Active"
	},
	{
		name: "Madam Abena Ofori",
		area: "Elmina",
		service: "Companionship",
		plan: "Weekday afternoons",
		status: "Active"
	},
	{
		name: "Mr. Joseph Tetteh",
		area: "Tema",
		service: "Medication support",
		plan: "Twice weekly",
		status: "Review"
	},
	{
		name: "Auntie Efua Badu",
		area: "Accra — Dansoman",
		service: "Live-in support",
		plan: "Household routine",
		status: "Active"
	}
];
var CAREGIVERS = [
	{
		name: "Ama Kusi",
		role: "Caregiver",
		area: "Accra",
		duty: "On duty",
		shift: "08:00 – 16:00"
	},
	{
		name: "Esi Owusu",
		role: "Registered Nurse",
		area: "Cape Coast",
		duty: "On duty",
		shift: "09:00 – 15:00"
	},
	{
		name: "Kwame Agyeman",
		role: "Companion",
		area: "Elmina",
		duty: "On duty",
		shift: "10:00 – 14:00"
	},
	{
		name: "Yaw Appiah",
		role: "Caregiver",
		area: "Tema",
		duty: "Scheduled",
		shift: "11:30 – 15:30"
	},
	{
		name: "Adwoa Serwaa",
		role: "Home Care Assistant",
		area: "Accra",
		duty: "Off today",
		shift: "Rest day"
	}
];
var PLANS = [
	{
		client: "Mrs. Grace Mensah",
		focus: "Washing, dressing, breakfast",
		review: "18 Nov 2026",
		owner: "Ama Kusi"
	},
	{
		client: "Mr. Daniel Asare",
		focus: "Dressing change and observation",
		review: "12 Nov 2026",
		owner: "Esi Owusu"
	},
	{
		client: "Madam Abena Ofori",
		focus: "Conversation, walk, lunch",
		review: "2 Dec 2026",
		owner: "Kwame Agyeman"
	},
	{
		client: "Mr. Joseph Tetteh",
		focus: "Prompted medication, check-in",
		review: "9 Nov 2026",
		owner: "Yaw Appiah"
	}
];
var VISITS = [
	{
		caregiver: "Ama Kusi",
		client: "Mrs. Grace Mensah",
		type: "Personal care",
		time: "08:00 – 10:00",
		status: "In progress"
	},
	{
		caregiver: "Esi Owusu",
		client: "Mr. Daniel Asare",
		type: "Nursing visit",
		time: "09:30 – 11:00",
		status: "In progress"
	},
	{
		caregiver: "Kwame Agyeman",
		client: "Madam Abena Ofori",
		type: "Companionship",
		time: "10:00 – 12:00",
		status: "Upcoming"
	},
	{
		caregiver: "Yaw Appiah",
		client: "Mr. Joseph Tetteh",
		type: "Medication support",
		time: "11:30 – 12:30",
		status: "Upcoming"
	},
	{
		caregiver: "Ama Kusi",
		client: "Auntie Efua Badu",
		type: "Personal care",
		time: "14:00 – 16:00",
		status: "Upcoming"
	}
];
var INVOICES = [
	{
		id: "INV-1048",
		client: "Mensah household",
		amount: "GHS 1,280",
		status: "Paid",
		due: "2 Nov 2026"
	},
	{
		id: "INV-1049",
		client: "Asare family",
		amount: "GHS 960",
		status: "Sent",
		due: "14 Nov 2026"
	},
	{
		id: "INV-1050",
		client: "Ofori household",
		amount: "GHS 640",
		status: "Draft",
		due: "20 Nov 2026"
	},
	{
		id: "INV-1051",
		client: "Tetteh family",
		amount: "GHS 420",
		status: "Sent",
		due: "18 Nov 2026"
	}
];
var THREADS = [
	{
		from: "Ama Kusi",
		topic: "Mrs. Mensah finished breakfast late",
		time: "07:58",
		unread: true
	},
	{
		from: "Esi Owusu",
		topic: "Dressing visit may run 20 minutes over",
		time: "09:12",
		unread: true
	},
	{
		from: "Recruitment",
		topic: "Nana Akua Boateng is ready for screening",
		time: "Yesterday",
		unread: false
	},
	{
		from: "Finance",
		topic: "October caregiver payouts are prepared",
		time: "Yesterday",
		unread: false
	}
];
var REPORT_ROWS = [
	{
		label: "Personal care",
		value: 46
	},
	{
		label: "Companionship",
		value: 28
	},
	{
		label: "Nursing visits",
		value: 18
	},
	{
		label: "Medication support",
		value: 12
	}
];
function initials(name) {
	return name.split(" ").filter((part) => part && part !== "Mrs." && part !== "Mr." && part !== "Madam" && part !== "Auntie").slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "").join("");
}
function sectionTitle(section) {
	return NAV.find((item) => item.id === section)?.label ?? "Overview";
}
//#endregion
//#region node_modules/.nitro/vite/services/ssr/assets/router-BVrpZvEH.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var __defProp = Object.defineProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
var FALLBACK_MESSAGE = "An unexpected error occurred. Try reloading the page.";
function errorMessage(error) {
	if (error instanceof Error && error.message) return error.message;
	if (typeof error === "string" && error) return error;
	return FALLBACK_MESSAGE;
}
function AppErrorComponent({ error }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-red-500",
				"aria-hidden": "true",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
					className: "size-10",
					strokeWidth: 2
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-lg font-semibold",
				children: "Something went wrong"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "max-w-md text-sm break-words text-zinc-500 dark:text-zinc-400",
				children: errorMessage(error)
			})
		]
	});
}
/**
* Path-based preview hosts serve the dev server under `/{port_id}/` and strip
* that prefix before forwarding, so SSR sees `/` while the browser URL keeps the
* prefix. TanStack Start resets `basepath` on hydration, so a `rewrite` keeps
* client routing and generated links aligned with the public URL.
*/
var PATH_BASED_PREVIEW_HOSTS = /* @__PURE__ */ new Set([
	"preview.grok.genai.mil",
	"preview.grok.mil",
	"preview.grokgsac.com"
]);
var PORT_ID_PREFIX = /^\/hds-[a-z0-9]+-\d+-[a-z0-9]+(?=\/|$)/i;
function previewPathPrefix(hostname, pathname) {
	if (!PATH_BASED_PREVIEW_HOSTS.has(hostname.toLowerCase())) return void 0;
	return PORT_ID_PREFIX.exec(pathname)?.[0];
}
function prefixRewrite(prefix) {
	return {
		input: ({ url }) => {
			if (url.pathname === prefix) url.pathname = "/";
			else if (url.pathname.startsWith(`${prefix}/`)) url.pathname = url.pathname.slice(prefix.length);
			return url;
		},
		output: ({ url }) => {
			url.pathname = `${prefix}${url.pathname}`;
			return url;
		}
	};
}
function previewPathRewrite() {
	if (typeof window === "undefined") return void 0;
	const prefix = previewPathPrefix(window.location.hostname, window.location.pathname);
	return prefix ? prefixRewrite(prefix) : void 0;
}
/**
* App-wide client provider mounted once near the root (in `src/routes/__root.tsx`):
*
*   <AuthProvider><Outlet /></AuthProvider>
*
* Better Auth's React client (`@/lib/auth/client`) needs NO context provider —
* its `useSession()` works standalone — so this is a passthrough today. It's
* kept as the single, stable mount point for any future client-side providers
* (e.g. a toast or theme provider) without churning the root shell.
*/
function AuthProvider({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children });
}
var CONNECTOR_TOKEN_READY_EVENT = "grok:connector-token-ready";
function isGrokEmbedderOrigin(origin) {
	try {
		const url = new URL(origin);
		if (url.protocol !== "https:" && url.protocol !== "http:") return false;
		const host = url.hostname.toLowerCase();
		if (host === "grok.com" || host.endsWith(".grok.com")) return true;
		if (host === "localhost" || host === "127.0.0.1" || host === "[::1]") return true;
		return false;
	} catch {
		return false;
	}
}
function isSandboxPreviewGuestHost(hostname) {
	const host = hostname.toLowerCase();
	return host === "grok-sandbox.com" || host.endsWith(".grok-sandbox.com");
}
function isRemintPreviewPair(guestHost, parentHost) {
	const guest = guestHost.toLowerCase();
	const parent = parentHost.toLowerCase();
	const i = guest.indexOf(".preview.");
	if (i <= 0) return false;
	const label = guest.slice(0, i);
	const rest = guest.slice(i + 9);
	if (label.includes(".") || !rest.includes(".")) return false;
	return parent === rest || parent === `grok.${rest}`;
}
function resolveParentEmbedderOrigin(parentIsSelf, referrer, ancestorOrigin, guestHostname = "") {
	if (parentIsSelf) return null;
	for (const candidate of [referrer, ancestorOrigin ?? ""].filter(Boolean)) try {
		const url = new URL(candidate.includes("://") ? candidate : `https://${candidate}`);
		if (url.protocol !== "https:" && url.protocol !== "http:") continue;
		if (isGrokEmbedderOrigin(url.origin)) return url.origin;
		if (isSandboxPreviewGuestHost(guestHostname) || isRemintPreviewPair(guestHostname, url.hostname)) return url.origin;
	} catch {}
	return null;
}
/**
* Guest side of the grok-web ↔ sandbox preview postMessage bridge.
*
* Activates only when this page is framed by an allowlisted Grok embedder.
* Top-level runs (download/export, local `npm run dev`, deployed sites) noop.
*/
var PREVIEW_BRIDGE_CHANNEL = "grok-preview-bridge";
var EnvelopeSchema = object({
	channel: literal(PREVIEW_BRIDGE_CHANNEL),
	version: number().int().positive(),
	type: string().min(1)
});
var HelloSchema = EnvelopeSchema.extend({ type: literal("hello") });
var NavigateSchema = EnvelopeSchema.extend({
	type: literal("navigate"),
	path: string().min(1)
});
var HistorySchema = EnvelopeSchema.extend({
	type: literal("history"),
	delta: union([literal(-1), literal(1)])
});
var ConnectorTokenReadySchema = EnvelopeSchema.extend({ type: literal("connector-token-ready") });
function isSafeBridgePath(path) {
	if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\")) return false;
	try {
		return new URL(path, "https://preview.invalid").origin === "https://preview.invalid";
	} catch {
		return false;
	}
}
/**
* Origin of the Grok embedder framing this page, or null when the page runs
* top-level (download/export, local `npm run dev`, deployed sites) or under a
* non-Grok parent. Client-only; null during SSR.
*/
function resolveCurrentEmbedderOrigin() {
	if (typeof window === "undefined") return null;
	const ancestorOrigin = typeof location.ancestorOrigins !== "undefined" && location.ancestorOrigins.length > 0 ? location.ancestorOrigins[0] : null;
	return resolveParentEmbedderOrigin(window.parent === window, document.referrer, ancestorOrigin, window.location.hostname);
}
/**
* Install host↔guest messaging. Returns a dispose function.
* Noops (returns a no-op dispose) when not embedded under a Grok parent.
*/
function installPreviewHostBridge(options = {}) {
	const parentOrigin = resolveCurrentEmbedderOrigin();
	if (parentOrigin === null) return () => {};
	const ROOT_STATE_KEY = "__grokPreviewBridgeRoot";
	const originalPushState = window.history.pushState.bind(window.history);
	const originalReplaceState = window.history.replaceState.bind(window.history);
	const isAtHistoryRoot = () => {
		const state = window.history.state;
		return Boolean(state && typeof state === "object" && state[ROOT_STATE_KEY] === true);
	};
	try {
		const current = window.history.state;
		if (!(current !== null && typeof current === "object" && Object.prototype.hasOwnProperty.call(current, ROOT_STATE_KEY))) {
			const isRoot = window.history.length <= 1;
			originalReplaceState(current && typeof current === "object" ? {
				...current,
				[ROOT_STATE_KEY]: isRoot
			} : { [ROOT_STATE_KEY]: isRoot }, "", window.location.href);
		}
	} catch {}
	const post = (message) => {
		window.parent.postMessage(message, parentOrigin);
	};
	const reportLocation = () => {
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "location",
			path: window.location.pathname || "/",
			search: window.location.search,
			hash: window.location.hash
		});
	};
	const reportRoutes = () => {
		const paths = options.getRoutePaths?.() ?? [];
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "routes",
			paths
		});
	};
	const defaultNavigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		try {
			const url = new URL(path, window.location.origin);
			if (url.origin !== window.location.origin) return;
			const next = `${url.pathname}${url.search}${url.hash}`;
			window.history.pushState(window.history.state, "", next);
			window.dispatchEvent(new PopStateEvent("popstate", { state: window.history.state }));
		} catch {}
	};
	const navigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		if (options.navigate) {
			options.navigate(path);
			return;
		}
		defaultNavigate(path);
	};
	const announce = () => {
		reportLocation();
		reportRoutes();
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "ready"
		});
	};
	const onHello = (data) => {
		if (!HelloSchema.safeParse(data).success) return;
		announce();
	};
	const onNavigate = (data) => {
		const parsed = NavigateSchema.safeParse(data);
		if (!parsed.success) return;
		navigate(parsed.data.path);
		queueMicrotask(reportLocation);
	};
	const onHistory = (data) => {
		const parsed = HistorySchema.safeParse(data);
		if (!parsed.success) return;
		if (parsed.data.delta === -1 && isAtHistoryRoot()) return;
		window.history.go(parsed.data.delta);
	};
	const onConnectorTokenReady = (data) => {
		if (!ConnectorTokenReadySchema.safeParse(data).success) return;
		window.dispatchEvent(new Event(CONNECTOR_TOKEN_READY_EVENT));
	};
	const hostMessageHandlers = /* @__PURE__ */ new Map([
		["hello", onHello],
		["navigate", onNavigate],
		["history", onHistory],
		["connector-token-ready", onConnectorTokenReady]
	]);
	const onMessage = (event) => {
		if (event.source !== window.parent) return;
		if (event.origin !== parentOrigin) return;
		const envelope = EnvelopeSchema.safeParse(event.data);
		if (!envelope.success || envelope.data.version !== 1) return;
		hostMessageHandlers.get(envelope.data.type)?.(event.data);
	};
	const onPopState = () => {
		reportLocation();
	};
	const onHashChange = () => {
		reportLocation();
	};
	window.history.pushState = (data, unused, url) => {
		const next = data && typeof data === "object" ? {
			...data,
			[ROOT_STATE_KEY]: false
		} : data;
		originalPushState(next, unused, url);
		reportLocation();
	};
	window.history.replaceState = (data, unused, url) => {
		const next = isAtHistoryRoot() ? {
			...data && typeof data === "object" ? data : {},
			[ROOT_STATE_KEY]: true
		} : data;
		originalReplaceState(next, unused, url);
		reportLocation();
	};
	window.addEventListener("message", onMessage);
	window.addEventListener("popstate", onPopState);
	window.addEventListener("hashchange", onHashChange);
	announce();
	return () => {
		window.removeEventListener("message", onMessage);
		window.removeEventListener("popstate", onPopState);
		window.removeEventListener("hashchange", onHashChange);
		window.history.pushState = originalPushState;
		window.history.replaceState = originalReplaceState;
	};
}
/** Collect static path patterns from a TanStack route tree (best-effort). */
function collectRoutePathsFromTree(routeTree) {
	const paths = /* @__PURE__ */ new Set();
	const walk = (node) => {
		if (!node || typeof node !== "object") return;
		const record = node;
		const full = typeof record.fullPath === "string" ? record.fullPath : typeof record.path === "string" ? record.path : null;
		if (full !== null && full !== "") paths.add(full.startsWith("/") ? full : `/${full}`);
		else if (full === "") paths.add("/");
		const children = record.children;
		if (Array.isArray(children)) for (const child of children) walk(child);
		else if (children && typeof children === "object") for (const child of Object.values(children)) walk(child);
	};
	walk(routeTree);
	return [...paths];
}
/**
* Mount once in `__root.tsx` so the Grok preview chrome can drive navigation
* (and later receive registered routes). Noops when the app is not embedded.
*/
function PreviewHostBridge() {
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		return installPreviewHostBridge({
			navigate: (path) => {
				router.history.push(path);
			},
			getRoutePaths: () => collectRoutePathsFromTree(router.routeTree)
		});
	}, [router]);
	return null;
}
var styles_default = "/assets/styles-CoFue43_.css";
var Route$4 = createRootRoute({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: "CareBridge" },
			{
				name: "theme-color",
				content: "#0c3354"
			},
			{
				name: "description",
				content: "CareBridge helps home-care teams recruit caregivers and run day-to-day care operations."
			}
		],
		links: [
			{
				rel: "icon",
				type: "image/svg+xml",
				href: "/favicon.svg"
			},
			{
				rel: "preconnect",
				href: "https://fonts.googleapis.com"
			},
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous"
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,560;9..144,680&family=Source+Sans+3:wght@400;500;600;700&display=swap"
			},
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "manifest",
				href: "/__grok/manifest.webmanifest"
			},
			{
				rel: "apple-touch-icon",
				href: "/__grok/icon-180.png"
			}
		]
	}),
	component: () => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "en",
		suppressHydrationWarning: true,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PreviewHostBridge, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})
		] })]
	})
});
var $$splitComponentImporter$3 = () => import("./routes-DJOCVrf_.mjs");
var Route$3 = createFileRoute("/")({
	component: lazyRouteComponent($$splitComponentImporter$3, "component"),
	head: () => ({ meta: [{ title: "CareBridge Careers — Make a difference every day" }, {
		name: "description",
		content: "Apply to join CareBridge home care in Ghana. Browse open roles and send a caregiver application by email."
	}] })
});
var $$splitComponentImporter$2 = () => import("./admin-rRckGftk.mjs");
var Route$2 = createFileRoute("/admin")({ component: lazyRouteComponent($$splitComponentImporter$2, "component") });
var $$splitComponentImporter$1 = () => import("./admin.index-gYRJrMBt.mjs");
var Route$1 = createFileRoute("/admin/")({
	validateSearch: (search) => {
		const value = search.section;
		if (typeof value === "string" && SECTIONS.includes(value)) return { section: value };
		return { section: "overview" };
	},
	component: lazyRouteComponent($$splitComponentImporter$1, "component"),
	head: () => ({ meta: [{ title: "Workspace — CareBridge" }] })
});
var $$splitComponentImporter = () => import("./admin.login-8gD6tM68.mjs");
var Route = createFileRoute("/admin/login")({
	component: lazyRouteComponent($$splitComponentImporter, "component"),
	head: () => ({ meta: [{ title: "Admin sign-in — CareBridge" }] })
});
var IndexRoute = Route$3.update({
	id: "/",
	path: "/",
	getParentRoute: () => Route$4
});
var AdminRoute = Route$2.update({
	id: "/admin",
	path: "/admin",
	getParentRoute: () => Route$4
});
var AdminIndexRoute = Route$1.update({
	id: "/",
	path: "/",
	getParentRoute: () => AdminRoute
});
var AdminRouteChildren = {
	AdminLoginRoute: Route.update({
		id: "/login",
		path: "/login",
		getParentRoute: () => AdminRoute
	}),
	AdminIndexRoute
};
var rootRouteChildren = {
	IndexRoute,
	AdminRoute: AdminRoute._addFileChildren(AdminRouteChildren)
};
var routeTree = Route$4._addFileChildren(rootRouteChildren)._addFileTypes();
var router_exports = /* @__PURE__ */ __exportAll({ getRouter: () => getRouter });
function getRouter() {
	return createRouter({
		routeTree,
		rewrite: previewPathRewrite(),
		defaultErrorComponent: AppErrorComponent
	});
}
//#endregion
export { initials as _, CAREGIVERS as a, JOBS as c, PLANS as d, REPORT_ROWS as f, VISITS as g, THREADS as h, CANDIDATES as i, NAV as l, STAGES as m, Route$1 as n, CLIENTS as o, ROLES as p, AREAS as r, INVOICES as s, router_exports as t, NAV_GROUPS as u, sectionTitle as v };
