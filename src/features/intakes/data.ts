"use client";

import { useQuery } from "@tanstack/react-query";
import { repositories } from "@/data/local-repositories";
import { queryKeys } from "@/data/query-keys";
import { DEMO_SCOPE } from "@/domain/constants";

export function useIntakeSummaries() {
  return useQuery({ queryKey: queryKeys.intakes(DEMO_SCOPE.organizationId), queryFn: () => repositories.intakes.getSummaries(DEMO_SCOPE) });
}
