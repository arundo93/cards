import { createContext, type ReactNode, useContext } from "react";
import { usePwaState } from "../hooks/usePwa";

const PwaContext = createContext<ReturnType<typeof usePwaState> | null>(null);
export function PwaProvider({ children }: { children: ReactNode }) {
  const state = usePwaState();
  return <PwaContext.Provider value={state}>{children}</PwaContext.Provider>;
}
export function usePwa() {
  const context = useContext(PwaContext);
  if (!context) throw new Error("PwaProvider is missing");
  return context;
}
