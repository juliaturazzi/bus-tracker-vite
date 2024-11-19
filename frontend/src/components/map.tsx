import React, {useEffect, useRef} from 'react';
import 'ol/ol.css';
import {Feature, Map, View} from 'ol';
import TileLayer from 'ol/layer/Tile';
import {OSM} from 'ol/source';
import {fromLonLat} from 'ol/proj';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import {Point} from 'ol/geom';
import {Icon, Style} from 'ol/style';
import Overlay from 'ol/Overlay';
import busIcon from '../images/bus-icon.png';
import busStopIcon from '../images/bus-stop-icon.png';
import ol from "ol/dist/ol";

type OpenLayersMapProps = {
    submitted: any;
    onStopSelected: (stop: any) => void;
    selectedBusStop: any;
    allStops: any;
    busData: any;
};

interface MapProps {
    setSelectStop?: (value: (((prevState: string) => string) | string)) => void
}

const OpenLayersMap: React.FC<OpenLayersMapProps> = ({
                                                         busData,
                                                         allStops,
                                                         onStopSelected,
                                                         setSelectStop,
                                                     }) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const popupRef = useRef<HTMLDivElement>(null);

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
        const busSource = new VectorSource({features: busFeatures});
        const stopSource = new VectorSource({features: stopFeatures});
        const busLayer = new VectorLayer({source: busSource});
        const stopLayer = new VectorLayer({source: stopSource});

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
                center: fromLonLat([-43.1729, -22.9068]), // Center the map (optional)
                zoom: 12,
            }),
        });

        // Create popup overlay
        const popup = new Overlay({
            element: popupRef.current as HTMLElement,
            positioning: 'bottom-center',
            stopEvent: false,
            offset: [0, -15],
        });
        map.addOverlay(popup);

        // Handle stop click event to show a popup
        map.on('singleclick', function (evt) {
            map.forEachFeatureAtPixel(evt.pixel, function (feature) {
                const stopInfo = feature.get('stopInfo');
                if (stopInfo && stopInfo.stop_name) {
                    setSelectStop(stopInfo.id);

                    const popupElement = popup.getElement();
                    if (popupElement) {
                        popupElement.innerHTML = `<strong>Ponto: ${stopInfo.stop_name || 'Stop Name Not Available'}</strong>`;
                    }

                    popup.setPosition(evt.coordinate);
                    if (popupElement) {
                        popupElement.style.display = 'block';
                    }
                }
            });
        });

        // Close the popup when clicking anywhere on the map
        map.on('click', function () {
            const popupElement = popup.getElement();
            if (popupElement) {
                popupElement.style.display = 'none';
            }
        });

        return () => map.setTarget(undefined);
    }, [busData, allStops, onStopSelected]);

    return (
        <div style={{width: '100%', height: '100vh', position: 'relative'}}>
            <div ref={mapRef} style={{width: '100%', height: '100%'}}/>
            <div
                ref={popupRef}
                id="popup"
                className="bg-slate-100 text-xs font-normal text-zinc-900 p-2 border border-gray-300 rounded-md shadow-md hidden font-sans"
            ></div>
        </div>
    );
};

export default OpenLayersMap;
