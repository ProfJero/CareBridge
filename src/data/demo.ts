export const SECTIONS = [
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
  "settings",
] as const;

export type Section = (typeof SECTIONS)[number];

export const NAV: { id: Section; label: string; group: string }[] = [
  { id: "overview", label: "Overview", group: "Workspace" },
  { id: "clients", label: "Clients", group: "Care operations" },
  { id: "caregivers", label: "Caregivers", group: "Care operations" },
  { id: "plans", label: "Care plans", group: "Care operations" },
  { id: "schedule", label: "Schedule", group: "Care operations" },
  { id: "visits", label: "Visits", group: "Care operations" },
  { id: "recruitment", label: "Recruitment", group: "People" },
  { id: "finance", label: "Finance", group: "Management" },
  { id: "reports", label: "Reports", group: "Management" },
  { id: "messages", label: "Messages", group: "Management" },
  { id: "settings", label: "Settings", group: "System" },
];

export const NAV_GROUPS = ["Workspace", "Care operations", "People", "Management", "System"];

export const ROLES = [
  "Home Care Assistant",
  "Registered Nurse",
  "Enrolled Nurse",
  "Caregiver",
  "Companion Caregiver",
  "Live-in Caregiver",
] as const;

export const AREAS = [
  "Accra",
  "Tema",
  "Cape Coast",
  "Elmina",
  "Mankessim",
  "Kumasi",
  "Central Region",
  "Flexible / several areas",
] as const;

export const JOBS = [
  {
    title: "Home Care Assistant",
    type: "Full-time",
    location: "Cape Coast",
    category: "Non-clinical care",
    summary: "Personal care, meals, mobility and companionship for clients at home.",
    applicants: 12,
    status: "Published" as const,
  },
  {
    title: "Registered Nurse",
    type: "Part-time",
    location: "Cape Coast & Elmina",
    category: "Clinical care",
    summary: "Nursing visits, observations and documentation within professional scope.",
    applicants: 7,
    status: "Published" as const,
  },
  {
    title: "Companion Caregiver",
    type: "Flexible",
    location: "Accra",
    category: "Non-clinical care",
    summary: "Company, errands and daily routines for older adults living alone.",
    applicants: 4,
    status: "Published" as const,
  },
  {
    title: "Live-in Caregiver",
    type: "Contract",
    location: "Central Region",
    category: "Non-clinical care",
    summary: "Overnight presence and daily living support for one household.",
    applicants: 0,
    status: "Draft" as const,
  },
];

export type Stage =
  | "New"
  | "Screening"
  | "Shortlisted"
  | "Interview"
  | "Credential checks"
  | "Hired"
  | "Declined";

export const STAGES: Stage[] = [
  "New",
  "Screening",
  "Shortlisted",
  "Interview",
  "Credential checks",
  "Hired",
  "Declined",
];

export const CANDIDATES = [
  {
    id: "seed-1",
    name: "Nana Akua Boateng",
    role: "Registered Nurse",
    location: "Cape Coast",
    experience: "5 years in ward and community nursing",
    date: "Today, 09:42",
    stage: "New" as Stage,
    skills: ["Wound care", "Medication support", "Elderly care"],
  },
  {
    id: "seed-2",
    name: "Michael Osei",
    role: "Home Care Assistant",
    location: "Cape Coast",
    experience: "3 years of personal care support",
    date: "Today, 08:15",
    stage: "Screening" as Stage,
    skills: ["Personal care", "Mobility support", "Companionship"],
  },
  {
    id: "seed-3",
    name: "Abigail Mensimah",
    role: "Caregiver",
    location: "Elmina",
    experience: "2 years with older adults at home",
    date: "Yesterday",
    stage: "Shortlisted" as Stage,
    skills: ["Daily living", "Meal preparation", "Elderly care"],
  },
  {
    id: "seed-4",
    name: "Kwesi Arthur",
    role: "Enrolled Nurse",
    location: "Cape Coast",
    experience: "4 years of clinical support",
    date: "Yesterday",
    stage: "Interview" as Stage,
    skills: ["Vital signs", "Documentation", "Patient support"],
  },
  {
    id: "seed-5",
    name: "Akosua Frimpong",
    role: "Companion Caregiver",
    location: "Mankessim",
    experience: "1 year of companionship care",
    date: "6 Nov 2026",
    stage: "Credential checks" as Stage,
    skills: ["Companionship", "Dementia support"],
  },
];

