import { useEffect } from "react";
import { useData } from "./store";

export function useInitData() {
  const load = useData((s) => s.load);
  const loaded = useData((s) => s.loaded);
  const loading = useData((s) => s.loading);
  const error = useData((s) => s.error);
  useEffect(() => {
    if (!loaded && !loading) load();
  }, [loaded, loading, load]);
  return { loaded, loading, error };
}
