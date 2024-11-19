import React, { useState } from "react";
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

export default function RootLayout({ }: Readonly<{ children: React.ReactNode }>) {
    const [busData, setBusData] = useState([]);

    return (
        <div className="h-screen flex font-sans">
            <div className="w-1/2">
                <ThemeProvider storageKey="vite-ui-theme">
                    <SidebarProvider defaultOpen={false}>
                        <AppSidebar />
                        <main className="flex flex-1 flex-col gap-4 p-4 pt-0 w-full h-screen">
                            <div className="flex gap-3 items-center">
                                <SidebarTrigger />
                                <ModeToggle />
                            </div>
                            <div className="flex flex-col items-center p-20 gap-8">
                                <div className="flex flex-col w-full gap-4">
                                    <img
                                        src={busIcon}
                                        className="w-12 h-12 rounded-full"
                                        alt="Bus Icon"
                                    />
                                    <Header />
                                </div>
                                <div className="w-full gap-20">
                                    <FormBusTracker setBusData={setBusData} />
                                </div>
                                <div className="w-full gap-20">
                                    <CopyRight />
                                </div>
                            </div>
                        </main>
                    </SidebarProvider>
                </ThemeProvider>
            </div>
            <div className="w-1/2 relative">
                <Map
                    submitted={false}
                    onStopSelected={() => {}}
                    selectedBusStop={null}
                    allStops={stopsData}
                    busData={[]}
                />
                <BusPopup busData={busData} />
            </div>
        </div>
    );
}
