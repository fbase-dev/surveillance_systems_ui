import { ReactNode } from "react";
import {IconFolderDollar, IconHome, IconNote, icons, IconUsers} from "@tabler/icons-react"

export const navItems: {
    name: string;
    icon: ReactNode | undefined;
    href: string;
}[] = [
    {
        name: "Dahsboard",
        icon: <IconHome size={25} />,
        href: "/admin/dashboard",
    },
    {
        name: "Navigation",
        icon: <IconFolderDollar size={25} />,
        href: "/admin/navigation",
    },
    {
        name: "Cameras",
        icon: <IconUsers size={25} />,
        href: "/admin/cameras",
    },
    {
        name: "Reports",
        icon: <IconNote  size={25}/>,
        href: "/admin/reports"
    },
    {
        name: "Maintenance",
        icon: <IconNote size={25}/>,
        href: "/admin/maintenance"
    },
    {
        name: "Settings",
        icon: <IconNote size={25}/>,
        href: "/admin/settings"
    }
].filter(Boolean);