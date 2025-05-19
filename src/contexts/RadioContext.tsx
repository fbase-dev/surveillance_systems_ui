import { useRadioHook } from "@/hooks/useRadioHook";
import { createContext, ReactNode, useContext } from "react";

const RadioContext = createContext<ReturnType<typeof useRadioHook> | null>(null);

export const RadioProvider =({children}:{children: ReactNode}) => {
    const RadioHook = useRadioHook();
    return (
        <RadioContext.Provider value={RadioHook}>
            {children}
        </RadioContext.Provider>
    );
};

export const useRadio = () => {
    const context = useContext(RadioContext);
    if (!context) throw new Error("useRadio must be used within RadioProvider.");
    return context;
}