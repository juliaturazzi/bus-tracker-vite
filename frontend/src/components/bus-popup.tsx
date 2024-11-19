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
        <div>
            <Table>
                <thead>
                <tr>
                    <th>Order</th>
                    <th>Distance</th>
                    <th>Speed</th>
                </tr>
                </thead>
                <tbody>
                {paginatedData.map((bus) => (
                    <tr key={bus.order}>
                        <td>{bus.order}</td>
                        <td>{bus.distance}</td>
                        <td>{bus.speed}</td>
                    </tr>
                ))}
                </tbody>
            </Table>
            <Pagination
                current={currentPage}
                onPageChange={setCurrentPage}
                total={Math.ceil(busData.length / itemsPerPage)}
            />
        </div>
    );
};

const BusPopup = ({ busData }) => {
    const [isOpen, setIsOpen] = useState(false);

    if (!busData?.length) return null;

    const nearestBus = busData.reduce((prev, current) =>
            prev.distance < current.distance ? prev : current
        , busData[0]);

    return (
        <div className="absolute top-10 right-10 bg-black p-4 rounded-lg shadow-lg">
            <h3 className="text-lg font-bold">Nearest Bus</h3>
            <p>Order: {nearestBus.order}</p>
            <p>Distance: {nearestBus.distance}</p>
            <p>Speed: {nearestBus.speed}</p>
            <Button onClick={() => setIsOpen(true)}>View All Buses</Button>

            {isOpen && <BusTable busData={busData} />}
        </div>
    );
};

export default BusPopup;
