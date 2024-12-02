import React, { useState, useEffect } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeProvider } from "@/components/theme-provider";
import Map from "@/components/map";
import stopsData from "@/stops.json";
import busIcon from "@/images/bus-icon-app.png";
import Header from "@/components/header";
import FormBusTracker from "@/components/form-bus";
import CopyRight from "@/components/copy-right";
import { ModeToggle } from "@/components/mode-toggle";
import BusPopup from "@/components/bus-popup";
import { AuthDialog } from "@/components/login";
import { useAuth } from "@/components/auth_context";

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    const { isLoggedIn } = useAuth(); // Access login state from AuthContext
    const [hasSkippedLogin, setHasSkippedLogin] = useState(false); // Tracks if user skips login
    const [busData, setBusData] = useState([]);
    const [formData, setFormData] = useState({});
    const [lineData, setLineData] = useState("");
    const [selectedStop, setSelectedStop] = useState("");
    const [formStop, setFormStop] = useState("");

    useEffect(() => {
        if (formData.bus_line) {
            setLineData(formData.bus_line);
        }
    }, [formData]);

    useEffect(() => {
        console.log("selectedStop:", selectedStop);
    }, [selectedStop]);

    // Show AuthDialog only if the user isn't logged in and hasn't skipped login
    if (!isLoggedIn && !hasSkippedLogin) {
        return (
            <ThemeProvider storageKey="vite-ui-theme">
            <div className="flex items-center justify-center h-screen">
                <AuthDialog
                    isOpen={true}
                    onClose={() => setHasSkippedLogin(true)} // User chooses to skip login
                />
            </div>
                </ThemeProvider>
        );
    }

    // Render main app layout for both logged-in users and users who skipped login
    return (
        <div className="h-screen flex font-sans">
            <ThemeProvider storageKey="vite-ui-theme">
                <div className="w-1/2">
                    <SidebarProvider defaultOpen={false}>
                        <AppSidebar isLoggedIn={isLoggedIn} />
                        <main className="flex flex-1 flex-col gap-2 p-2 pt-0 w-full h-screen">
                            <div className="flex gap-1 items-center">
                                <SidebarTrigger />
                                <ModeToggle />
                            </div>
                            <div className="flex flex-col items-center p-20">
                                <div className="flex flex-col w-full gap-4">
                                    <img src={busIcon} className="w-12 h-12 rounded-full" alt="Bus Icon" />
                                    <Header />
                                </div>
                                <div className="w-full gap-20">
                                    <FormBusTracker
                                        isLoggedIn={isLoggedIn}
                                        mapStop={selectedStop}
                                        setBusData={setBusData}
                                        setFormData={setFormData}
                                        setFormStop={setFormStop}
                                    />
                                </div>
                                <div className="w-full gap-20">
                                    <CopyRight />
                                </div>
                            </div>
                        </main>
                    </SidebarProvider>
                </div>
                <div className="w-1/2 h-screen relative">
                    <Map
                        submitted={false}
                        onStopSelected={() => {}}
                        selectedBusStop={formStop}
                        setSelectStop={setSelectedStop}
                        allStops={stopsData}
                        busData={[]}
                        formStop={formStop}
                    />
                    <BusPopup busData={busData} lineData={lineData} />
                </div>
            </ThemeProvider>
        </div>
    );
}
