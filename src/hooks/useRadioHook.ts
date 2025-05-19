import { getRadioFrequency, getRadioOpMode, getRadioStatus, getRadioVolume, setRadioFrequency, setRadioOpMode, setRadioVolume, turnRadioOff, turnRadioOn } from "@/app/lib/services/radioService";
import { useDebouncedValue } from "@mantine/hooks";
import { useEffect, useRef, useState } from "react";
import { notifications } from "@mantine/notifications";

export const useRadioHook = () => {
    const [status, setStatus] = useState<string>();
    const [frequency, setFrequency] = useState<string>('000.30000');
    const [modes , setModes] = useState<string[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [volumeVisible, setVolumeVisibility] = useState<boolean>(false);
    const [volume, setVolume] = useState<number>(0);
    const skipNextUpdate = useRef(false); 
    const modeSkipNextUpdate = useRef(false);
    const [frequencyUnit, setFrequencyUnit] = useState<'MHz' | 'kHz'>('MHz');

    useEffect(()=>{
        fetchRadioStatus();
        fetchRadioFrequency();
        fetchRadioModes();
        fetchRadioVolume();
    }, []);
    


    const fetchRadioStatus = ()=>{
        getRadioStatus()
            .then((res)=> {
                setStatus(res.data?.state)
                console.log(res.data)
            });
    };

    const fetchRadioFrequency = ()=>{
        getRadioFrequency()
            .then((res)=> {
                setFrequency(res.data?.latest);
            });
    };

    const fetchRadioModes = ()=>{
        getRadioOpMode()
            .then((res)=>{
                const newModes = res.data.modes;
                if(newModes !== modes){
                    modeSkipNextUpdate.current = true;
                    setModes(newModes)
                }
                setModes(res.data.modes);
            });
    };

    const fetchRadioVolume = () => {
        getRadioVolume()
        .then((res) => {
            const newVolume = res.data.level;
            if (newVolume !== volume) {
            skipNextUpdate.current = true;
            setVolume(newVolume);
            }
        })
        .catch((err) => {
            console.error("Failed to fetch volume", err);
        });
    };

    const onVolumeChange = (value: number) => {
        setLoading(true);
        setRadioVolume(value)
        .then(() => {
            setTimeout(() => {
            fetchRadioVolume();
            setLoading(false);
            notifications.show({
                position: "top-right",
                title: "Volume Updated",
                message: "Radio volume updated successfully.",
                color: "#40c057",
            })
            }, 6000);
        })
        .catch((err) => {
            console.error("Failed to set volume", err);
            setLoading(false);
        });
    };

    const [debouncedVolume] = useDebouncedValue(volume, 3000);

    useEffect(() => {
        if (skipNextUpdate.current) {
            skipNextUpdate.current = false;
            return;
        }
        onVolumeChange(debouncedVolume);
    }, [debouncedVolume]);
    
    const onRadio = ()=>{
        setLoading(true);
        turnRadioOn()
            .then(() => {
                setTimeout(()=>{
                    fetchRadioStatus();
                    fetchRadioFrequency();
                    notifications.show({
                        position: "top-right",
                        title: "Radio On",
                        message: "Radio turned on successfully.",
                        color: "#40c057",
                    })
                    setLoading(false);
                }, 3000)
            })
    };

    const offRadio = ()=>{
        setLoading(true);
        turnRadioOff()
            .then(() => {
                setTimeout(()=>{
                    fetchRadioStatus();
                    fetchRadioFrequency();
                    notifications.show({
                        position: "top-right",
                        title: "Radio Off",
                        message: "Radio turned off successfully.",
                        color: "#40c057",
                    })
                    setLoading(false);
                }, 3000)
            });
    };

    
    const onModeChange = async(modes:string[])=>{
        setLoading(true);
        await Promise.all(modes.map((mode) => setRadioOpMode(mode)))
            .then(()=>{
                setTimeout(()=>{
                    fetchRadioModes();
                    notifications.show({
                        position: "top-right",
                        title: "Modes Updated",
                        message: "Radio modes updated successfully.",
                        color: "#40c057",
                    })
                    setLoading(false);
                }, 6000)
            })
            .catch((err) => {
                console.error("Failed to set mode", err);
                setLoading(false);
            });
    };

    const [debouncedModes] = useDebouncedValue(modes, 3000);
    useEffect(()=>{
        if(modeSkipNextUpdate.current){
            modeSkipNextUpdate.current = false;
            return;
        }
        onModeChange(debouncedModes);
    }, [debouncedModes]);

    useEffect(() => {
        if (!frequency) return;
        const timeout = setTimeout(() => {
            onFrequencyChange();
        }, 2000);
        return () => clearTimeout(timeout);
    }, [frequency]);

    const onFrequencyChange = () => {
        setLoading(true);
        
        const [major, minor] = (frequency)?.toString().split('.');

        if (!major || !minor || minor.length < 5) {
            notifications.show({
                position: "top-right",
                color: "red",
                title: "Error",
                message: "Invalid frequency format. Please check and try again."
            });
            fetchRadioFrequency();
            setLoading(false);
            return;
        }

        const majorNum = parseInt(major);
        if (majorNum >= 1 && majorNum <= 468) {
            setFrequencyUnit('MHz');
        } else {
            setFrequencyUnit('kHz');
        }

        let isValid = false;

        if (majorNum >= 1 && majorNum <= 468) {
            const mhz = parseInt(major);
            const khz = parseInt(minor.substring(0, 3));
            const hz = parseInt(minor.substring(3, 5));

            isValid =
            mhz >= 1 && mhz <= 468 &&
            khz >= 30 && khz <= 999 &&
            hz >= 0 && hz <= 99;

        } else {
            const khz = parseInt(major);
            const hz = parseInt(minor.substring(0, 3));
            const subHz = parseInt(minor.substring(3, 5));

            isValid =
            khz >= 0 && khz <= 999 &&
            hz >= 30 && hz <= 999 &&
            subHz >= 0 && subHz <= 99;
        }

        if (!isValid) {
            notifications.show({
                position: "top-right",
                color: "red",
                title: "Error",
                message: "Invalid frequency format. Please check and try again."
            });
            fetchRadioFrequency();
            setLoading(false);
            return;
        }

        setRadioFrequency(frequency)
            .then(()=>setTimeout(() => {
                fetchRadioFrequency();
                notifications.show({
                    position: "top-right",
                    title: "Frequency Updated",
                    message: "Radio frequency updated successfully.",
                    color: "#40c057",
                })
                setLoading(false);
            }, 6000)
        )
    };

    return {
        status,
        loading,
        frequency,
        modes,
        volumeVisible,
        volume,
        frequencyUnit,
        onFrequencyChange,
        setFrequencyUnit,
        setVolume,
        onVolumeChange,
        setVolumeVisibility,
        setFrequency,
        onRadio,
        offRadio,
        setModes,
    }
}