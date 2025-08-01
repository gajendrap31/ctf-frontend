import React from "react";
import { MdArrowDropUp, MdArrowDropDown } from "react-icons/md";
import Pagination from "./Pagination";
const DataTable = ({ columns, data, sortBy, sortDirection, handleSort, currentPage, totalPages, handlePrevious, handleNext, itemsPerPage, setCurrentPage, totalItems }) => {
    return (
        <div className="overflow-x-auto pt-4">
            <table className="w-full rounded-lg bg-white font-Lexend_Regular">
                <thead>
                    <tr className="h-10 bg-slate-100 border-b-2">
                        {columns.map((column, index) => (
                            <th
                                key={index}
                                className="text-start ps-3 border cursor-pointer"
                                onClick={() => handleSort(index)}
                            >
                                <div className="flex items-center space-x-2">
                                    <p>{column.label}</p>
                                    {column.sortable && (
                                        <div className="flex flex-col leading-none -space-y-3">
                                            <MdArrowDropUp
                                                size={20}
                                                className={sortBy === index && sortDirection === "ASC" ? "text-black" : "text-gray-400"}
                                            />
                                            <MdArrowDropDown
                                                size={20}
                                                className={sortBy === index && sortDirection === "DESC" ? "text-black" : "text-gray-400"}
                                            />
                                        </div>
                                    )}
                                </div>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data?.length > 0 ? (
                        data.map((row, rowIndex) => (
                            <tr key={rowIndex} className="h-9 border-b-2 p-1 text-gray-700">
                                {columns.map((column, colIndex) => (
                                    <td key={colIndex} className="ps-3">
                                        {column.render ? column.render(row, rowIndex) : row[column.accessor]}
                                    </td>
                                ))}
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={columns.length} className="text-center text-gray-500">
                                No data available.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
            {totalPages > 0 && (
                <Pagination
                    totalItems={totalItems}
                    totalPages={totalPages}
                    currentPage={currentPage}
                    handlePrevious={handlePrevious}
                    handleNext={handleNext}
                    itemsPerPage={itemsPerPage}
                    setCurrentPage={setCurrentPage}
                />
            )}
        </div>
    );
};

export default DataTable;
