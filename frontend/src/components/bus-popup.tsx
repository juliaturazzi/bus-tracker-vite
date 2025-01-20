import {useState} from "react";
import {Table} from "@/components/ui/table";
import {Button} from "@/components/ui/button";
import PaginationWrapper from "@/components/ui/pagination-wrapper";


const BusTable = ({busData, currentPage, onPageChange}) => {
    const itemsPerPage = 10;

    const paginatedData = busData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="overflow-hidden rounded-lg">
            <Table className="w-full text-center border-collapse bg-slate-300 text-black dark:bg-zinc-800 dark:text-white">
                <thead>
                    <tr className="bg-slate-50 text-black dark:bg-zinc-800 dark:text-white">
                        <th className="py-2 px-4">Ordem</th>
                        <th className="py-2 px-4">Velocidade</th>
                        <th className="py-2 px-4">Distância</th>
                    </tr>
                </thead>
                <tbody>
                    {paginatedData.map((bus, index) => (
                        <tr
                            key={index}
                            className={`${index % 2 === 0 ? "bg-slate-100 dark:bg-zinc-950" : "bg-slate-200 dark:bg-zinc-900"
                                }`}
                        >
                            <td className="py-2 px-4 text-black dark:text-white">{bus.order}</td>
                            <td className="py-2 px-4 text-black dark:text-white">{bus.speed}km/h</td>
                            <td className="py-2 px-4 text-black dark:text-white">{bus.distance}</td>
                        </tr>
                    ))}
                </tbody>
            </Table>
            <div className="mt-4 flex justify-center bg-slate-300 dark:bg-zinc-950">
                <PaginationWrapper
                    currentPage={currentPage}
                    totalPages={Math.ceil(busData.length / itemsPerPage)}
                    onPageChange={onPageChange}
                />
            </div>
        </div>
    );
};





const BusPopup = ({busData, lineData}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);

    if (!busData?.length) return null;

    const orderedBusData = busData.sort((a, b) => a.distance - b.distance);

    const nearestBus = busData.reduce((prev, current) =>
        prev.distance < current.distance ? prev : current,
        busData[0]
    );

    return (
        <div
            className={`fixed md:absolute bottom-10 left-1/2 transform -translate-x-1/2 border-2 border-solid border-black dark:border-slate-800 bg-slate-300 dark:bg-zinc-950 ${isOpen ? 'w-[95%] max-w-4xl p-6 rounded-3xl' : 'w-[90%] max-w-xl p-2 rounded-full'
                } shadow-lg flex flex-col items-center text-white transition-all duration-100`}
            onClick={!isOpen ? () => setIsOpen(true) : undefined}
        >
            {!isOpen ? (
                <div className="flex text-black dark:text-white items-center justify-between w-full">
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
                <div className="w-full bg-slate-300 dark:bg-zinc-950 text-black dark:text-white">
                    <h2 className="text-lg font-extrabold text-left mb-4">Todos os ônibus - {lineData}</h2>
                    <BusTable
                        busData={orderedBusData}
                        currentPage={currentPage}
                        onPageChange={setCurrentPage}
                    />
                    <div className="mt-4 flex justify-center">
                        <Button
                            className="max-w-sm bg-red-500 hover:bg-red-600 text-white rounded-md py-2"
                            onClick={(e) => {
                                e.stopPropagation();
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
