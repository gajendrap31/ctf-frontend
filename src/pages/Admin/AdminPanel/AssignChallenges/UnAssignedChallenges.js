
import AssignChallengesTable from "../../Tables/AssignChallengeTable";
import { useState, useEffect, useMemo } from "react";
import { toast} from "react-toastify";
import { IoCloseSharp } from "react-icons/io5";
import { BeatLoader } from "react-spinners";
import Pagination from "../Pagination";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { url } from "../../../Authentication/Utility";
import { motion } from "framer-motion";
function UnAssignedChallenges({ selectedEvent, selectedEventData, onClose, fetchAssignedChallenges }) {
    const token = useMemo(() => localStorage.getItem('Token'), []);
    const [selectedChallenges, setSelectedChallenges] = useState([]);
    const [unassignedChallenges, setUnassignedChallenges] = useState([]);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchKey, setSearchKey] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [sortBy, setSortBy] = useState(0);
    const [sortDirection, setSortDirection] = useState('ASC');
    const [loadingAssign, setLoadingAssign] = useState(false);

    const [tableLoading, setTableLoading] = useState(false)
    const axiosInstance = axios.create({
        baseURL: url,
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": 'application/json',
        },
        withCredentials: true,
    });

    // Fetch unassigned challenges
    const fetchUnassignedChallenges = async (eventId) => {
        try {
            setTableLoading(true)
            const response = await axiosInstance.get(`/admin/event/${eventId}/challenge/unassigned`, {
                params: { page: currentPage - 1, size: rowsPerPage, sortBy, direction: sortDirection, searchTerm: searchKey }
            });
            setUnassignedChallenges(response.data);
        } catch (error) {
          
        } finally {
            setTableLoading(false)
        }
    };

    useEffect(() => {
        if (selectedEvent) fetchUnassignedChallenges(selectedEvent);
    }, [selectedEvent, currentPage, rowsPerPage, sortBy, sortDirection, searchKey]);

    useEffect(() => { setCurrentPage(1); }, [searchKey]);

    // Challenge selection handlers
    const handleCheckboxChange = (id, isChecked) => {
        setSelectedChallenges(prev => isChecked ? [...prev, id] : prev.filter(cid => cid !== id));
    };

    const handleSelectAllChange = (checked) => {
        if (checked) {
            const allIds = unassignedChallenges.content?.map(ch => ch.id) || [];
            setSelectedChallenges(prev => Array.from(new Set([...prev, ...allIds])));
        } else {
            const idsToRemove = new Set(unassignedChallenges.content?.map(ch => ch.id));
            setSelectedChallenges(prev => prev.filter(id => !idsToRemove.has(id)));
        }
    };

    const handleSort = (index) => {
        setCurrentPage(1)
        setSortBy(index);
        setSortDirection(prev => sortBy === index ? (prev === 'ASC' ? 'DESC' : 'ASC') : 'ASC');
    };

    const handleAssignChallenges = async () => {
        if (!selectedEvent || selectedChallenges.length === 0) {
            return toast.warn("Select an event and at least one challenge.");
        }
        try {
            setLoadingAssign(true);
            const payload = { challengeId: selectedChallenges };
            const response = await axiosInstance.post(`/admin/event/${selectedEvent}/challenge`, payload);
            toast.success(response.data || "Challenges assigned successfully!");
            setSelectedChallenges([]);
            fetchUnassignedChallenges(selectedEvent);
            fetchAssignedChallenges(selectedEvent)
        } catch (error) {
            toast.error(error.response?.data || "Assignment failed.");
        } finally {
            setLoadingAssign(false);
        }
    };

    return (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <motion.div
                key="Unassigned Challenges"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="flex items-center justify-center"
            >
                <div className="w-11/12 min-h-[80vh] min-w-[90vw] max-h-[90vh] font-Lexend_Regular overflow-auto bg-white p-2  rounded">
                    <div className="flex justify-end ">
                        <button
                            onClick={onClose}
                            className="text-gray-500 transition hover:text-gray-700"
                            title="Close"
                        >
                            <IoCloseSharp size={24} />
                        </button>
                    </div>
                    {selectedEventData && (
                        <div className="px-2">
                            <h2 className="mb-4 text-xl text-gray-700 font-Lexend_SemiBold">
                                Event Unassigned Challenges
                            </h2>
                            <div className="px-2 pt-2 border rounded-lg">
                                <div className="flex flex-col items-center justify-between gap-4 pt-2 md:flex-row">
                                    <p className="text-lg text-gray-600 font-Lexend_Medium">
                                        Event Name:{" "}
                                        <span className="font-Lexend_SemiBold text-sky-600">
                                            {selectedEventData.name}
                                        </span>
                                    </p>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <input
                                            type="text"
                                            value={searchKey}
                                            onChange={(e) => {
                                                setSearchKey(e.target.value);
                                                setCurrentPage(1);
                                            }}
                                            placeholder="Search..."
                                            className="p-2 text-gray-600 border border-gray-300 rounded h-9"
                                            title="Search by category, challenge name, or description"
                                        />
                                        <select
                                            value={rowsPerPage}
                                            onChange={(e) => {
                                                setRowsPerPage(Number(e.target.value));
                                                setCurrentPage(1);
                                            }}
                                            className="p-2 text-gray-600 border border-gray-300 rounded h-9"
                                        >
                                            {[10, 20, 50, 100].map((size) => (
                                                <option key={size} value={size}>
                                                    {size}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <AssignChallengesTable
                                    selectedEventData={selectedEventData}
                                    unAssignedChallenges={unassignedChallenges}
                                    selectedChallenge={selectedChallenges}
                                    handleCheckboxChange={handleCheckboxChange}
                                    handleSelectAllChange={handleSelectAllChange}
                                    isAllSelected={unassignedChallenges.content?.every(ch => selectedChallenges.includes(ch.id))}
                                    currentPage={currentPage}
                                    setCurrentPage={setCurrentPage}
                                    rowsPerPage={rowsPerPage}
                                    sortBy={sortBy}
                                    sortDirection={sortDirection}
                                    setSortBy={setSortBy}
                                    setSortDirection={setSortDirection}
                                    handleSort={handleSort}
                                    isLoading={tableLoading}
                                />
                                {unassignedChallenges.totalPages > 0 && (
                                    <Pagination
                                        totalItems={unassignedChallenges.totalElements}
                                        totalPages={unassignedChallenges.totalPages}
                                        currentPage={currentPage}
                                        itemsPerPage={rowsPerPage}
                                        setCurrentPage={setCurrentPage}
                                    />
                                )}
                            </div>
                            {selectedEvent && (
                                <div className="flex items-center mt-2 space-x-2">
                                    <button
                                        className={` bg-gray-700 px-4 rounded h-9 font-Lexend_Medium text-white ${selectedChallenges.length > 0 ? '' : 'cursor-not-allowed'}`}
                                        onClick={handleAssignChallenges}
                                        disabled={loadingAssign}
                                    >
                                        {loadingAssign ? <BeatLoader size={15} color="#fff" /> : "Assign"}
                                    </button>
                                    {selectedChallenges.length > 0 && (
                                        <div className="flex items-center space-x-2">
                                            <div className="relative group">
                                                {/* Selected Pill */}
                                                <p className="relative px-4 py-2 text-sm text-gray-900 border border-gray-900 rounded-full cursor-default font-Lexend_Medium">
                                                    <span className="px-2 py-1 mr-2 text-white bg-blue-600 rounded-full">
                                                        {selectedChallenges.length}
                                                    </span>
                                                    Selected

                                                    {/* Clear button overlay */}
                                                    <button
                                                        onClick={() => setSelectedChallenges([])}
                                                        className="absolute inset-0 flex items-center justify-center text-sm text-white transition-opacity duration-200 rounded-full opacity-0 bg-black/80 font-Lexend_Medium group-hover:opacity-100"
                                                    >
                                                        Clear
                                                    </button>
                                                </p>
                                            </div>
                                        </div>
                                    )}



                                </div>
                            )}

                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}

export default UnAssignedChallenges;
