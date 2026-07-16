"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DEMO_SCOPE } from "@/domain/constants";
import type { CreateStudentInput, StudentQuery, TaskStatus } from "@/domain/models";
import { repositories } from "@/data/local-repositories";
import { queryKeys } from "@/data/query-keys";

export function useStudents(query: StudentQuery) {
  return useQuery({ queryKey: queryKeys.students(DEMO_SCOPE.organizationId, query), queryFn: () => repositories.students.list(DEMO_SCOPE, query) });
}

export function useStudentOverview() {
  return useQuery({ queryKey: queryKeys.studentOverview(DEMO_SCOPE.organizationId), queryFn: () => repositories.students.getOverview(DEMO_SCOPE) });
}

export function useStudent(studentId: string) {
  return useQuery({ queryKey: queryKeys.student(DEMO_SCOPE.organizationId, studentId), queryFn: () => repositories.students.getById(DEMO_SCOPE, studentId) });
}

function useInvalidateStudentData() {
  const client = useQueryClient();
  return async (studentId?: string) => {
    await Promise.all([
      client.invalidateQueries({ queryKey: ["students"] }),
      client.invalidateQueries({ queryKey: ["student-overview"] }),
      client.invalidateQueries({ queryKey: ["intakes"] }),
      ...(studentId ? [client.invalidateQueries({ queryKey: queryKeys.student(DEMO_SCOPE.organizationId, studentId) })] : []),
    ]);
  };
}

export function useCreateStudent() {
  const invalidate = useInvalidateStudentData();
  return useMutation({ mutationFn: (input: CreateStudentInput) => repositories.students.create(DEMO_SCOPE, input), onSuccess: (student) => invalidate(student.id) });
}

export function useUpdateTaskStatus(studentId: string) {
  const invalidate = useInvalidateStudentData();
  return useMutation({ mutationFn: ({ taskId, status }: { taskId: string; status: TaskStatus }) => repositories.students.updateTaskStatus(DEMO_SCOPE, studentId, taskId, status), onSuccess: () => invalidate(studentId) });
}
