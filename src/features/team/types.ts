import type { StaffRole } from "@/domain/models";

export interface TeamMember {
  id: string;
  fullName: string;
  email: string;
  role: StaffRole;
  joinedAt: string;
}

export interface TeamInvitation {
  id: string;
  fullName: string;
  email: string;
  role: StaffRole;
  status: "pending" | "expired";
  sentAt: string;
  expiresAt: string;
  resendAvailableAt: string;
}

export interface TeamDirectory {
  organizationId: string;
  organizationName: string;
  members: TeamMember[];
  invitations: TeamInvitation[];
}
