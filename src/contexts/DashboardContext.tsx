 import { useDashboardHook } from '@/hooks/useDashboardHook';
import { createContext, useContext, ReactNode } from "react";

const DashboardContext = createContext<ReturnType<typeof useDashboardHook> | null>(null);

export const DashboardProvider = ({ children }: { children: ReactNode }) => {
  const dashboardHook = useDashboardHook();
  return (
    <DashboardContext.Provider value={dashboardHook}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) throw new Error("useDashboard must be used within DashboardProvider");
  return context;
};
