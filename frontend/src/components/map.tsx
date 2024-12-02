import React, { useEffect, useRef, useState } from "react";
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
    setSelectStop?: (value: ((prevState: string) => string) | string) => void;
    formStop?: string | null;
};

const OpenLayersMap: React.FC<OpenLayersMapProps> = ({
                                                         busData,
                                                         allStops,
                                                         setSelectStop,
                                                         formStop,
                                                     }) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const popupRef = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<Map | null>(null);
    const busLayerRef = useRef<VectorLayer | null>(null);
    const stopLayerRef = useRef<VectorLayer | null>(null);
    const formStopMarker = useRef<VectorLayer | null>(null);

    const [stopNotFound, setStopNotFound] = useState(false);

    console.log("busData", busData);


    useEffect(() => {
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

        const busSource = new VectorSource({ features: busFeatures });
        const stopSource = new VectorSource({ features: stopFeatures });

        const busLayer = new VectorLayer({ source: busSource });
        const stopLayer = new VectorLayer({ source: stopSource });

        busLayerRef.current = busLayer;
        stopLayerRef.current = stopLayer;

        const map = new Map({
            target: mapRef.current as HTMLElement,
            layers: [
                new TileLayer({
                    source: new OSM(),
                }),
                stopLayer,
                busLayer,
            ],
            view: new View({
                center: fromLonLat([-43.1729, -22.9068]),
                zoom: 12,
            }),
        });

        mapInstance.current = map;


        const formStopSource = new VectorSource();
        const formStopLayer = new VectorLayer({
            source: formStopSource,
            style: new Style({
                image: new Icon({
                    src: busStopIcon,
                    scale: 0.1,
                }),
            }),
            zIndex: 1000,
        });
        map.addLayer(formStopLayer);
        formStopMarker.current = formStopLayer;

        const popup = new Overlay({
            element: popupRef.current as HTMLElement,
            positioning: "bottom-center",
            stopEvent: false,
            offset: [0, -15],
        });
        map.addOverlay(popup);

        map.on("singleclick", (evt) => {
            let foundStop = false;

            map.forEachFeatureAtPixel(evt.pixel, (feature) => {
                const stopInfo = feature.get("stopInfo");
                if (stopInfo) {
                    foundStop = true;
                    setSelectStop?.(stopInfo.id);

                    const coordinates = feature.getGeometry().getCoordinates();
                    console.log("Coordinates:", coordinates);
                    map.getView().animate({
                        center: coordinates,
                        zoom: 15,
                        duration: 500,
                    });

                    const popupElement = popup.getElement();
                    if (popupElement) {
                        popupElement.innerHTML = `<strong>Ponto: ${stopInfo.stop_name || "Stop Name Not Available"}</strong>`;
                        popup.setPosition(coordinates);
                        popupElement.style.display = "block";
                    }

                    if (formStopMarker.current) {
                        const selectedFeature = new Feature({
                            geometry: new Point(coordinates),
                        });
                        formStopMarker.current.getSource()?.clear();
                        formStopMarker.current.getSource()?.addFeature(selectedFeature);
                    }
                }
            });

            if (!foundStop) {
                const popupElement = popup.getElement();
                if (popupElement) {
                    popupElement.style.display = "none";
                }

                if (formStopMarker.current) {
                    formStopMarker.current.getSource()?.clear();
                }
            }
        });

        map.on("pointermove", (evt) => {
            const popupElement = popup.getElement();
            if (popupElement) {
                popupElement.style.display = "none";
            }

            map.forEachFeatureAtPixel(evt.pixel, (feature) => {
                const stopInfo = feature.get("stopInfo");
                if (stopInfo) {
                    popupElement.innerHTML = `<strong>Ponto: ${stopInfo.stop_name || "Stop Name Not Available"}</strong>`;
                    popupElement.style.display = "block";
                    popup.setPosition(evt.coordinate);
                }
            });
        });

        return () => map.setTarget(undefined);
    }, [busData, allStops, setSelectStop]);

    useEffect(() => {
        if (mapInstance.current) {
            const map = mapInstance.current;
            if (formStop) {
                const stop = allStops.find(
                    (s: { id: string; stop_name: string; stop_lon: number; stop_lat: number }) =>
                        s.id === formStop || s.stop_name === formStop
                );

                if (stop) {
                    setStopNotFound(false);
                    const coordinates = fromLonLat([stop.stop_lon, stop.stop_lat]);
                    console.log("Coordinates 2:", coordinates);
                    map.getView().animate({ center: coordinates, zoom: 15, duration: 500 });


                    if (formStopMarker.current) {
                        const selectedFeature = new Feature({
                            geometry: new Point(coordinates),
                        });
                        formStopMarker.current.getSource()?.clear();
                        formStopMarker.current.getSource()?.addFeature(selectedFeature);
                    }
                } else {
                    setStopNotFound(true);
                }
            } else {
                formStopMarker.current?.getSource()?.clear();
                map.getView().animate({ center: fromLonLat([-43.1729, -22.9068]), zoom: 12, duration: 500 });
                setStopNotFound(false);
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
            {stopNotFound && (
                <div className="absolute top-5 left-5 bg-red-100 text-red-700 p-2 rounded">
                    Ponto de Ônibus não encontrado. Por favor, verifique novamente.
                </div>
            )}
        </div>
    );
};

export default OpenLayersMap;
