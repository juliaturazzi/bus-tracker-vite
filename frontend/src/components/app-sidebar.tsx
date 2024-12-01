import React from "react";
import { CalendarCheck, LogOutIcon, Settings, LogInIcon } from "lucide-react";
import { NavUser } from "@/components/nav-user";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarRail,
} from "@/components/ui/sidebar";
import { Collapsible } from "./ui/collapsible";
import { useAuth } from "@/components/auth_context";

interface NavItem {
    title: string;
    url: string;
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    requiresLogin?: boolean;
}

interface AppSidebarProps {
    isLoggedIn: boolean;
    setIsDialogOpen: (open: boolean) => void; // Pass dialog control function
}

export function AppSidebar({ isLoggedIn, setIsDialogOpen, ...props }: AppSidebarProps) {
    const { email, logOut } = useAuth();
    const collapsed = false;

    const navItems: NavItem[] = [
        {
            title: "Alertas cadastrados",
            url: "/subscribed-alerts",
            icon: CalendarCheck,
            requiresLogin: true,
        },
        {
            title: "Configurações de Conta",
            url: "/user-settings",
            icon: Settings,
            requiresLogin: true,
        },
    ];

    const handleNavigation = (url: string) => {
        if (url === "#logout") {
            logOut()
                .then(() => (window.location.href = "/"))
                .catch((err) => console.error("Error during logout:", err));
        } else {
            window.location.href = url;
        }
    };

    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <NavUser user={{ email: email || "No email provided" }} />
            </SidebarHeader>
            <SidebarContent>
                <Collapsible asChild className="group/collapsible">
                    <div className="space-y-2">
                        {navItems.map((item, index) => (
                            <button
                                key={index}
                                onClick={() => {
                                    if (!isLoggedIn && item.requiresLogin) {
                                        alert("Please log in to access this feature.");
                                        return;
                                    }
                                    handleNavigation(item.url);
                                }}
                                disabled={!isLoggedIn && item.requiresLogin}
                                aria-disabled={!isLoggedIn && item.requiresLogin}
                                className={`duration-200 flex h-8 items-center space-x-4 rounded-md px-3 text-sm font-medium ${
                                    !isLoggedIn && item.requiresLogin
                                        ? "text-gray-400 cursor-not-allowed"
                                        : "text-sidebar-foreground/70"
                                } outline-none ring-sidebar-ring transition-[margin,opa] ease-linear focus-visible:ring-2 [&>svg]:size-6 [&>svg]:shrink-0`}
                            >
                                <item.icon className="w-5 h-5" />
                                {!collapsed && <span>{item.title}</span>}
                            </button>
                        ))}
                    </div>
                </Collapsible>
            </SidebarContent>
            <SidebarFooter>
                <button
                    onClick={() => {
                        if (isLoggedIn) {
                            logOut()
                                .then(() => (window.location.href = "/"))
                                .catch((err) => console.error("Error during logout:", err));
                        } else {
                            setIsDialogOpen(true);
                        }
                    }}
                    className="w-full flex justify-center py-2 text-sm font-medium text-sidebar-foreground/70"
                >
                    {isLoggedIn ? (
                        <>
                            <LogOutIcon className="mr-2 w-5 h-5" />
                            Log Out
                        </>
                    ) : (
                        <>
                            <LogInIcon className="mr-2 w-5 h-5" />
                            Log In
                        </>
                    )}
                </button>
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
}