export const CLIENTS = [
  { name: "Mrs. Grace Mensah", area: "Accra — Labone", service: "Personal care", plan: "Morning support", status: "Active" },
  { name: "Mr. Daniel Asare", area: "Cape Coast", service: "Nursing visit", plan: "Wound review", status: "Active" },
  { name: "Madam Abena Ofori", area: "Elmina", service: "Companionship", plan: "Weekday afternoons", status: "Active" },
  { name: "Mr. Joseph Tetteh", area: "Tema", service: "Medication support", plan: "Twice weekly", status: "Review" },
  { name: "Auntie Efua Badu", area: "Accra — Dansoman", service: "Live-in support", plan: "Household routine", status: "Active" },
];

export const CAREGIVERS = [
  { name: "Ama Kusi", role: "Caregiver", area: "Accra", duty: "On duty", shift: "08:00 – 16:00" },
  { name: "Esi Owusu", role: "Registered Nurse", area: "Cape Coast", duty: "On duty", shift: "09:00 – 15:00" },
  { name: "Kwame Agyeman", role: "Companion", area: "Elmina", duty: "On duty", shift: "10:00 – 14:00" },
  { name: "Yaw Appiah", role: "Caregiver", area: "Tema", duty: "Scheduled", shift: "11:30 – 15:30" },
  { name: "Adwoa Serwaa", role: "Home Care Assistant", area: "Accra", duty: "Off today", shift: "Rest day" },
];

export const PLANS = [
  { client: "Mrs. Grace Mensah", focus: "Washing, dressing, breakfast", review: "18 Nov 2026", owner: "Ama Kusi" },
  { client: "Mr. Daniel Asare", focus: "Dressing change and observation", review: "12 Nov 2026", owner: "Esi Owusu" },
  { client: "Madam Abena Ofori", focus: "Conversation, walk, lunch", review: "2 Dec 2026", owner: "Kwame Agyeman" },
  { client: "Mr. Joseph Tetteh", focus: "Prompted medication, check-in", review: "9 Nov 2026", owner: "Yaw Appiah" },
];

export const VISITS = [
  { caregiver: "Ama Kusi", client: "Mrs. Grace Mensah", type: "Personal care", time: "08:00 – 10:00", status: "In progress" },
  { caregiver: "Esi Owusu", client: "Mr. Daniel Asare", type: "Nursing visit", time: "09:30 – 11:00", status: "In progress" },
  { caregiver: "Kwame Agyeman", client: "Madam Abena Ofori", type: "Companionship", time: "10:00 – 12:00", status: "Upcoming" },
  { caregiver: "Yaw Appiah", client: "Mr. Joseph Tetteh", type: "Medication support", time: "11:30 – 12:30", status: "Upcoming" },
  { caregiver: "Ama Kusi", client: "Auntie Efua Badu", type: "Personal care", time: "14:00 – 16:00", status: "Upcoming" },
];

export const INVOICES = [
  { id: "INV-1048", client: "Mensah household", amount: "GHS 1,280", status: "Paid", due: "2 Nov 2026" },
  { id: "INV-1049", client: "Asare family", amount: "GHS 960", status: "Sent", due: "14 Nov 2026" },
  { id: "INV-1050", client: "Ofori household", amount: "GHS 640", status: "Draft", due: "20 Nov 2026" },
  { id: "INV-1051", client: "Tetteh family", amount: "GHS 420", status: "Sent", due: "18 Nov 2026" },
];

export const THREADS = [
  { from: "Ama Kusi", topic: "Mrs. Mensah finished breakfast late", time: "07:58", unread: true },
  { from: "Esi Owusu", topic: "Dressing visit may run 20 minutes over", time: "09:12", unread: true },
  { from: "Recruitment", topic: "Nana Akua Boateng is ready for screening", time: "Yesterday", unread: false },
  { from: "Finance", topic: "October caregiver payouts are prepared", time: "Yesterday", unread: false },
];

export const REPORT_ROWS = [
  { label: "Personal care", value: 46 },
  { label: "Companionship", value: 28 },
  { label: "Nursing visits", value: 18 },
  { label: "Medication support", value: 12 },
];

export function initials(name: string) {
  return name
    .split(" ")
    .filter((part) => part && part !== "Mrs." && part !== "Mr." && part !== "Madam" && part !== "Auntie")
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function sectionTitle(section: Section) {
  return NAV.find((item) => item.id === section)?.label ?? "Overview";
}
