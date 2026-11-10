import { i as __toESM } from "../_runtime.mjs";
import { J as require_react, S as require_jsx_runtime, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { C as BadgeCheck, E as ArrowLeft, T as ArrowRight, _ as Clock3, a as ShieldCheck, d as MapPin, g as CloudUpload, x as BriefcaseBusiness, y as Check } from "../_libs/lucide-react.mjs";
import { c as JOBS, p as ROLES, r as AREAS } from "./router-BVrpZvEH.mjs";
import { a as Wordmark, n as Field, s as controlClass, t as Button } from "./ui-BCA9l8ul.mjs";
import { i as sendCaregiverApplication, n as makeReference } from "./application-inbox-CJtu-P2W.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-DJOCVrf_.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var steps = ["Your details", "Experience"];
function CareersPortal() {
	const [step, setStep] = (0, import_react.useState)(0);
	const [name, setName] = (0, import_react.useState)("");
	const [email, setEmail] = (0, import_react.useState)("");
	const [phone, setPhone] = (0, import_react.useState)("");
	const [role, setRole] = (0, import_react.useState)(ROLES[0]);
	const [area, setArea] = (0, import_react.useState)(AREAS[2]);
	const [experience, setExperience] = (0, import_react.useState)("");
	const [availability, setAvailability] = (0, import_react.useState)("Immediately");
	const [consent, setConsent] = (0, import_react.useState)(false);
	const [cv, setCv] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [reference, setReference] = (0, import_react.useState)("");
	const published = JOBS.filter((job) => job.status === "Published");
	function chooseRole(next) {
		setRole(next);
		setReference("");
		setStep(0);
		document.getElementById("apply")?.scrollIntoView({
			behavior: "smooth",
			block: "start"
		});
	}
	function continueForm(event) {
		event.preventDefault();
		setError("");
		if (name.trim().length < 3) return setError("Enter your full name.");
		if (!email.includes("@") || !email.includes(".")) return setError("Enter a valid email address.");
		if (phone.replace(/\D/g, "").length < 9) return setError("Enter a phone number we can reach you on.");
		setStep(1);
	}
	async function submit(event) {
		event.preventDefault();
		setError("");
		if (!consent) return setError("Please confirm that we may use your details to review this application.");
		if (cv && cv.size > 4194304) return setError("Please keep the CV under 4 MB, or send it later.");
		const ref = makeReference();
		setBusy(true);
		try {
			await sendCaregiverApplication({
				name,
				email,
				phone,
				role,
				area,
				experience,
				availability,
				cv
			}, ref);
			setReference(ref);
		} catch (err) {
			setError(err instanceof Error ? err.message : "The application could not be sent. Please try again.");
		} finally {
			setBusy(false);
		}
	}
	function reset() {
		setStep(0);
		setName("");
		setEmail("");
		setPhone("");
		setExperience("");
		setConsent(false);
		setCv(null);
		setError("");
		setReference("");
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-paper text-ink",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
				className: "sticky top-0 z-20 border-b border-line bg-card/95 backdrop-blur",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto flex h-20 max-w-6xl items-center justify-between gap-4 px-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: "#top",
						className: "min-w-0",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wordmark, {})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
						className: "flex items-center gap-2 sm:gap-4",
						"aria-label": "Careers",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
								href: "#roles",
								className: "hidden h-12 items-center px-2 text-base font-semibold text-navy sm:inline-flex",
								children: "Open roles"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
								href: "#apply",
								className: "hidden h-12 items-center px-2 text-base font-semibold text-navy md:inline-flex",
								children: "Apply"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/admin/login",
								className: "inline-flex h-12 items-center gap-2 rounded-xl bg-navy px-4 text-base font-semibold text-on-navy",
								children: ["Admin", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, {
									className: "size-4",
									"aria-hidden": true
								})]
							})
						]
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
				id: "top",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "mx-auto grid max-w-6xl items-center gap-10 px-5 py-12 md:grid-cols-[1.15fr_0.85fr] md:py-16",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm font-bold tracking-widest text-sea uppercase",
								children: "Careers"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
								className: "mt-3 font-display text-5xl leading-tight font-semibold text-ink md:text-6xl",
								children: ["Build a career around ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-sea",
									children: "making lives better."
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-5 max-w-xl text-lg leading-relaxed text-muted",
								children: "Join a home-care team in Ghana. Support people in their own homes — with daily living, companionship, or professional nursing — and know exactly what you are applying for."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-8 flex flex-wrap items-center gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
									href: "#apply",
									className: "inline-flex h-12 items-center gap-2 rounded-xl bg-sea px-5 text-base font-semibold text-on-sea",
									children: ["Apply to join us", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, {
										className: "size-4",
										"aria-hidden": true
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
									href: "#roles",
									className: "inline-flex h-12 items-center rounded-xl border border-line bg-card px-5 text-base font-semibold text-navy",
									children: "See open roles"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-5 flex items-center gap-2 text-base text-muted",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, {
									className: "size-5 text-sea",
									"aria-hidden": true
								}), "Short form. Clear next steps. Your details stay with the recruiting team."]
							})
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
							className: "rounded-3xl bg-navy p-6 text-on-navy sm:p-8",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm font-semibold tracking-widest text-navy-muted uppercase",
									children: "Open this week"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
									className: "mt-5 grid gap-3",
									children: published.map((job) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
										className: "rounded-2xl bg-navy-2 px-4 py-4",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-lg font-semibold",
											children: job.title
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "mt-1 text-base text-navy-muted",
											children: [
												job.location,
												" · ",
												job.type
											]
										})]
									}, job.title))
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-5 text-base text-navy-muted",
									children: "Sample openings for Grace Home Care. No real client records."
								})
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
						className: "border-y border-line bg-card",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mx-auto grid max-w-6xl gap-8 px-5 py-8 md:grid-cols-3",
							children: [
								["Meaningful work", "Spend your day with people who need practical, respectful support at home."],
								["A clear path", "Apply in two short steps. Interviews and credential checks come after, not before."],
								["A known team", "Work with coordinators who schedule visits, not a faceless job board."]
							].map(([title, copy]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "border-l-2 border-sea pl-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "text-lg font-semibold text-ink",
									children: title
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-base leading-relaxed text-muted",
									children: copy
								})]
							}, title))
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						id: "roles",
						className: "mx-auto max-w-6xl px-5 py-14",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-end justify-between gap-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm font-bold tracking-widest text-sea uppercase",
									children: "Opportunities"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "mt-2 font-display text-4xl font-semibold text-ink",
									children: "Find a role that fits you"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-3 max-w-2xl text-lg text-muted",
									children: "Clinical and non-clinical roles are listed separately, so a caregiver application never implies a nursing scope."
								})
							] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "rounded-full bg-mint px-4 py-2 text-base font-semibold text-sea-2",
								children: [published.length, " open roles"]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-8 grid gap-4 md:grid-cols-3",
							children: published.map((job) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
								className: "flex flex-col rounded-2xl border border-line bg-card p-5",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "grid size-12 place-items-center rounded-xl bg-mint text-sea",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BriefcaseBusiness, {
											className: "size-5",
											"aria-hidden": true
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-4 text-sm font-bold tracking-wide text-sea uppercase",
										children: job.category
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
										className: "mt-2 text-2xl font-semibold text-ink",
										children: job.title
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-2 flex-1 text-base leading-relaxed text-muted",
										children: job.summary
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-4 flex flex-wrap gap-x-4 gap-y-1 text-base text-faint",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "inline-flex items-center gap-1.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, {
												className: "size-4",
												"aria-hidden": true
											}), job.location]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "inline-flex items-center gap-1.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock3, {
												className: "size-4",
												"aria-hidden": true
											}), job.type]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										onClick: () => chooseRole(job.title),
										className: "mt-5 flex h-12 w-full items-center justify-between border-t border-line text-base font-semibold text-sea",
										children: ["Apply for this role", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, {
											className: "size-4",
											"aria-hidden": true
										})]
									})
								]
							}, job.title))
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
						className: "bg-navy text-on-navy",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
							className: "mx-auto grid max-w-6xl gap-6 px-5 py-10 md:grid-cols-3",
							children: [
								[
									"01",
									"Tell us who you are",
									"Name, contact, the role you want and where you can work."
								],
								[
									"02",
									"Share your experience",
									"A short note is enough. We ask for certificates only if the role needs them."
								],
								[
									"03",
									"We write back",
									"The recruiting team receives your application by email and follows up directly."
								]
							].map(([n, title, copy]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-display text-3xl text-mint",
									children: n
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "mt-2 text-xl font-semibold",
									children: title
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-base leading-relaxed text-navy-muted",
									children: copy
								})
							] }, n))
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						id: "apply",
						className: "mx-auto grid max-w-6xl gap-10 px-5 py-14 lg:grid-cols-[0.8fr_1.2fr]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm font-bold tracking-widest text-sea uppercase",
								children: "Your next chapter"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "mt-2 font-display text-4xl font-semibold text-ink",
								children: "Take the first step."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-4 text-lg leading-relaxed text-muted",
								children: "This form emails the CareBridge recruiting inbox. You will see a reference number as soon as it is sent."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								className: "mt-6 grid gap-3 text-base text-muted",
								children: [
									"Two short steps, comfortable on a phone",
									"You choose the role before you write about yourself",
									"Consent is asked in plain language"
								].map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									className: "flex items-start gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BadgeCheck, {
										className: "mt-0.5 size-5 shrink-0 text-sea",
										"aria-hidden": true
									}), item]
								}, item))
							})
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "rounded-3xl border border-line bg-card p-5 sm:p-7",
							children: reference ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "py-6 text-center",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "mx-auto grid size-14 place-items-center rounded-full bg-mint text-sea",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {
											className: "size-7",
											"aria-hidden": true
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-5 text-sm font-bold tracking-widest text-sea uppercase",
										children: "Application received"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
										className: "mt-2 font-display text-4xl font-semibold text-ink",
										children: [
											"Thank you, ",
											name.split(" ")[0],
											"."
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mx-auto mt-3 max-w-md text-lg leading-relaxed text-muted",
										children: [
											"Your application for ",
											role,
											" is on its way to the recruiting team. Keep this reference if you need to follow up."
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-5 text-base font-semibold text-navy",
										children: ["Reference ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "tabular-nums",
											children: reference
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										className: "mt-6",
										onClick: reset,
										children: "Submit another application"
									})
								]
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-end justify-between gap-4",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm font-bold tracking-widest text-sea uppercase",
										children: "Caregiver application"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
										className: "mt-1 text-2xl font-semibold text-ink",
										children: "Join our care team"
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "text-base font-semibold text-faint",
										children: [
											"Step ",
											step + 1,
											" of ",
											steps.length
										]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-4 h-2 rounded-full bg-paper",
									"aria-hidden": true,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "h-2 rounded-full bg-sea",
										style: { width: step === 0 ? "50%" : "100%" }
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-3 text-base text-muted",
									children: steps[step]
								}),
								step === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
									className: "mt-5 grid gap-4",
									onSubmit: continueForm,
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
											label: "Full name",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												name: "name",
												className: controlClass,
												value: name,
												onChange: (event) => setName(event.target.value),
												placeholder: "Enter your full name",
												autoComplete: "name",
												required: true
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "grid gap-4 sm:grid-cols-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
												label: "Email address",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
													name: "email",
													type: "email",
													className: controlClass,
													value: email,
													onChange: (event) => setEmail(event.target.value),
													placeholder: "you@example.com",
													autoComplete: "email",
													required: true
												})
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
												label: "Phone number",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
													name: "phone",
													type: "tel",
													className: controlClass,
													value: phone,
													onChange: (event) => setPhone(event.target.value),
													placeholder: "+233 …",
													autoComplete: "tel",
													required: true
												})
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "grid gap-4 sm:grid-cols-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
												label: "Role you want",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
													name: "role",
													className: controlClass,
													value: role,
													onChange: (event) => setRole(event.target.value),
													children: ROLES.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: item }, item))
												})
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
												label: "Where you can work",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
													name: "area",
													className: controlClass,
													value: area,
													onChange: (event) => setArea(event.target.value),
													children: AREAS.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: item }, item))
												})
											})]
										}),
										error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "rounded-xl bg-danger-bg px-4 py-3 text-base text-danger",
											children: error
										}) : null,
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "flex justify-end",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
												type: "submit",
												children: ["Continue", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, {
													className: "size-4",
													"aria-hidden": true
												})]
											})
										})
									]
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
									className: "mt-5 grid gap-4",
									onSubmit: submit,
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
											label: "Relevant experience",
											hint: "Training, previous clients, or why this work suits you.",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
												name: "experience",
												className: `${controlClass} h-32 py-3`,
												value: experience,
												onChange: (event) => setExperience(event.target.value),
												placeholder: "A few sentences is enough.",
												rows: 4
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
											label: "When can you start?",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
												name: "availability",
												className: controlClass,
												value: availability,
												onChange: (event) => setAvailability(event.target.value),
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Immediately" }),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Within 2 weeks" }),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Within a month" }),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Flexible / to be discussed" })
												]
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
											className: "grid cursor-pointer gap-2 rounded-2xl border border-dashed border-sea bg-mint/60 px-4 py-4 text-center",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "mx-auto text-sea",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CloudUpload, {
														className: "size-6",
														"aria-hidden": true
													})
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-base font-semibold text-ink",
													children: "CV or certificate, optional"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-sm text-muted",
													children: "PDF or Word, up to 4 MB. You can also send this later."
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
													name: "cv",
													type: "file",
													accept: ".pdf,.doc,.docx,application/pdf",
													className: "mx-auto max-w-full text-sm text-muted",
													onChange: (event) => setCv(event.target.files?.[0] ?? null)
												})
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
											className: "flex items-start gap-3 text-base leading-relaxed text-muted",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												name: "consent",
												type: "checkbox",
												className: "mt-1 size-5 accent-sea",
												checked: consent,
												onChange: (event) => setConsent(event.target.checked)
											}), "I agree that CareBridge may use these details to assess my application and contact me about this role."]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											type: "text",
											name: "_honey",
											className: "hidden",
											tabIndex: -1,
											autoComplete: "off"
										}),
										error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "rounded-xl bg-danger-bg px-4 py-3 text-base text-danger",
											children: error
										}) : null,
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center justify-between gap-3",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
												type: "button",
												onClick: () => {
													setError("");
													setStep(0);
												},
												className: "inline-flex h-12 items-center gap-2 text-base font-semibold text-muted",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, {
													className: "size-4",
													"aria-hidden": true
												}), "Back"]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
												type: "submit",
												disabled: busy || !consent,
												children: [busy ? "Sending…" : "Submit application", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, {
													className: "size-4",
													"aria-hidden": true
												})]
											})]
										})
									]
								})
							] })
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("footer", {
				className: "border-t border-line bg-card",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto flex max-w-6xl flex-col gap-3 px-5 py-6 text-base text-faint sm:flex-row sm:items-center sm:justify-between",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
							className: "font-display text-lg text-ink",
							children: "CareBridge"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Care that connects. People who make a difference." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "© 2026 CareBridge · Built by ProfJero" })
					]
				})
			})
		]
	});
}
var SplitComponent = CareersPortal;
//#endregion
export { SplitComponent as component };
