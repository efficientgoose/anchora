import type { Clock } from "@/domain/clock";
import type { CreateStudentInput, IntakeGroup, PaginatedResult, Student, StudentOverview, StudentQuery, TaskStatus, TenantScope } from "@/domain/models";

export interface StudentRepository {
  list(scope: TenantScope, query: StudentQuery): Promise<PaginatedResult<Student>>;
  getOverview(scope: TenantScope): Promise<StudentOverview>;
  getById(scope: TenantScope, studentId: string): Promise<Student | null>;
  create(scope: TenantScope, input: CreateStudentInput): Promise<Student>;
  updateTaskStatus(scope: TenantScope, studentId: string, taskId: string, status: TaskStatus): Promise<Student>;
}

export interface IntakeRepository {
  getSummaries(scope: TenantScope): Promise<IntakeGroup[]>;
}

export interface RepositoryBundle {
  students: StudentRepository;
  intakes: IntakeRepository;
  clock: Clock;
}
