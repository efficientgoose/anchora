import type { Organization, StaffUser, TenantScope } from "./models";

export const DEMO_ORGANIZATION: Organization = {
  id: "org_anchora_demo",
  name: "Northstar Education",
  slug: "northstar-education",
};

export const DEMO_STAFF: StaffUser[] = [
  { id: "usr_priya", organizationId: DEMO_ORGANIZATION.id, name: "Priya Nair", email: "priya@northstar.example", role: "owner", title: "Senior Consultant" },
  { id: "usr_anjali", organizationId: DEMO_ORGANIZATION.id, name: "Anjali Desai", email: "anjali@northstar.example", role: "consultant", title: "Consultant" },
  { id: "usr_rohan", organizationId: DEMO_ORGANIZATION.id, name: "Rohan Mehta", email: "rohan@northstar.example", role: "consultant", title: "Consultant" },
];

export const ACTIVE_STAFF = DEMO_STAFF[0];

export const DEMO_SCOPE: TenantScope = {
  organizationId: DEMO_ORGANIZATION.id,
  actorId: ACTIVE_STAFF.id,
  role: ACTIVE_STAFF.role,
};

export const INTAKES = ["Winter 2026", "Summer 2027", "Winter 2027", "Summer 2028"];

export const UNIVERSITIES = [
  "TU Munich",
  "RWTH Aachen",
  "TU Berlin",
  "Uni Stuttgart",
  "KIT",
  "TU Darmstadt",
  "LMU Munich",
  "Uni Heidelberg",
  "Uni Mannheim",
  "TU Dresden",
  "Uni Freiburg",
  "Uni Bonn",
];
