import { useState } from "react";
import { Table } from "@/components/ui/table";
import { Pagination } from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";

const BusTable = ({ busData }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const paginatedData = busData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="overflow-hidden rounded-lg shadow-md">
            <Table className="w-full text-center border-collapse">
                <thead>
                <tr className="bg-black-800 text-white">
                    <th className="py-2 px-4">Ordem</th>
                    <th className="py-2 px-4">Velocidade</th>
                    <th className="py-2 px-4">Distância</th>
                </tr>
                </thead>
                <tbody>
                {paginatedData.map((bus, index) => (
                    <tr
                        key={index}
                        className={`${
                            index % 2 === 0 ? "bg-zinc-950" : "bg-zinc-900"
                        }`}
                    >
                        <td className="py-2 px-4">{bus.order}</td>
                        <td className="py-2 px-4">{bus.speed}km/h</td>
                        <td className="py-2 px-4">{bus.distance}</td>
                    </tr>
                ))}
                </tbody>
            </Table>
            <div className="mt-4 flex justify-center">
                <Pagination
                    current={currentPage}
                    onPageChange={setCurrentPage}
                    total={Math.ceil(busData.length / itemsPerPage)}
                />
            </div>
        </div>
    );
};

const BusPopup = ({ busData, lineData }) => {
    const [isOpen, setIsOpen] = useState(false);

    if (!busData?.length) return null;

    const orderedBusData = busData.sort((a, b) => a.distance - b.distance);

    const nearestBus = busData.reduce((prev, current) =>
            prev.distance < current.distance ? prev : current
        , busData[0]);

    return (
        <div
            className={`absolute bottom-10 left-1/2 transform -translate-x-1/2 bg-black ${
                isOpen ? "w-[95%] max-w-4xl p-6 rounded-3xl" : "w-[90%] max-w-xl p-2 rounded-full"
            } shadow-lg flex flex-col items-center text-white transition-all duration-100`}
            onClick={!isOpen ? () => setIsOpen(true) : undefined} // Only open on click when closed
        >
            {!isOpen ? (
                <div className="flex items-center justify-between w-full">
                    <div className="flex-1 text-center border-r border-gray-500 px-4">
                        <p className="text-xs">Ordem</p>
                        <p className="text-lg font-bold">{nearestBus.order}</p>
                    </div>
                    <div className="flex-1 text-center border-r border-gray-500 px-4">
                        <p className="text-xs">Velocidade</p>
                        <p className="text-lg font-bold">{nearestBus.speed}km/h</p>
                    </div>
                    <div className="flex-1 text-center px-4">
                        <p className="text-xs">Distância (minutos)</p>
                        <p className="text-lg font-bold">{nearestBus.distance}</p>
                    </div>
                </div>
            ) : (
                <div className="w-full">
                    <h2 className="text-lg font-extrabold text-left mb-4">Todos os ônibus - {lineData}</h2>
                    <BusTable busData={orderedBusData} />
                    <div className="mt-4 flex justify-center">
                        <Button
                            className="max-w-sm bg-red-500 hover:bg-red-600 text-white rounded-md py-2"
                            onClick={(e) => {
                                e.stopPropagation(); // Prevent closing when interacting with content
                                setIsOpen(false);
                            }}
                        >
                            Fechar
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BusPopup;
