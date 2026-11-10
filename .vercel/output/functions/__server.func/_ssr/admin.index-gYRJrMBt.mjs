import { i as __toESM } from "../_runtime.mjs";
import { J as require_react, S as require_jsx_runtime, b as useNavigate, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { C as BadgeCheck, D as Activity, S as Bell, T as ArrowRight, _ as Clock3, a as ShieldCheck, b as CalendarDays, c as Plus, d as MapPin, f as LogOut, h as FileText, l as MessageSquare, m as HeartHandshake, n as Wallet, o as Settings, p as LayoutDashboard, r as Users, s as Search, t as X, u as Menu, v as ClipboardList, w as ArrowUpRight, x as BriefcaseBusiness } from "../_libs/lucide-react.mjs";
import { _ as initials, a as CAREGIVERS, c as JOBS, d as PLANS, f as REPORT_ROWS, g as VISITS, h as THREADS, i as CANDIDATES, l as NAV, m as STAGES, n as Route$1, o as CLIENTS, s as INVOICES, u as NAV_GROUPS, v as sectionTitle } from "./router-BVrpZvEH.mjs";
import { a as Wordmark, i as StatusPill, o as cn, r as Panel, s as controlClass, t as Button } from "./ui-BCA9l8ul.mjs";
import { r as readSubmittedApplications, t as APPLICATION_INBOX } from "./application-inbox-CJtu-P2W.mjs";
import { i as isDemoSignedIn, n as DEMO_PASSWORD, o as signOutDemo, t as DEMO_EMAIL } from "./demo-session-C0yBcM9A.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin.index-gYRJrMBt.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Overview({ query, onSection }) {
	const [submitted, setSubmitted] = (0, import_react.useState)([]);
	(0, import_react.useEffect)(() => {
		setSubmitted(readSubmittedApplications());
	}, []);
	const q = query.trim().toLowerCase();
	const visits = VISITS.filter((visit) => !q || `${visit.caregiver} ${visit.client} ${visit.type}`.toLowerCase().includes(q));
	const applications = [...submitted.map((item) => ({
		name: item.name,
		role: item.role,
		when: "Just submitted",
		status: "New"
	})), ...CANDIDATES.slice(0, 3).map((item) => ({
		name: item.name,
		role: item.role,
		when: item.date,
		status: item.stage
	}))].filter((item) => !q || `${item.name} ${item.role}`.toLowerCase().includes(q));
	const stats = [
		{
			label: "Active clients",
			value: "128",
			note: "+12 this month",
			icon: Users
		},
		{
			label: "Caregivers on duty",
			value: "46",
			note: "4 more than yesterday",
			icon: HeartHandshake
		},
		{
			label: "Today's visits",
			value: "34",
			note: "8 still to start",
			icon: CalendarDays
		},
		{
			label: "Applications waiting",
			value: String(19 + submitted.length),
			note: "Includes new emails",
			icon: BriefcaseBusiness
		}
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-4 sm:grid-cols-2 xl:grid-cols-4",
				children: stats.map((stat) => {
					const Icon = stat.icon;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
						className: "p-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-start justify-between gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-base font-semibold text-muted",
									children: stat.label
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "grid size-11 place-items-center rounded-xl bg-mint text-sea",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
										className: "size-5",
										"aria-hidden": true
									})
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-3 text-4xl font-semibold tabular-nums text-ink",
								children: stat.value
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-base text-faint",
								children: stat.note
							})
						]
					}, stat.label);
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-5 xl:grid-cols-[1.6fr_1fr]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-2xl font-semibold",
							children: "Today's visits"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-base text-muted",
							children: "Who is with which client, and whether the visit has started."
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => onSection("schedule"),
							className: "inline-flex h-11 items-center gap-1 text-base font-semibold text-sea",
							children: ["Schedule ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpRight, { className: "size-4" })]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-5 grid grid-cols-3 gap-3 rounded-2xl bg-paper p-4 text-center",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-2xl font-semibold tabular-nums",
								children: "18"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-base text-muted",
								children: "Completed"
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-2xl font-semibold tabular-nums text-sea",
								children: "8"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-base text-muted",
								children: "In progress"
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-2xl font-semibold tabular-nums text-navy",
								children: "8"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-base text-muted",
								children: "Upcoming"
							})] })
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
						className: "mt-4 divide-y divide-line",
						children: [visits.map((visit) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex flex-wrap items-center gap-3 py-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "grid size-11 place-items-center rounded-full bg-sky text-sm font-bold text-navy",
									children: initials(visit.caregiver)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "min-w-0 flex-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "block text-lg font-semibold",
										children: visit.caregiver
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "block text-base text-muted",
										children: [
											visit.client,
											" · ",
											visit.type
										]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-base tabular-nums text-faint",
									children: visit.time
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusPill, {
									tone: visit.status === "In progress" ? "sea" : "navy",
									children: visit.status
								})
							]
						}, `${visit.caregiver}-${visit.time}`)), visits.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
							className: "py-8 text-center text-lg text-muted",
							children: "No visits match that search."
						}) : null]
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-2xl font-semibold",
						children: "Recent applications"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-base text-muted",
						children: "Newest caregiver applications, including ones sent from the careers page on this browser."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
						className: "mt-4 divide-y divide-line",
						children: [applications.slice(0, 5).map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
							className: "py-4",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-start justify-between gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-lg font-semibold",
									children: item.name
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-base text-muted",
									children: [
										item.role,
										" · ",
										item.when
									]
								})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusPill, {
									tone: item.status === "New" ? "navy" : "sea",
									children: item.status
								})]
							})
						}, `${item.name}-${item.when}`)), applications.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
							className: "py-8 text-center text-lg text-muted",
							children: "No applications match that search."
						}) : null]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => onSection("recruitment"),
						className: "mt-2 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-line text-base font-semibold text-sea",
						children: ["Review applications ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpRight, { className: "size-4" })]
					})
				] })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-5 lg:grid-cols-[1.4fr_0.8fr]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-2xl font-semibold",
					children: "Quick actions"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-4 grid gap-3 sm:grid-cols-2",
					children: [
						[
							"Add a client",
							"Register someone who needs care",
							"clients",
							Plus
						],
						[
							"Schedule a visit",
							"Match a caregiver to a client",
							"schedule",
							CalendarDays
						],
						[
							"Review applicants",
							"Continue hiring",
							"recruitment",
							BriefcaseBusiness
						],
						[
							"Open a care plan",
							"Write goals and tasks",
							"plans",
							ClipboardListIcon
						]
					].map(([label, hint, target, Icon]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => onSection(target),
						className: "flex min-h-24 items-start gap-3 rounded-2xl border border-line p-4 text-left hover:border-sea hover:bg-mint/40",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "grid size-11 shrink-0 place-items-center rounded-xl bg-sky text-navy",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
								className: "size-5",
								"aria-hidden": true
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block text-lg font-semibold",
							children: label
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mt-1 block text-base text-muted",
							children: hint
						})] })]
					}, label))
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-2xl font-semibold",
						children: "Visit completion"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-base text-muted",
						children: "Share of this week's visits finished on the planned day."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-6 flex items-center gap-5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid size-28 place-items-center rounded-full",
							style: { background: "conic-gradient(#0e7c66 0 94%, #e7f1f8 94% 100%)" },
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "grid size-20 place-items-center rounded-full bg-card text-2xl font-semibold",
								children: "94%"
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-lg leading-relaxed text-muted",
							children: "On track for the sample week. Clinical documentation is still being prepared and is not stored here."
						})]
					})
				] })]
			})
		]
	});
}
function ClipboardListIcon(props) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: "0 0 24 24",
		className: props.className,
		fill: "none",
		stroke: "currentColor",
		strokeWidth: "2",
		"aria-hidden": true,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
			x: "6",
			y: "4",
			width: "12",
			height: "16",
			rx: "2"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M9 4.5h6v2H9zM9 11h6M9 15h4" })]
	});
}
function Recruitment({ query }) {
	const [tab, setTab] = (0, import_react.useState)("Applications");
	const [candidates, setCandidates] = (0, import_react.useState)(CANDIDATES);
	const [stage, setStage] = (0, import_react.useState)("All stages");
	const [selected, setSelected] = (0, import_react.useState)(null);
	const [composer, setComposer] = (0, import_react.useState)(false);
	const [title, setTitle] = (0, import_react.useState)("");
	const [jobs, setJobs] = (0, import_react.useState)(JOBS);
	(0, import_react.useEffect)(() => {
		const incoming = readSubmittedApplications().map((item) => ({
			id: item.id,
			name: item.name,
			role: item.role,
			location: item.area,
			experience: item.experience || "Submitted from the careers page",
			date: "Just now",
			stage: "New",
			skills: [item.availability]
		}));
		setCandidates((current) => {
			const known = new Set(current.map((item) => item.id));
			return [...incoming.filter((item) => !known.has(item.id)), ...current];
		});
	}, []);
	const filtered = (0, import_react.useMemo)(() => candidates.filter((candidate) => {
		const hay = `${candidate.name} ${candidate.role} ${candidate.location}`.toLowerCase();
		const matchesQuery = !query.trim() || hay.includes(query.trim().toLowerCase());
		const matchesStage = stage === "All stages" || candidate.stage === stage;
		return matchesQuery && matchesStage;
	}), [
		candidates,
		query,
		stage
	]);
	function move(candidate, next) {
		setCandidates((items) => items.map((item) => item.id === candidate.id ? {
			...item,
			stage: next
		} : item));
		setSelected({
			...candidate,
			stage: next
		});
	}
	function publish() {
		if (!title.trim()) return;
		setJobs((items) => [{
			title: title.trim(),
			type: "Full-time",
			location: "Cape Coast",
			category: "Non-clinical care",
			summary: "Added in this sample workspace.",
			applicants: 0,
			status: "Published"
		}, ...items]);
		setTitle("");
		setComposer(false);
		setTab("Job openings");
	}
	const counts = STAGES.slice(0, 6).map((name) => ({
		name,
		count: candidates.filter((candidate) => candidate.stage === name).length
	}));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center justify-end gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/",
					className: "inline-flex h-12 items-center gap-2 rounded-xl border border-line bg-card px-4 text-base font-semibold text-navy",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, {
						className: "size-5",
						"aria-hidden": true
					}), "Preview careers page"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					onClick: () => setComposer(true),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, {
						className: "size-5",
						"aria-hidden": true
					}), "Create job opening"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-3 sm:grid-cols-2 xl:grid-cols-4",
				children: [
					[
						"Active openings",
						String(jobs.filter((job) => job.status === "Published").length),
						"Accepting applications"
					],
					[
						"Applications",
						String(candidates.length),
						"Seed records plus this browser"
					],
					[
						"Needs review",
						String(candidates.filter((item) => item.stage === "New" || item.stage === "Screening").length),
						"New and screening"
					],
					[
						"Interviews",
						String(candidates.filter((item) => item.stage === "Interview").length),
						"Ready to schedule"
					]
				].map(([label, value, note]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
					className: "p-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-base font-semibold text-muted",
							children: label
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-4xl font-semibold tabular-nums",
							children: value
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-base text-faint",
							children: note
						})
					]
				}, label))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex gap-2 overflow-auto border-b border-line",
				children: [
					"Applications",
					"Job openings",
					"Talent pool",
					"Interviews"
				].map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setTab(item),
					className: `h-12 shrink-0 border-b-2 px-3 text-base font-semibold ${tab === item ? "border-sea text-sea" : "border-transparent text-muted"}`,
					children: item
				}, item))
			}),
			tab === "Applications" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6",
					children: counts.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => setStage(item.name),
						className: "rounded-2xl border border-line bg-card px-4 py-3 text-left",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block text-sm font-semibold text-muted",
							children: item.name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mt-1 block text-2xl font-semibold tabular-nums",
							children: item.count
						})]
					}, item.name))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex flex-wrap gap-3",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "text-base font-semibold text-muted",
						children: ["Stage", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							className: `${controlClass} mt-1 h-12 sm:w-64`,
							value: stage,
							onChange: (event) => setStage(event.target.value),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "All stages" }), STAGES.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: item }, item))]
						})]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
					className: "p-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between border-b border-line px-5 py-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
							className: "text-xl font-semibold",
							children: [
								"Applicants (",
								filtered.length,
								")"
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-base text-faint",
							children: "Most recent first"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", { children: [filtered.map((candidate) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex flex-wrap items-center gap-3 border-b border-line px-5 py-4 last:border-0",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "grid size-12 place-items-center rounded-full bg-sky text-base font-bold text-navy",
								children: initials(candidate.name)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "min-w-[12rem] flex-1",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "block text-lg font-semibold",
										children: candidate.name
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "block text-base text-muted",
										children: candidate.role
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "mt-1 flex items-center gap-1 text-base text-faint",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, {
												className: "size-4",
												"aria-hidden": true
											}),
											candidate.location,
											" · ",
											candidate.date
										]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusPill, {
								tone: candidate.stage === "New" ? "navy" : "sea",
								children: candidate.stage
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => setSelected(candidate),
								className: "inline-flex h-11 items-center gap-1 text-base font-semibold text-sea",
								children: ["Review ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-4" })]
							})
						]
					}, candidate.id)), filtered.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
						className: "px-5 py-10 text-center text-lg text-muted",
						children: "No applicants match those filters."
					}) : null] })]
				})
			] }) : null,
			tab === "Job openings" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
				className: "p-0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between border-b border-line px-5 py-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
						className: "text-xl font-semibold",
						children: [
							"Job openings (",
							jobs.length,
							")"
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						onClick: () => setComposer(true),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }), " Add opening"]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", { children: jobs.filter((job) => !query.trim() || `${job.title} ${job.location}`.toLowerCase().includes(query.trim().toLowerCase())).map((job) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex flex-wrap items-center gap-3 border-b border-line px-5 py-4 last:border-0",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "grid size-12 place-items-center rounded-xl bg-mint text-sea",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BriefcaseBusiness, {
								className: "size-5",
								"aria-hidden": true
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "min-w-0 flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "block text-lg font-semibold",
								children: job.title
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "block text-base text-muted",
								children: [
									job.category,
									" · ",
									job.type,
									" · ",
									job.location
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-base text-muted",
							children: [job.applicants, " applicants"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusPill, {
							tone: job.status === "Published" ? "sea" : "neutral",
							children: job.status
						})
					]
				}, job.title)) })]
			}) : null,
			tab === "Talent pool" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
				className: "py-12 text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "mx-auto size-8 text-sea" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mt-4 text-2xl font-semibold",
						children: "Caregiver talent pool"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mx-auto mt-2 max-w-xl text-lg text-muted",
						children: "Consented profiles, skills and availability will live here after a hire decision. This sample does not store real candidate files."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						tone: "secondary",
						className: "mt-5",
						onClick: () => setTab("Applications"),
						children: "Review current applicants"
					})
				]
			}) : null,
			tab === "Interviews" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
				className: "py-12 text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarDays, { className: "mx-auto size-8 text-sea" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mt-4 text-2xl font-semibold",
						children: "Interview calendar"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mx-auto mt-2 max-w-xl text-lg text-muted",
						children: "Phone screens and panel times will be booked from a candidate's review. Kwesi Arthur is the only person currently at interview stage."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						tone: "secondary",
						className: "mt-5",
						onClick: () => {
							setStage("Interview");
							setTab("Applications");
						},
						children: "View interview-stage candidates"
					})
				]
			}) : null,
			composer ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "fixed inset-0 z-50 grid place-items-center bg-navy/50 p-4",
				onClick: () => setComposer(false),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "w-full max-w-lg rounded-3xl bg-card p-6",
					onClick: (event) => event.stopPropagation(),
					role: "dialog",
					"aria-modal": "true",
					"aria-labelledby": "job-title",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								id: "job-title",
								className: "text-2xl font-semibold",
								children: "Create a job opening"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "grid size-11 place-items-center rounded-xl bg-paper",
								onClick: () => setComposer(false),
								"aria-label": "Close",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-5" })
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "mt-5 grid gap-2 text-base font-semibold",
							children: ["Job title", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								className: controlClass,
								value: title,
								onChange: (event) => setTitle(event.target.value),
								placeholder: "e.g. Home Care Assistant"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-4 flex gap-2 rounded-2xl bg-mint px-4 py-3 text-base text-sea-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "mt-0.5 size-5 shrink-0" }), "Pay, shift pattern and qualifications can be added before a real publish. This only updates the sample list."]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-5 flex justify-end gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								tone: "secondary",
								onClick: () => setComposer(false),
								children: "Cancel"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								disabled: !title.trim(),
								onClick: publish,
								children: "Save and publish"
							})]
						})
					]
				})
			}) : null,
			selected ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "fixed inset-0 z-50 grid place-items-end bg-navy/50 p-0 sm:place-items-center sm:p-4",
				onClick: () => setSelected(null),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "max-h-[92vh] w-full overflow-auto rounded-t-3xl bg-card p-6 sm:max-w-lg sm:rounded-3xl",
					onClick: (event) => event.stopPropagation(),
					role: "dialog",
					"aria-modal": "true",
					"aria-labelledby": "candidate-title",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm font-bold tracking-widest text-sea uppercase",
								children: "Applicant profile"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "grid size-11 place-items-center rounded-xl bg-paper",
								onClick: () => setSelected(null),
								"aria-label": "Close",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-5" })
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							id: "candidate-title",
							className: "mt-2 text-3xl font-semibold",
							children: selected.name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 text-lg text-muted",
							children: [
								selected.role,
								" · ",
								selected.location
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-4 text-base leading-relaxed text-muted",
							children: [selected.experience, ". Skills are self-reported until a recruiter verifies them."]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-3 flex flex-wrap gap-2",
							children: selected.skills.map((skill) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "rounded-full bg-paper px-3 py-1 text-base text-navy",
								children: skill
							}, skill))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "mt-5 grid gap-2 text-base font-semibold",
							children: ["Current stage", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
								className: controlClass,
								value: selected.stage,
								onChange: (event) => move(selected, event.target.value),
								children: STAGES.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: item }, item))
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
							className: "mt-5 grid gap-3 text-base text-muted",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									className: "flex items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "size-5 text-sea" }), " Review CV and work history"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									className: "flex items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BadgeCheck, { className: "size-5 text-sea" }), " Verify registration where the role requires it"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									className: "flex items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "size-5 text-sea" }), " Take references before any offer"]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							className: "mt-6 w-full",
							onClick: () => setSelected(null),
							children: "Save review"
						})
					]
				})
			}) : null
		]
	});
}
function matches(query, text) {
	const q = query.trim().toLowerCase();
	return !q || text.toLowerCase().includes(q);
}
function WorkspaceSection({ section, query }) {
	if (section === "clients") {
		const rows = CLIENTS.filter((row) => matches(query, `${row.name} ${row.area} ${row.service}`));
		return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RecordList, {
			title: "Clients",
			hint: "People receiving care. These names are illustrative.",
			rows: rows.map((row) => ({
				title: row.name,
				meta: `${row.area} · ${row.service}`,
				extra: row.plan,
				status: row.status,
				tone: row.status === "Active" ? "sea" : "navy",
				mark: initials(row.name)
			}))
		});
	}
	if (section === "caregivers") {
		const rows = CAREGIVERS.filter((row) => matches(query, `${row.name} ${row.role} ${row.area}`));
		return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RecordList, {
			title: "Caregivers",
			hint: "Who is rostered today in the sample agency.",
			rows: rows.map((row) => ({
				title: row.name,
				meta: `${row.role} · ${row.area}`,
				extra: row.shift,
				status: row.duty,
				tone: row.duty === "On duty" ? "sea" : "neutral",
				mark: initials(row.name)
			}))
		});
	}
	if (section === "plans") {
		const rows = PLANS.filter((row) => matches(query, `${row.client} ${row.focus} ${row.owner}`));
		return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RecordList, {
			title: "Care plans",
			hint: "What each visit is trying to achieve. Plans are written by the care team, not generated here.",
			rows: rows.map((row) => ({
				title: row.client,
				meta: row.focus,
				extra: `Review ${row.review} · ${row.owner}`,
				status: "Active",
				tone: "sea",
				mark: initials(row.client)
			}))
		});
	}
	if (section === "schedule" || section === "visits") {
		const rows = VISITS.filter((row) => matches(query, `${row.caregiver} ${row.client} ${row.type}`));
		return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid gap-4",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-2xl font-semibold",
					children: section === "schedule" ? "Today’s schedule" : "Visits"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-base text-muted",
					children: "A single day in the sample roster, ordered by start time."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ol", {
					className: "mt-5 grid gap-3",
					children: [rows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "grid gap-2 rounded-2xl border border-line p-4 sm:grid-cols-[8rem_1fr_auto] sm:items-center",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-lg font-semibold tabular-nums text-navy",
								children: row.time
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "block text-lg font-semibold",
								children: row.client
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-base text-muted",
								children: [
									row.type,
									" · ",
									row.caregiver
								]
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusPill, {
								tone: row.status === "In progress" ? "sea" : "navy",
								children: row.status
							})
						]
					}, `${row.caregiver}-${row.time}`)), rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
						className: "py-8 text-center text-lg text-muted",
						children: "Nothing matches that search."
					}) : null]
				})
			] })
		});
	}
	if (section === "finance") {
		const rows = INVOICES.filter((row) => matches(query, `${row.id} ${row.client} ${row.status}`));
		return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RecordList, {
			title: "Invoices",
			hint: "Sample amounts in Ghana cedis. Nothing here is billed or collected.",
			rows: rows.map((row) => ({
				title: row.client,
				meta: `${row.id} · Due ${row.due}`,
				extra: row.amount,
				status: row.status,
				tone: row.status === "Paid" ? "sea" : row.status === "Sent" ? "navy" : "neutral",
				mark: "₵"
			}))
		});
	}
	if (section === "reports") {
		const max = Math.max(...REPORT_ROWS.map((row) => row.value));
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-2xl font-semibold",
				children: "Service mix this month"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-base text-muted",
				children: "Share of sample visits by service type. Not a clinical report."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-6 grid gap-4",
				children: REPORT_ROWS.filter((row) => matches(query, row.label)).map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-2 flex items-baseline justify-between text-lg",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-semibold",
						children: row.label
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "tabular-nums text-muted",
						children: [row.value, "%"]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "h-3 rounded-full bg-sky",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "h-3 rounded-full bg-sea",
						style: { width: `${row.value / max * 100}%` }
					})
				})] }, row.label))
			})
		] });
	}
	if (section === "messages") {
		const rows = THREADS.filter((row) => matches(query, `${row.from} ${row.topic}`));
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
			className: "p-0",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "border-b border-line px-5 py-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-2xl font-semibold",
					children: "Messages"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-base text-muted",
					children: "Coordinator notes from the sample day. Not a live inbox."
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", { children: [rows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: "border-b border-line px-5 py-4 last:border-0",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-lg font-semibold",
							children: row.from
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-base text-faint",
							children: row.time
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-base text-muted",
						children: row.topic
					}),
					row.unread ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mt-2 inline-block text-sm font-semibold text-sea",
						children: "Unread"
					}) : null
				]
			}, row.topic)), rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
				className: "px-5 py-10 text-center text-lg text-muted",
				children: "No messages match that search."
			}) : null] })]
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-4 lg:grid-cols-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-2xl font-semibold",
				children: "Demo sign-in"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-base leading-relaxed text-muted",
				children: "The administrator workspace opens with these sample credentials. It does not call Supabase, and it does not store staff accounts."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
				className: "mt-4 grid gap-3 rounded-2xl bg-paper p-4 text-base",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
						className: "text-muted",
						children: "Email"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
						className: "font-semibold",
						children: DEMO_EMAIL
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
						className: "text-muted",
						children: "Password"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
						className: "font-semibold",
						children: DEMO_PASSWORD
					})]
				})]
			})
		] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-2xl font-semibold",
				children: "Application delivery"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-2 text-base leading-relaxed text-muted",
				children: [
					"Caregiver applications are emailed with FormSubmit to ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
						className: "font-semibold text-ink",
						children: APPLICATION_INBOX
					}),
					". The first submission asks that inbox to confirm the address. After confirmation, each application arrives as its own email."
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-base leading-relaxed text-muted",
				children: "Organisation shown in this sample: Grace Home Care, covering Accra, Tema, Cape Coast and Elmina."
			})
		] })]
	});
}
function RecordList({ title, hint, rows }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
		className: "p-0",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "border-b border-line px-5 py-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-2xl font-semibold",
				children: title
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-base text-muted",
				children: hint
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", { children: [rows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
			className: "flex flex-wrap items-center gap-3 border-b border-line px-5 py-4 last:border-0",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "grid size-12 place-items-center rounded-full bg-sky text-base font-bold text-navy",
					children: row.mark
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "min-w-[12rem] flex-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "block text-lg font-semibold",
						children: row.title
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "block text-base text-muted",
						children: row.meta
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-base text-faint",
					children: row.extra
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusPill, {
					tone: row.tone,
					children: row.status
				})
			]
		}, `${row.title}-${row.meta}`)), rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
			className: "px-5 py-10 text-center text-lg text-muted",
			children: "Nothing matches that search."
		}) : null] })]
	});
}
var ICONS = {
	overview: LayoutDashboard,
	clients: Users,
	caregivers: HeartHandshake,
	plans: ClipboardList,
	schedule: CalendarDays,
	visits: Clock3,
	recruitment: BriefcaseBusiness,
	finance: Wallet,
	reports: Activity,
	messages: MessageSquare,
	settings: Settings
};
var NOTICES = [
	"Ama Kusi checked in for the Labone visit.",
	"Nana Akua Boateng applied for Registered Nurse.",
	"Two visits this afternoon are still unconfirmed."
];
function AdminApp({ section, onSection }) {
	const navigate = useNavigate();
	const [open, setOpen] = (0, import_react.useState)(false);
	const [query, setQuery] = (0, import_react.useState)("");
	const [notices, setNotices] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		setQuery("");
		setOpen(false);
		setNotices(false);
	}, [section]);
	function signOut() {
		signOutDemo();
		navigate({ to: "/admin/login" });
	}
	const title = section === "overview" ? "Good morning, Admin" : sectionTitle(section);
	const subtitle = section === "overview" ? "A sample view of Grace Home Care. Nothing here is a real client record." : `Sample ${sectionTitle(section).toLowerCase()} for the organisation workspace.`;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-paper text-ink",
		children: [
			open ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "fixed inset-0 z-30 bg-navy/50 lg:hidden",
				"aria-label": "Close navigation",
				onClick: () => setOpen(false)
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
				className: cn("fixed inset-y-0 left-0 z-40 flex w-72 flex-col bg-navy px-4 py-5 text-on-navy transition-transform lg:translate-x-0", open ? "translate-x-0" : "-translate-x-full"),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start justify-between gap-3 px-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wordmark, {
							light: true,
							kicker: "Administration"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "grid size-11 place-items-center lg:hidden",
							onClick: () => setOpen(false),
							"aria-label": "Close menu",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-5" })
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-5 rounded-2xl bg-navy-2 px-3 py-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-base font-semibold",
							children: "Grace Home Care"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-navy-muted",
							children: "Organisation workspace"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
						className: "mt-5 min-h-0 flex-1 overflow-auto pr-1",
						"aria-label": "Workspace",
						children: NAV_GROUPS.map((group) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mb-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "px-3 pb-2 text-sm font-bold tracking-widest text-navy-muted uppercase",
								children: group
							}), NAV.filter((item) => item.group === group).map((item) => {
								const Icon = ICONS[item.id];
								const active = section === item.id;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: () => onSection(item.id),
									className: cn("mb-1 flex h-12 w-full items-center gap-3 rounded-xl px-3 text-left text-base font-semibold", active ? "bg-white/10 text-on-navy" : "text-navy-muted hover:bg-white/5 hover:text-on-navy"),
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
											className: cn("size-5", active && "text-mint"),
											"aria-hidden": true
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "flex-1",
											children: item.label
										}),
										item.id === "recruitment" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "rounded-full bg-mint px-2 py-0.5 text-sm text-sea-2",
											children: "5"
										}) : null
									]
								}, item.id);
							})]
						}, group))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 border-t border-white/10 pt-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-3 px-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "grid size-11 place-items-center rounded-full bg-mint text-base font-bold text-sea-2",
								children: "AD"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "min-w-0 flex-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "block truncate text-base font-semibold",
									children: "Admin Demo"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "block text-sm text-navy-muted",
									children: "Sample administrator"
								})]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: signOut,
							className: "mt-3 flex h-12 w-full items-center gap-2 rounded-xl px-3 text-base font-semibold text-navy-muted hover:bg-white/5 hover:text-on-navy",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, {
								className: "size-5",
								"aria-hidden": true
							}), "Sign out"]
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "lg:pl-72",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
					className: "sticky top-0 z-20 flex h-20 items-center gap-3 border-b border-line bg-card px-4 sm:px-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "grid size-11 place-items-center rounded-xl text-navy lg:hidden",
							onClick: () => setOpen(true),
							"aria-label": "Open menu",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Menu, { className: "size-6" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "hidden text-base text-faint sm:block",
							children: [
								"Workspace ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "px-1",
									children: "/"
								}),
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
									className: "font-semibold text-ink",
									children: sectionTitle(section)
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "ml-auto flex items-center gap-2 sm:gap-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "flex h-12 min-w-0 flex-1 items-center gap-2 rounded-xl border border-line px-3 text-faint sm:max-w-xs sm:flex-none",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, {
										className: "size-5 shrink-0",
										"aria-hidden": true
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										value: query,
										onChange: (event) => setQuery(event.target.value),
										placeholder: "Search this page",
										"aria-label": "Search this page",
										className: "w-full min-w-0 bg-transparent text-base text-ink outline-none placeholder:text-faint"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "relative",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										className: "relative grid size-12 place-items-center rounded-xl border border-line text-navy",
										"aria-label": "Notifications",
										"aria-expanded": notices,
										onClick: () => setNotices((value) => !value),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { className: "size-5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute top-2 right-2 size-2.5 rounded-full bg-sea" })]
									}), notices ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "absolute right-0 mt-2 w-80 rounded-2xl border border-line bg-card p-3 shadow-sm",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "px-2 py-1 text-base font-semibold",
											children: "Sample notices"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
											className: "mt-1",
											children: NOTICES.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
												className: "rounded-xl px-2 py-2 text-base text-muted",
												children: item
											}, item))
										})]
									}) : null]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "hidden rounded-full bg-mint px-3 py-2 text-sm font-semibold text-sea-2 md:inline",
									children: "Sample data"
								})
							]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mb-6 flex flex-wrap items-end justify-between gap-4",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm font-bold tracking-widest text-sea uppercase",
									children: "Grace Home Care"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
									className: "mt-1 text-4xl font-semibold tracking-tight text-ink",
									children: title
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 max-w-2xl text-lg text-muted",
									children: subtitle
								})
							] })
						}),
						section === "overview" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Overview, {
							query,
							onSection
						}) : section === "recruitment" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Recruitment, { query }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WorkspaceSection, {
							section,
							query
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("footer", {
							className: "mt-8 flex flex-col gap-2 border-t border-line pt-4 text-base text-faint sm:flex-row sm:justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "© 2026 CareBridge · Home care management" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Sample workspace · Built by ProfJero" })]
						})
					]
				})]
			})
		]
	});
}
function AdminHome() {
	const { section } = Route$1.useSearch();
	const navigate = useNavigate({ from: "/admin/" });
	const [gate, setGate] = (0, import_react.useState)("pending");
	(0, import_react.useEffect)(() => {
		setGate(isDemoSignedIn() ? "in" : "out");
	}, []);
	(0, import_react.useEffect)(() => {
		if (gate === "out") navigate({ to: "/admin/login" });
	}, [gate, navigate]);
	if (gate !== "in") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", { className: "min-h-screen bg-paper" });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminApp, {
		section,
		onSection: (next) => {
			navigate({ search: { section: next } });
		}
	});
}
//#endregion
export { AdminHome as component };
