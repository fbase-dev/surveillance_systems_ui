import { ReactNode } from "react";
import {IconCamera, IconCurrentLocation, IconHome, IconFolder} from "@tabler/icons-react"

export const navItems: {
    name: string;
    icon: ReactNode | undefined;
    href: string;
}[] = [
    {
        name: "Dashboard",
        icon: <IconHome size={25} />,
        href: "/admin/dashboard",
    },
    {
        name: "Navigation",
        icon: <IconCurrentLocation size={25} />,
        href: "/admin/navigation",
    },
    {
        name: "Cameras",
        icon: <IconCamera size={25} />,
        href: "/admin/cameras",
    },
     {
        name: "Storage",
        icon: <IconFolder size={25} />,
        href: "/admin/storage",
    },
    
    // {
    //     name: "Reports",
    //     icon: <IconNote  size={25}/>,
    //     href: "/admin/reports"
    // },
    // {
    //     name: "Maintenance",
    //     icon: <IconTools size={25}/>,
    //     href: "/admin/maintenance"
    // },
    // {
    //     name: "Settings",
    //     icon: <IconSettings size={25}/>,
    //     href: "/admin/settings"
    // }
].filter(Boolean);