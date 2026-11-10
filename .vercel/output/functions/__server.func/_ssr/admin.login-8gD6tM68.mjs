import { i as __toESM } from "../_runtime.mjs";
import { J as require_react, S as require_jsx_runtime, b as useNavigate, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { T as ArrowRight, a as ShieldCheck } from "../_libs/lucide-react.mjs";
import { a as Wordmark, s as controlClass, t as Button } from "./ui-BCA9l8ul.mjs";
import { a as signInDemo, n as DEMO_PASSWORD, r as credentialsMatch, t as DEMO_EMAIL } from "./demo-session-C0yBcM9A.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin.login-8gD6tM68.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function AdminLogin() {
	const navigate = useNavigate();
	const [email, setEmail] = (0, import_react.useState)(DEMO_EMAIL);
	const [password, setPassword] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	function enter() {
		signInDemo();
		navigate({
			to: "/admin",
			search: { section: "overview" }
		});
	}
	function onSubmit(event) {
		event.preventDefault();
		setError("");
		setBusy(true);
		if (!credentialsMatch(email, password)) {
			setBusy(false);
			setError("Those details do not match the demo account. Use the credentials below, or continue with demo access.");
			return;
		}
		enter();
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "grid min-h-screen bg-paper lg:grid-cols-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "hidden flex-col justify-between bg-navy px-12 py-10 text-on-navy lg:flex",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wordmark, {
					light: true,
					kicker: "Administration"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "max-w-md font-display text-5xl leading-tight font-semibold",
					children: "The workspace for the people who organise care."
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-5 max-w-md text-lg leading-relaxed text-navy-muted",
					children: "Review visits, caregivers and applications for Grace Home Care. This sign-in opens a sample workspace — no live records, no extra setup."
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "flex items-center gap-2 text-base text-navy-muted",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, {
						className: "size-5 text-mint",
						"aria-hidden": true
					}), "Demo access is ready. You do not need a separate staff account."]
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "flex flex-col px-5 py-6 sm:px-10",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/",
					className: "text-base font-semibold text-navy",
					children: "← Careers"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "lg:hidden",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wordmark, { kicker: "Administration" })
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-bold tracking-widest text-sea uppercase",
						children: "CareBridge administration"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mt-3 font-display text-4xl font-semibold text-ink",
						children: "Welcome back"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-lg leading-relaxed text-muted",
						children: "Sign in to the sample management workspace. The demo account is filled in for you."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						className: "mt-8 grid gap-4",
						onSubmit,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "grid gap-2 text-base font-semibold",
								children: ["Email address", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "email",
									name: "email",
									autoComplete: "username",
									required: true,
									className: controlClass,
									value: email,
									onChange: (event) => setEmail(event.target.value)
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "grid gap-2 text-base font-semibold",
								children: ["Password", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "password",
									name: "password",
									autoComplete: "current-password",
									required: true,
									className: controlClass,
									value: password,
									onChange: (event) => setPassword(event.target.value),
									placeholder: "Enter the demo password"
								})]
							}),
							error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "rounded-xl bg-danger-bg px-4 py-3 text-base text-danger",
								children: error
							}) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								type: "submit",
								disabled: busy,
								children: [busy ? "Signing in…" : "Sign in", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, {
									className: "size-4",
									"aria-hidden": true
								})]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-5 rounded-2xl border border-line bg-mint/50 p-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-base font-semibold text-sea-2",
								children: "Demo credentials"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-2 flex justify-between gap-3 text-base text-ink",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-muted",
									children: "Email"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: DEMO_EMAIL })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-1 flex justify-between gap-3 text-base text-ink",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-muted",
									children: "Password"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: DEMO_PASSWORD })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								tone: "secondary",
								className: "mt-4 w-full bg-card",
								onClick: () => {
									setEmail(DEMO_EMAIL);
									setPassword(DEMO_PASSWORD);
									enter();
								},
								children: "Continue with demo access"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-3 text-sm leading-relaxed text-muted",
								children: "Opens sample information only. Real staff accounts are not required for this preview."
							})
						]
					})
				]
			})]
		})]
	});
}
//#endregion
export { AdminLogin as component };
