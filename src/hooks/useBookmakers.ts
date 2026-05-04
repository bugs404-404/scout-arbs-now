import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useBookmakers(hours = 24) {
  return useQuery({
    queryKey: ["bookmakers", hours],
    queryFn: () => api.bookmakers(hours),
    refetchInterval: 15_000,
    staleTime: 5_000,
  });
}
