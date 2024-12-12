import { useState } from "react";
import { LogOutIcon, LogInIcon, List, CircleHelp } from "lucide-react";
import { NavUser } from "@/components/nav-user";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarRail,
} from "@/components/ui/sidebar";
import { Collapsible } from "@/components/ui/collapsible";
import { useAuth } from "@/components/auth_context";
import RegisteredStops from "@/components/registered-stops";
import { BusTrackerInstructions } from "@/components/bus-tracker-instructions";

interface AppSidebarProps {
    isLoggedIn: boolean;
}

export function AppSidebar({ isLoggedIn, ...props }: AppSidebarProps) {
    const { email, logOut } = useAuth();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isInstructionsOpen, setIsInstructionsOpen] = useState(false);

    const handleNavigation = (url: string) => {
        window.location.href = url;
    };

    const handleLogout = async () => {
        if (isLoggedIn) {
            try {
                await logOut();
                handleNavigation("/");
            } catch (err) {
                console.error("Error during logout:", err);
            }
        } else {
            handleNavigation("/");
        }
    };

    return (
        <>
            <Sidebar collapsible="icon" {...props}>
                <SidebarHeader>
                    <NavUser user={{ email: email || "No email" }} />
                </SidebarHeader>
                <SidebarContent>
                    <Collapsible asChild className="group/collapsible">
                        <div className="space-y-2">
                            <button
                                onClick={isLoggedIn ? () => setIsDialogOpen(true) : undefined}
                                className={`flex h-8 items-center space-x-4 rounded-md px-3 text-sm font-medium text-sidebar-foreground/70 transition [&>svg]:w-6 [&>svg]:h-6 [&>svg]:shrink-0
                                            ${isLoggedIn ? "hover:bg-sidebar-hover focus-visible:outline focus-visible:ring-2 focus-visible:ring-sidebar-ring" 
                                            : "opacity-50 cursor-not-allowed"}`}
                                aria-expanded={isLoggedIn ? isDialogOpen : undefined}
                                aria-controls="registered-stops-dialog"
                                disabled={!isLoggedIn} 
                            >
                                <List className="w-6 h-6"/>
                                <span>Todos os alertas</span>
                            </button>

                            {isDialogOpen && (
                                <RegisteredStops
                                    onClose={() => setIsDialogOpen(false)}
                                    id="registered-stops-dialog"
                                />
                            )}

                            <button
                                onClick={() => setIsInstructionsOpen(true)}
                                className="flex h-8 items-center space-x-4 rounded-md px-3 text-sm font-medium text-sidebar-foreground/70 transition hover:bg-sidebar-hover focus-visible:outline focus-visible:ring-2 focus-visible:ring-sidebar-ring [&>svg]:w-6 [&>svg]:h-6 [&>svg]:shrink-0"
                                aria-expanded={isInstructionsOpen}
                                aria-controls="bus-tracker-instructions-dialog"
                            >
                                <CircleHelp className="w-6 h-6"/>
                                <span>Instruções do Bus Tracker</span>
                            </button>

                            <BusTrackerInstructions
                                open={isInstructionsOpen}
                                onClose={() => setIsInstructionsOpen(false)}
                            />
                            <button
                                onClick={handleLogout}
                                className="flex h-8 items-center space-x-4 rounded-md px-3 text-sm font-medium text-sidebar-foreground/70 transition hover:bg-sidebar-hover focus-visible:outline focus-visible:ring-2 focus-visible:ring-sidebar-ring [&>svg]:w-6 [&>svg]:h-6 [&>svg]:shrink-0"
                                aria-label={isLoggedIn ? "Sair" : "Entrar"}
                            >
                                {isLoggedIn ? (
                                    <>
                                        <LogOutIcon className="w-6 h-6"/>
                                        <span>Sair</span>
                                    </>
                                ) : (
                                    <>
                                        <LogInIcon className="w-6 h-6" />
                                        <span>Entrar</span>
                                    </>
                                )}
                            </button>

                        </div>
                    </Collapsible>
                </SidebarContent>
                <SidebarFooter>
                <div className="space-y-2">
                    
                    </div>

                </SidebarFooter>
                <SidebarRail />
            </Sidebar>
        </>
    );
}
