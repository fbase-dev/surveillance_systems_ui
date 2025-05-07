import { useCameraControl } from '@/hooks/useCameraControl';
import { createContext, useContext, ReactNode } from "react";

const CameraControlContext = createContext<ReturnType<typeof useCameraControl> | null>(null);

export const CameraControlProvider = ({ children }: { children: ReactNode }) => {
  const cameraControl = useCameraControl();
  return (
    <CameraControlContext.Provider value={cameraControl}>
      {children}
    </CameraControlContext.Provider>
  );
};

export const useCamera = () => {
  const context = useContext(CameraControlContext);
  if (!context) throw new Error("useCamera must be used within CameraControlProvider");
  return context;
};
