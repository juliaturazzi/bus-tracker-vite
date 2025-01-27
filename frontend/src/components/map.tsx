import React, { useEffect, useRef } from "react";
import "ol/ol.css";
import { Feature, Map, View } from "ol";
import TileLayer from "ol/layer/Tile";
import { OSM } from "ol/source";
import { fromLonLat } from "ol/proj";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { Point } from "ol/geom";
import { Icon, Style } from "ol/style";
import Overlay from "ol/Overlay";
import busIcon from "../images/bus-icon.png";
import busStopIcon from "../images/bus-stop-icon.png";

type OpenLayersMapProps = {
    submitted: any;
    onStopSelected: (stop: any) => void;
    selectedBusStop: any;
    allStops: any;
    busData: any;
    formStop?: string | null; // The selected stop ID from the form
};

interface MapProps {
    setSelectStop?: (value: ((prevState: string) => string) | string) => void;
}

const OpenLayersMap: React.FC<OpenLayersMapProps> = ({
                                                         busData,
                                                         allStops,
                                                         onStopSelected,
                                                         setSelectStop,
                                                         formStop,
                                                     }) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const popupRef = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<Map | null>(null); // Store the map instance for further updates
    const busLayerRef = useRef<VectorLayer | null>(null); // Reference for the bus layer
    const stopLayerRef = useRef<VectorLayer | null>(null); // Reference for the stop layer
    const formStopMarker = useRef<VectorLayer | null>(null); // Marker layer for formStop

    useEffect(() => {
        // Convert bus data into features
        const busFeatures = busData.map((bus: { longitude: number; latitude: number }) => {
            const feature = new Feature({
                geometry: new Point(fromLonLat([bus.longitude, bus.latitude])),
                busInfo: bus,
            });
            feature.setStyle(
                new Style({
                    image: new Icon({
                        src: busIcon,
                        scale: 0.1,
                    }),
                })
            );
            return feature;
        });

        // Convert stop data into features
        const stopFeatures = allStops.map((stop: { stop_lon: number; stop_lat: number; stop_name: string }) => {
            const feature = new Feature({
                geometry: new Point(fromLonLat([stop.stop_lon, stop.stop_lat])),
                stopInfo: stop,
            });
            feature.setStyle(
                new Style({
                    image: new Icon({
                        src: busStopIcon,
                        scale: 0.05,
                    }),
                })
            );
            return feature;
        });

        // Set up sources and layers
        const busSource = new VectorSource({ features: busFeatures });
        const stopSource = new VectorSource({ features: stopFeatures });

        const busLayer = new VectorLayer({ source: busSource });
        const stopLayer = new VectorLayer({ source: stopSource });

        busLayerRef.current = busLayer; // Store the bus layer for later removal
        stopLayerRef.current = stopLayer; // Store the stop layer for later removal

        // Create the map
        const map = new Map({
            target: mapRef.current as HTMLElement,
            layers: [
                new TileLayer({
                    source: new OSM(),
                }),
                busLayer,
                stopLayer,
            ],
            view: new View({
                center: fromLonLat([-43.1729, -22.9068]), // Default center
                zoom: 12,
            }),
        });

        mapInstance.current = map; // Store the map instance for later updates

        // Initialize formStopMarker with a VectorSource and Style
        const formStopSource = new VectorSource();
        const formStopLayer = new VectorLayer({
            source: formStopSource,
            style: new Style({
                image: new Icon({
                    src: busStopIcon,
                    scale: 0.1, // Adjust scale as needed
                }),
            }),
            zIndex: 1000, // Ensure it's above other layers
        });
        map.addLayer(formStopLayer);
        formStopMarker.current = formStopLayer;

        // Create popup overlay
        const popup = new Overlay({
            element: popupRef.current as HTMLElement,
            positioning: "bottom-center",
            stopEvent: false,
            offset: [0, -15],
        });
        map.addOverlay(popup);

        // Handle stop click event to show a popup
        map.on("singleclick", function (evt) {
            map.forEachFeatureAtPixel(evt.pixel, function (feature) {
                const stopInfo = feature.get("stopInfo");
                if (stopInfo && stopInfo.stop_name) {
                    setSelectStop?.(stopInfo.id);

                    const popupElement = popup.getElement();
                    if (popupElement) {
                        popupElement.innerHTML = `<strong>Ponto: ${stopInfo.stop_name || "Stop Name Not Available"}</strong>`;
                    }

                    popup.setPosition(evt.coordinate);
                    if (popupElement) {
                        popupElement.style.display = "block";
                    }
                }
            });
        });

        // Handle hover event to show popup
        map.on("pointermove", function (evt) {
            const popupElement = popup.getElement();
            if (popupElement) {
                // Hide the popup by default
                popupElement.style.display = "none";
            }

            map.forEachFeatureAtPixel(evt.pixel, function (feature) {
                const stopInfo = feature.get("stopInfo");
                if (stopInfo && stopInfo.stop_name) {
                    if (popupElement) {
                        popupElement.innerHTML = `<strong>Ponto: ${stopInfo.stop_name || "Stop Name Not Available"}</strong>`;
                        popupElement.style.display = "block"; // Show the popup
                    }
                    popup.setPosition(evt.coordinate);
                }
            });
        });


        // Close the popup when clicking anywhere on the map
        map.on("click", function () {
            const popupElement = popup.getElement();
            if (popupElement) {
                popupElement.style.display = "none";
            }
        });

        return () => map.setTarget(undefined); // Cleanup
    }, [busData, allStops, setSelectStop]);

    // Effect to center and zoom on formStop, and update the marker
    useEffect(() => {
        if (mapInstance.current) {
            if (formStop) {
                const stop = allStops.find(
                    (s: { id: string; stop_name: string }) =>
                        s.id === formStop || s.stop_name === formStop
                );

                if (stop) {
                    const stopCoordinates = fromLonLat([stop.stop_lon, stop.stop_lat]);

                    // Center and zoom the map with animation
                    mapInstance.current.getView().animate({
                        center: stopCoordinates,
                        zoom: 15,
                        duration: 500,
                    });

                    // Hide all other markers
                    if (busLayerRef.current) {
                        busLayerRef.current.setVisible(false);
                    }
                    if (stopLayerRef.current) {
                        stopLayerRef.current.setVisible(false);
                    }

                    // Update the formStopMarker's source
                    const stopFeature = new Feature({
                        geometry: new Point(stopCoordinates),
                    });

                    formStopMarker.current?.getSource()?.clear();
                    formStopMarker.current?.getSource()?.addFeature(stopFeature);
                    formStopMarker.current?.getSource()?.changed(); // Force update
                } else {
                    // Handle the case where formStop doesn't match any stop
                    console.warn(`Stop "${formStop}" not found.`);
                }
            } else {
                // formStop is null or empty, reset the map

                // Clear the formStopMarker's source
                formStopMarker.current?.getSource()?.clear();

                // Show all other markers
                if (busLayerRef.current) {
                    busLayerRef.current.setVisible(true);
                }
                if (stopLayerRef.current) {
                    stopLayerRef.current.setVisible(true);
                }

                // Reset the view to the default center and zoom with animation
                mapInstance.current.getView().animate({
                    center: fromLonLat([-43.1729, -22.9068]), // Default center
                    zoom: 12, // Default zoom level
                    duration: 500,
                });
            }
        }
    }, [formStop, allStops]);

    return (
        <div style={{ width: "100%", height: "100vh", position: "relative" }}>
            <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
            <div
                ref={popupRef}
                id="popup"
                className="bg-slate-100 text-xs font-normal text-zinc-900 p-2 border border-gray-300 rounded-md shadow-md hidden font-sans"
            ></div>
        </div>
    );
};

export default OpenLayersMap;
