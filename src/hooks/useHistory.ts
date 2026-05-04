import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useHistory(days = 30) {
  return useQuery({
    queryKey: ["history", days],
    queryFn: () => api.history(days),
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
}
