import { getRadioStatus } from "@/app/lib/services/radioService";
import { useState } from "react"

export const useRadioHook = () => {
    const [status, setStatus] = useState<string>();

    getRadioStatus()
        .then((res)=> setStatus(res.data));

    return {
        status
    }
}