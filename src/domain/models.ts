export type StaffRole = "owner" | "admin" | "member";
export type TaskStatus = "not_started" | "in_progress" | "blocked" | "done";
export type RiskLevel = "overdue" | "at_risk" | "on_track";

export type IntakeSeason = "summer" | "winter";
export type StudentLifecycleStatus = "active" | "archived";
export type JourneyTaskStatus = "not_started" | "in_progress" | "blocked" | "completed";
export type JourneyStageKey =
  | "onboarded"
  | "prepared_eligibility_aps"
  | "prepared_tests_documents"
  | "applied"
  | "cleared"
  | "enrolled";
export type LegalDocumentKind = "terms" | "privacy";

export interface StudentAssignee {
  id: string;
  fullName: string;
  role: StaffRole;
}

export interface StudentRecord {
  id: string;
  organizationId: string;
  fullName: string;
  email: string;
  phone: string | null;
  intakeSeason: IntakeSeason;
  intakeYear: number;
  residenceCountryCode: "IN";
  destinationCountryCode: "DE";
  adultConfirmed: boolean;
  permissionConfirmed: boolean;
  journeyTemplateVersion: number;
  assignedConsultantId: string;
  lifecycleStatus: StudentLifecycleStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  archivedAt: string | null;
  archivedBy: string | null;
}

export interface JourneyStage {
  id: string;
  studentId: string;
  stageKey: JourneyStageKey;
  title: string;
  displayOrder: number;
  createdAt: string;
}

export interface JourneyTask {
  id: string;
  stageId: string;
  taskKey: string;
  title: string;
  displayOrder: number;
  status: JourneyTaskStatus;
  planningTargetDate: string;
  templateTargetDate: string;
  targetIsTemplate: boolean;
  startedAt: string | null;
  completedAt: string | null;
  updatedAt: string;
}

export interface StudentJourneyStage extends JourneyStage {
  tasks: JourneyTask[];
}

export interface StudentWorkspace {
  student: StudentRecord;
  stages: StudentJourneyStage[];
  assignees: StudentAssignee[];
}

export interface StudentSummary {
  id: string;
  fullName: string;
  email: string;
  intakeSeason: IntakeSeason;
  intakeYear: number;
  assignedConsultantId: string;
  lifecycleStatus: StudentLifecycleStatus;
  createdAt: string;
}

export interface StudentDataOverview {
  total: number;
  active: number;
  archived: number;
}

export interface StudentIntakeGroup {
  intakeSeason: IntakeSeason;
  intakeYear: number;
  students: StudentSummary[];
}

export interface LegalDocumentAccess {
  kind: LegalDocumentKind;
  version: string;
  accepted: boolean;
  acceptedAt: string | null;
}

export interface LegalAccess {
  documentVersion: string;
  terms: LegalDocumentAccess;
  privacy: LegalDocumentAccess;
  organizationDpaAccepted: boolean;
  organizationDpaAcceptedAt: string | null;
  role: StaffRole;
  ownerActionRequired: boolean;
  studentDataAccessible: boolean;
}
