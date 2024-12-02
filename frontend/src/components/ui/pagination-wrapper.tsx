import React from "react";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationPrevious,
    PaginationNext
} from "@/components/ui/pagination";

type PaginationWrapperProps = {
    currentPage: number; 
    totalPages: number; 
    onPageChange: (page: number) => void; 
};

const PaginationWrapper: React.FC<PaginationWrapperProps> = ({
                                                                 currentPage,
                                                                 totalPages,
                                                                 onPageChange,
                                                             }) => {
    const handlePrevious = () => {
        if (currentPage > 1) {
            onPageChange(currentPage - 1);
        }
    };

    const handleNext = () => {
        if (currentPage < totalPages) {
            onPageChange(currentPage + 1);
        }
    };

    const renderPageItems = () => {
        const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

        return pages.map((page) => (
            <PaginationItem key={page}>
                <PaginationLink
                    isActive={page === currentPage}
                    onClick={() => onPageChange(page)}
                >
                    {page}
                </PaginationLink>
            </PaginationItem>
        ));
    };

    return (
        <Pagination>
            <PaginationContent>
                <PaginationPrevious onClick={handlePrevious} />
                {renderPageItems()}
                <PaginationNext onClick={handleNext} />
            </PaginationContent>
        </Pagination>
    );
};

export default PaginationWrapper;
