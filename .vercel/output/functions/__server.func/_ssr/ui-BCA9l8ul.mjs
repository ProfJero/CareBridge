import { S as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { m as HeartHandshake } from "../_libs/lucide-react.mjs";
import { t as clsx } from "../_libs/clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ui-BCA9l8ul.js
var import_jsx_runtime = require_jsx_runtime();
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
function LogoMark({ className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("grid size-11 shrink-0 place-items-center rounded-xl bg-sea text-on-sea", className),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeartHandshake, {
			className: "size-6",
			"aria-hidden": true
		})
	});
}
function Wordmark({ light = false, kicker = "Home care" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: "flex min-w-0 items-center gap-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogoMark, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "min-w-0",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: cn("block truncate font-display text-xl leading-none font-semibold", light ? "text-on-navy" : "text-ink"),
				children: "CareBridge"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: cn("mt-1 block text-sm font-semibold tracking-widest uppercase", light ? "text-navy-muted" : "text-sea"),
				children: kicker
			})]
		})]
	});
}
function Panel({ className, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		className: cn("rounded-2xl border border-line bg-card p-5 sm:p-6", className),
		children
	});
}
function Field({ label, hint, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "grid gap-2 text-base font-semibold text-ink",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: label }),
			children,
			hint ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-sm font-medium text-faint",
				children: hint
			}) : null
		]
	});
}
var controlClass = "h-12 w-full rounded-xl border border-line bg-card px-3.5 text-base font-medium text-ink placeholder:font-normal placeholder:text-faint focus:border-sea";
function Button({ tone = "primary", className, type = "button", ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type,
		className: cn("inline-flex h-12 items-center justify-center gap-2 rounded-xl px-4 text-base font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50", tone === "primary" && "bg-sea text-on-sea hover:bg-sea-2", tone === "secondary" && "border border-line bg-card text-navy hover:bg-sky", tone === "ghost" && "text-sea hover:bg-mint", className),
		...props
	});
}
function StatusPill({ children, tone = "neutral" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold", tone === "sea" && "bg-mint text-sea-2", tone === "navy" && "bg-sky text-navy", tone === "neutral" && "bg-paper text-muted"),
		children
	});
}
//#endregion
export { Wordmark as a, StatusPill as i, Field as n, cn as o, Panel as r, controlClass as s, Button as t };
