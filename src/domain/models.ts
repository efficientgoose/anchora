export type StaffRole = "owner" | "admin" | "consultant";
export type TaskStatus = "not_started" | "in_progress" | "blocked" | "done";
export type RiskLevel = "overdue" | "at_risk" | "on_track";
export type StudentSortField = "risk" | "name" | "intake" | "consultant";
export type SortDirection = "asc" | "desc";

export interface Organization {
  id: string;
  name: string;
  slug: string;
}

export interface StaffUser {
  id: string;
  organizationId: string;
  name: string;
  email: string;
  role: StaffRole;
  title: string;
}

export interface ApplicationTask {
  id: string;
  name: string;
  status: TaskStatus;
  dueDate: string;
  university: string | null;
}

export interface Student {
  id: string;
  organizationId: string;
  name: string;
  email: string;
  phone: string;
  targetIntake: string;
  assignedConsultantId: string;
  targetUniversities: string[];
  tasks: ApplicationTask[];
}

export interface TenantScope {
  organizationId: string;
  actorId: string;
  role: StaffRole;
}

export interface StudentQuery {
  page: number;
  pageSize: number;
  search: string;
  risk: RiskLevel | "all";
  consultantId: string | "all";
  intake: string | "all";
  sortBy: StudentSortField;
  sortDirection: SortDirection;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
}

export interface RiskCounts {
  overdue: number;
  atRisk: number;
  onTrack: number;
}

export interface StudentOverview {
  total: number;
  counts: RiskCounts;
}

export interface IntakeGroup {
  intake: string;
  counts: RiskCounts;
  students: Student[];
}

export interface CreateStudentInput {
  name: string;
  email: string;
  phone?: string;
  targetIntake: string;
  assignedConsultantId: string;
  targetUniversities: string[];
}
