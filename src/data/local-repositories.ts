"use client";

import { z } from "zod";
import { DEMO_STAFF } from "@/domain/constants";
import { demoClock } from "@/domain/clock";
import { countRisks, studentRisk } from "@/domain/student-calculations";
import type { ApplicationTask, CreateStudentInput, IntakeGroup, PaginatedResult, Student, StudentQuery, TaskStatus, TenantScope } from "@/domain/models";
import type { IntakeRepository, RepositoryBundle, StudentRepository } from "./repositories";
import { createSeedStudents, createTaskDate } from "./seed";

const STORAGE_KEY = "anchora:prototype:v1";
const taskSchema = z.object({ id: z.string(), name: z.string(), status: z.enum(["not_started", "in_progress", "blocked", "done"]), dueDate: z.string(), university: z.string().nullable() });
const studentSchema = z.object({ id: z.string(), organizationId: z.string(), name: z.string(), email: z.string(), phone: z.string(), targetIntake: z.string(), assignedConsultantId: z.string(), targetUniversities: z.array(z.string()), tasks: z.array(taskSchema) });
const stateSchema = z.object({ version: z.literal(1), students: z.array(studentSchema) });

function emitNotice(kind: "info" | "error", message: string) {
  window.dispatchEvent(new CustomEvent("anchora:data-notice", { detail: { kind, message } }));
}

class LocalRepository implements StudentRepository, IntakeRepository {
  private memory: Student[] | null = null;

  private load() {
    if (this.memory) return this.memory;
    const fallback = createSeedStudents();
    try {
      const value = window.localStorage.getItem(STORAGE_KEY);
      if (!value) {
        this.memory = fallback;
        this.save(fallback);
        return fallback;
      }
      const parsed = stateSchema.safeParse(JSON.parse(value));
      if (!parsed.success) throw new Error("Stored data has an unsupported shape");
      this.memory = parsed.data.students;
      return this.memory;
    } catch {
      this.memory = fallback;
      try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, students: fallback })); } catch { /* memory fallback remains usable */ }
      queueMicrotask(() => emitNotice("info", "Demo data was restored because the saved copy could not be read."));
      return fallback;
    }
  }

  private save(students: Student[]) {
    this.memory = students;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, students }));
    } catch {
      queueMicrotask(() => emitNotice("error", "Changes are available in this session but could not be saved in this browser."));
    }
  }

  private scoped(scope: TenantScope) {
    return this.load().filter((student) => student.organizationId === scope.organizationId);
  }

  async list(scope: TenantScope, query: StudentQuery): Promise<PaginatedResult<Student>> {
    let students = this.scoped(scope);
    const needle = query.search.trim().toLowerCase();
    if (needle) students = students.filter((student) => student.name.toLowerCase().includes(needle) || student.email.toLowerCase().includes(needle));
    if (query.risk !== "all") students = students.filter((student) => studentRisk(student, demoClock) === query.risk);
    if (query.consultantId !== "all") students = students.filter((student) => student.assignedConsultantId === query.consultantId);
    if (query.intake !== "all") students = students.filter((student) => student.targetIntake === query.intake);

    const consultantName = (id: string) => DEMO_STAFF.find((member) => member.id === id)?.name ?? "";
    const severity = { on_track: 1, at_risk: 2, overdue: 3 };
    students = [...students].sort((a, b) => {
      let result = 0;
      if (query.sortBy === "name") result = a.name.localeCompare(b.name);
      else if (query.sortBy === "intake") result = a.targetIntake.localeCompare(b.targetIntake);
      else if (query.sortBy === "consultant") result = consultantName(a.assignedConsultantId).localeCompare(consultantName(b.assignedConsultantId));
      else result = severity[studentRisk(a, demoClock)] - severity[studentRisk(b, demoClock)];
      return query.sortDirection === "asc" ? result : -result;
    });

    const total = students.length;
    const pageCount = Math.max(1, Math.ceil(total / query.pageSize));
    const page = Math.min(Math.max(1, query.page), pageCount);
    const offset = (page - 1) * query.pageSize;
    return { items: students.slice(offset, offset + query.pageSize), total, page, pageSize: query.pageSize, pageCount };
  }

  async listAll(scope: TenantScope) {
    return [...this.scoped(scope)];
  }

  async getById(scope: TenantScope, studentId: string) {
    return this.scoped(scope).find((student) => student.id === studentId) ?? null;
  }

  async create(scope: TenantScope, input: CreateStudentInput) {
    const id = `student_${Date.now().toString(36)}`;
    const globalTasks: Array<[string, number]> = [["APS",45],["IELTS",40],["GRE",50],["SOP",70],["LOR 1",60],["LOR 2",60],["Blocked Account",150],["Health Insurance",150],["Visa Appointment",140]];
    const tasks: ApplicationTask[] = globalTasks.map(([name, offset], index) => ({ id: `${id}_task_${index + 1}`, name, status: "not_started", dueDate: createTaskDate(offset), university: null }));
    input.targetUniversities.forEach((university, index) => tasks.push({ id: `${id}_university_${index + 1}`, name: "Uni-Assist Submission", status: "not_started", dueDate: createTaskDate(90), university }));
    const student: Student = { id, organizationId: scope.organizationId, name: input.name.trim(), email: input.email.trim(), phone: input.phone?.trim() || "—", targetIntake: input.targetIntake, assignedConsultantId: input.assignedConsultantId, targetUniversities: input.targetUniversities, tasks };
    this.save([...this.load(), student]);
    return student;
  }

  async updateTaskStatus(scope: TenantScope, studentId: string, taskId: string, status: TaskStatus) {
    let updated: Student | null = null;
    const students = this.load().map((student) => {
      if (student.organizationId !== scope.organizationId || student.id !== studentId) return student;
      updated = { ...student, tasks: student.tasks.map((task) => task.id === taskId ? { ...task, status } : task) };
      return updated;
    });
    if (!updated) throw new Error("Student not found");
    this.save(students);
    return updated;
  }

  async getSummaries(scope: TenantScope): Promise<IntakeGroup[]> {
    const students = this.scoped(scope);
    const order = ["Winter 2026", "Summer 2027", "Winter 2027", "Summer 2028"];
    return [...new Set(students.map((student) => student.targetIntake))]
      .sort((a, b) => (order.indexOf(a) < 0 ? 99 : order.indexOf(a)) - (order.indexOf(b) < 0 ? 99 : order.indexOf(b)))
      .map((intake) => {
        const group = students.filter((student) => student.targetIntake === intake).sort((a, b) => {
          const severity = { on_track: 1, at_risk: 2, overdue: 3 };
          return severity[studentRisk(b, demoClock)] - severity[studentRisk(a, demoClock)];
        });
        return { intake, counts: countRisks(group, demoClock), students: group };
      });
  }
}

const repository = new LocalRepository();

export const repositories: RepositoryBundle = {
  students: repository,
  intakes: repository,
  clock: demoClock,
};
