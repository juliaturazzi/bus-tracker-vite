import React, {useEffect, useState} from "react";
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
    const [formData, setFormData] = useState({});
    const [lineData, setLineData] = useState("");
    const [selectedStop, setSelectedStop] = useState("");

    // write way to parse and get information from formData
    useEffect(() => {
        if (formData.busLine) {
            setLineData(formData.busLine);
        }
    }, [formData]);

    useEffect(() => {
        if (selectedStop) {
            setSelectedStop(selectedStop);
        }
        console.log("selectedStop:", selectedStop);
    }
    , [selectedStop]);

    return (
        <div className="h-screen flex font-sans">
            <ThemeProvider storageKey="vite-ui-theme">
                <div className="w-1/2">
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
                                    <FormBusTracker mapStop={selectedStop} setBusData={setBusData} setFormData={setFormData} />
                                </div>
                                <div className="w-full gap-20">
                                    <CopyRight />
                                </div>
                            </div>
                        </main>
                    </SidebarProvider>
            </div>
            <div className="w-1/2 relative">
                <Map
                    submitted={false}
                    onStopSelected={() => {}}
                    selectedBusStop={null}
                    setSelectStop={setSelectedStop}
                    allStops={stopsData}
                    busData={[]}
                />
                <BusPopup busData={busData} lineData={lineData} />
            </div>
            </ThemeProvider>
        </div>
    );
}
