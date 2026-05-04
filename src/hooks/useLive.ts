import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useLive() {
  return useQuery({
    queryKey: ["live"],
    queryFn: api.live,
    refetchInterval: 5_000,
    staleTime: 2_000,
  });
}
