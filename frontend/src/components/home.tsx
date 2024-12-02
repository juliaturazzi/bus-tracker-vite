import FormBusTracker from "@/components/form-bus";
import Header from "@/components/header";
import busIcon from "@/images/bus-icon-app.png";
import CopyRight from "@/components/copy-right";
import Map from "@/components/map";
import stopsData from "@/stops.json";
import BusPopup from "@/components/bus-popup";
import { useState, useEffect } from "react";

export function HomePage = () => {
    const [busData, setBusData] = useState([]);
    const [formData, setFormData] = useState({});
    const [lineData, setLineData] = useState("");
    const [selectedStop, setSelectedStop] = useState("");
    const [formStop, setFormStop] = useState("");

    useEffect(() => {
        if (formData.busLine) {
            setLineData(formData.busLine);
        }
    }, [formData]);

    useEffect(() => {
        console.log("selectedStop:", selectedStop);
    }, [selectedStop]);

    return (
        <div className="flex flex-col items-center p-20">
            <div className="flex flex-col w-full gap-4">
                <img src={busIcon} className="w-12 h-12 rounded-full" alt="Bus Icon" />
                <Header />
            </div>
            <div className="w-full gap-20">
                <FormBusTracker
                    isLoggedIn={true}
                    mapStop={selectedStop}
                    setBusData={setBusData}
                    setFormData={setFormData}
                    setFormStop={setFormStop}
                />
            </div>
            <div className="w-full gap-20">
                <CopyRight />
            </div>
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
    );
};