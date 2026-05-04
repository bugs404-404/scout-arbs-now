import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useCapital() {
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: ["capital"],
    queryFn: api.capital.get,
    staleTime: 60_000,
  });
  const mutation = useMutation({
    mutationFn: (capital: number) => api.capital.set(capital),
    onSuccess: (data) => {
      qc.setQueryData(["capital"], data);
      qc.invalidateQueries({ queryKey: ["arbs"] });
      qc.invalidateQueries({ queryKey: ["stats"] });
    },
  });
  return { capital: query.data?.capital ?? 100, isLoading: query.isLoading, set: mutation.mutate };
}
