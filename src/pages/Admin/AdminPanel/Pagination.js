import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/solid';
import { useEffect } from 'react';
function Pagination({
    totalItems,
    totalPages,
    currentPage,
    itemsPerPage,
    setCurrentPage,
}) {

    const handlePrevious = () => {
        if (currentPage > 0) setCurrentPage((prev) => prev - 1);
    };

    const handleNext = () => {
        if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
    };
    useEffect(() => {
        if (currentPage > totalPages ) {
            setCurrentPage(totalPages);
        }
    }, [totalPages, currentPage]);

    const renderPageNumbers = () => {
        const pageNumbers = [];
        const visiblePages = 3;

        // Define start and end page indices for the pagination
        const startPage = Math.max(1, currentPage - Math.floor(visiblePages / 2));
        const endPage = Math.min(totalPages, startPage + visiblePages - 1);

        if (startPage > 1) {
            pageNumbers.push(
                <button
                    key={1}
                    onClick={() => setCurrentPage(1)}
                    className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20"
                >
                    1
                </button>
            );

            if (startPage > 2) {
                pageNumbers.push(
                    <span
                        key="start-ellipsis"
                        className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-400"
                    >
                        ...
                    </span>
                );
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(
                <button
                    key={i}
                    onClick={() => setCurrentPage(i)}
                    className={`relative inline-flex items-center px-4 py-2 text-sm font-Lexend_Regular ${currentPage === i
                        ? "z-10 bg-slate-800 text-white"
                        : "text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                        } focus:z-20`}
                >
                    {i}
                </button>
            );
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                pageNumbers.push(
                    <span
                        key="end-ellipsis"
                        className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-400 border border-gray-200"
                    >
                        ...
                    </span>
                );
            }

            pageNumbers.push(
                <button
                    key={totalPages}
                    onClick={() => setCurrentPage(totalPages)}
                    className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20"
                >
                    {totalPages}
                </button>
            );
        }

        return pageNumbers;
    };

    return (
        <div className="flex items-center justify-between px-0 py-2 mt-1 bg-white border-gray-200 rounded-lg sm:rounded-b-lg sm:rounded-t-none sm:px-6 sm:mt-0">
            <div className="flex items-center justify-between flex-1 sm:hidden ">
                <nav
                    aria-label="Pagination"
                    className="inline-flex justify-between w-full -space-x-px rounded-md shadow-sm isolate font-Lexend_Medium"
                >
                    <button
                        onClick={handlePrevious}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 text-gray-500 rounded-md ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Previous
                    </button>
                    <div className='flex items-center'>
                        <p className="text-sm text-gray-700">
                            Showing{" "}
                            <span className="font-Lexend_Medium">
                                {(currentPage - 1) * itemsPerPage + 1}
                            </span>{" "}
                            to{" "}
                            <span className="font-Lexend_Medium">
                                {Math.min(currentPage * itemsPerPage, totalItems)}
                            </span>{" "}
                            of <span className="font-Lexend_Medium">{totalItems}</span> results
                        </p>
                    </div>
                    <button
                        onClick={handleNext}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-2 py-2 text-gray-500 rounded-md ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Next
                    </button>
                </nav>
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between font-Lexend_Regular">
                <div>
                    <p className="text-sm text-gray-700">
                        Showing{" "}
                        <span className="font-Lexend_Medium">
                            {(currentPage - 1) * itemsPerPage + 1}
                        </span>{" "}
                        to{" "}
                        <span className="font-Lexend_Medium">
                            {Math.min(currentPage * itemsPerPage, totalItems)}
                        </span>{" "}
                        of <span className="font-Lexend_Medium">{totalItems}</span> results
                    </p>
                </div>
                <div>
                    <nav
                        aria-label="Pagination"
                        className="inline-flex -space-x-px rounded-md shadow-sm isolate"
                    >
                        <button
                            onClick={handlePrevious}
                            disabled={currentPage === 1}
                            className="relative inline-flex items-center px-2 py-2 text-gray-400 rounded-l-md ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <span className="sr-only">Previous</span>
                            <ChevronLeftIcon aria-hidden="true" className="w-5 h-5" />
                        </button>

                        {renderPageNumbers()}

                        <button
                            onClick={handleNext}
                            disabled={currentPage === totalPages}
                            className="relative inline-flex items-center px-2 py-2 text-gray-400 rounded-r-md ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <span className="text-red-600 sr-only">Next</span>
                            <ChevronRightIcon aria-hidden="true" className="w-5 h-5" />
                        </button>
                    </nav>
                </div>
            </div>
        </div>
    );
}

export default Pagination