/**
 * Auto-bet toggle. Stored server-side (Redis) so all dashboard tabs
 * stay in sync. Off by default. Flipping it on means real money will
 * be placed on every fresh arb alert via the betting executor.
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const API_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? "";

export function useAutoBet() {
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: ["auto_bet"],
    queryFn: async () => {
      const r = await fetch(`${API_URL}/api/auto_bet`);
      if (!r.ok) throw new Error("auto_bet");
      return (await r.json()) as { enabled: boolean };
    },
    refetchInterval: 5_000,
    staleTime: 1_000,
  });
  const mutate = useMutation({
    mutationFn: async (enabled: boolean) => {
      const r = await fetch(`${API_URL}/api/auto_bet`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled }),
      });
      if (!r.ok) throw new Error("auto_bet set");
      return (await r.json()) as { enabled: boolean };
    },
    onSuccess: (d) => qc.setQueryData(["auto_bet"], d),
  });
  return {
    enabled: query.data?.enabled ?? false,
    isLoading: query.isLoading,
    set: mutate.mutate,
    pending: mutate.isPending,
  };
}
