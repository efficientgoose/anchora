import type { StudentQuery } from "@/domain/models";

export const queryKeys = {
  students: (organizationId: string, query: StudentQuery) => ["students", organizationId, query] as const,
  student: (organizationId: string, studentId: string) => ["student", organizationId, studentId] as const,
  studentOverview: (organizationId: string) => ["student-overview", organizationId] as const,
  intakes: (organizationId: string) => ["intakes", organizationId] as const,
};
