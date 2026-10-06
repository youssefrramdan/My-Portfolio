import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";

export const SKILLS_KEY = ["skills"];

/** `{ section, categories }`: the heading and the published groups in display order. */
export function useSkills() {
  return useQuery({
    queryKey: SKILLS_KEY,
    queryFn: async () => (await api.get("/skills")).data,
  });
}
