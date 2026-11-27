/** Roles and areas shown on the careers page. */

export const ROLES = [
  "Home Care Assistant",
  "Registered Nurse",
  "Enrolled Nurse",
  "Caregiver",
  "Companion Caregiver",
  "Live-in Caregiver",
] as const;

export const AREAS = [
  "Assin Foso",
  "Assin Bereku",
  "Assin Praso",
  "Assin Manso",
  "Assin Nyankumasi",
  "Twifo Praso",
  "Cape Coast",
  "Flexible / several areas",
] as const;

export const JOBS = [
  {
    title: "Home Care Assistant",
    type: "Full-time",
    location: "Assin Foso",
    category: "Non-clinical care",
    summary: "Personal care, meals, mobility and companionship for clients at home.",
    applicants: 12,
    status: "Published" as const,
  },
  {
    title: "Registered Nurse",
    type: "Part-time",
    location: "Assin Foso & Assin Bereku",
    category: "Clinical care",
    summary: "Nursing visits, observations and documentation within professional scope.",
    applicants: 7,
    status: "Published" as const,
  },
  {
    title: "Companion Caregiver",
    type: "Flexible",
    location: "Assin Foso",
    category: "Non-clinical care",
    summary: "Company, errands and daily routines for older adults living alone.",
    applicants: 4,
    status: "Published" as const,
  },
  {
    title: "Live-in Caregiver",
    type: "Contract",
    location: "Assin Foso",
    category: "Non-clinical care",
    summary: "Overnight presence and daily living support for one household.",
    applicants: 0,
    status: "Draft" as const,
  },
];
