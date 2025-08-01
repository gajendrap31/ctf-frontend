import Sidebar from "../../Sidebar";
import Navbar from "../../Navbar";
import { useState, useEffect, useCallback, useMemo } from "react";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useLocation, useNavigate } from "react-router-dom";
import Select from "react-select";
import { BeatLoader } from 'react-spinners';
import Pagination from "../Pagination";
import AuthService from "../../../Authentication/AuthService";

import AssignedChallengeTable from "../../Tables/AssignedChallengeTable";
import EventSelector from "../EventSelector";
import UnAssignedChallenges from "./UnAssignedChallenges";
import { FaPlusCircle } from "react-icons/fa";
import { IoCloseSharp } from "react-icons/io5";
import { AiOutlineCloseCircle } from "react-icons/ai";
import axios from "axios";
import { url } from "../../../Authentication/Utility";
import { AsyncPaginate } from "react-select-async-paginate";
import { useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
function AssignChallenges({ userDetails }) {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const location = useLocation();
    const navigate = useNavigate();
    const token = useMemo(() => localStorage.getItem('Token'), []);

    const [selectedEvent, setSelectedEvent] = useState(location.state?.eventId || "");
    const [selectedEventData, setSelectedEventData] = useState(null);
    const [assignedChallenges, setAssignedChallenges] = useState([]);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchKey, setSearchKey] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [sortBy, setSortBy] = useState(0);
    const [sortDirection, setSortDirection] = useState("ASC");
    const [loadingRemove, setLoadingRemove] = useState(false);

    const [showChallengeDeleteModal, setShowChallengeDeleteModal] = useState(false);
    const [selectedChallengeId, setSelectedChallengeId] = useState(null);
    const [selectedChallengeName, setSelectedChallengeName] = useState(null);

    const [isAssignNewChallengesModalOpen, setIsAssignNewChallengesModalOpen] = useState(false);
    const [isAssignFromEventModalOpen, setIsAssignFromEventModalOpen] = useState(false);

    const [tableLoading, setTableLoading] = useState(false)
    // Resize listener to auto-toggle sidebar
    useEffect(() => {
        const handleResize = () => setSidebarOpen(window.innerWidth >= 1280);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Validate token on load
    useEffect(() => {
        const token = AuthService.getToken();
        if (!AuthService.isTokenValid(token)) navigate('/');
    }, [navigate]);

    const axiosInstance = axios.create({
        baseURL: url,
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": 'application/json',
        },
        withCredentials: true,
    });


    const fetchEventDataById = async (eventId) => {
        try {
            const res = await axiosInstance.get(`admin/event/${eventId}`);
            
            setSelectedEventData(res.data);
        } catch (error) {
          
        }
    };

    useEffect(() => {
        if (selectedEvent) {
            fetchEventDataById(selectedEvent)
        }
    }, [selectedEvent]);

    const fetchAssignedChallenges = async (selectedEvent) => {
        try {
            setTableLoading(true)
            const res = await axiosInstance.get(`/admin/event/${selectedEvent}/challenge/assigned`, {
                params: {
                    page: currentPage - 1,
                    size: rowsPerPage,
                    sortBy,
                    direction: sortDirection,
                    searchTerm: searchKey,
                },
            });
            setAssignedChallenges(res.data);
        } catch (error) {
        
            toast.error("Failed to fetch assigned challenges.");
        } finally {
            setTableLoading(false)
        }
    };

    useEffect(() => {
        if (selectedEvent) {
            fetchAssignedChallenges(selectedEvent);
        }
    }, [selectedEvent, currentPage, rowsPerPage, sortBy, sortDirection, searchKey]);

    const handleSort = (columnIndex) => {
        setCurrentPage(1)
        setSortBy((prevSortBy) => {
            if (prevSortBy === columnIndex) {
                setSortDirection((prev) => (prev === "ASC" ? "DESC" : "ASC"));
                return prevSortBy;
            }
            setSortDirection("ASC");
            return columnIndex;
        });
    };

    const confirmDeleteChallenge = (challengeId, challengeName) => {
        setSelectedChallengeId(challengeId);
        setSelectedChallengeName(challengeName);
        setShowChallengeDeleteModal(true);
    };

    const handleDeleteChallenge = async () => {
        if (!selectedEventData || !selectedChallengeId) return;

        try {
            setLoadingRemove(true);
            const res = await axiosInstance.delete(
                `/admin/event/${selectedEventData.id}/challenge/${selectedChallengeId}`
            );
            toast.success(res.data || "Challenge deleted successfully.");
            fetchAssignedChallenges(selectedEvent);
        } catch (error) {
            toast.error(error.response?.data || "Error deleting challenge.");
        } finally {
            setLoadingRemove(false);
            setShowChallengeDeleteModal(false);
            setSelectedChallengeId(null);
        }
    };
    const [selectedEventForChallenges, setSelectedEventForChallenges] = useState()
    const handleAssignChallengeFromEvent = async (selectedEvent, selectedEventForChallenges) => {
        try {
            const res = await axiosInstance.post(`admin/event/${selectedEvent}/challenge/from/event/${selectedEventForChallenges}`)
           
            toast.success(res.data)
            fetchAssignedChallenges(selectedEvent)
        } catch (error) {
           
            toast.error(error.response?.data || "An error occurred while assigning from event!")
        } finally {
            setIsAssignFromEventModalOpen(false)
        }
    }
    return (
        <div className="overflow-hidden">
            <Sidebar open={sidebarOpen} name={userDetails.username} value={sidebarOpen} setValue={setSidebarOpen} />
            <div className="flex flex-col w-full overflow-hidden text-sm">
                <Navbar name={userDetails.name} value={sidebarOpen} setValue={setSidebarOpen} />
                <ToastContainer />
                <div className={`text-gray-900 min-h-[90vh] overflow-auto w-full ${sidebarOpen ? 'pl-0 lg:pl-72' : ''}`}>

                    <div className="flex items-center justify-center p-3 py-2 m-4 bg-gray-100 rounded">
                        <p className="px-8 py-1 text-2xl text-gray-800 rounded font-Lexend_Bold"> Assign Challenges </p>
                    </div>
                    <div className="p-3 mx-4 border rounded-lg">

                        <div className="flex flex-col items-center justify-between gap-4 mt-4 md:flex-row font-Lexend_Regular">

                            <div className="flex flex-col items-center gap-2 sm:flex-row">

                                <EventSelector
                                    selectedEvent={selectedEvent}
                                    setSelectedEvent={setSelectedEvent}
                                />
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                                <input
                                    type="text"
                                    value={searchKey}
                                    onChange={(e) => setSearchKey(e.target.value)}
                                    placeholder="Search..."
                                    className="p-2 border border-gray-300 rounded"
                                />
                                <select
                                    value={rowsPerPage}
                                    onChange={(e) => {
                                        setRowsPerPage(Number(e.target.value));
                                        setCurrentPage(1);
                                    }}
                                    className="p-2 border border-gray-300 rounded"
                                >
                                    {[10, 20, 50, 100].map(num => (
                                        <option key={num} value={num}>{num}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {selectedEvent && (
                            <div className="pt-4">
                                <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                                    <p className="text-base text-gray-700 sm:text-lg font-Lexend_SemiBold">
                                        Event Assigned Challenges
                                    </p>
                                    <div className="flex flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
                                        <button
                                            className="flex items-center justify-center px-3 py-1.5 text-sm text-white rounded font-Lexend_Medium bg-slate-800"
                                            onClick={() => setIsAssignFromEventModalOpen(true)}
                                        >
                                            <FaPlusCircle className="mr-1" size={16} /> Assign From Event
                                        </button>
                                        <button
                                            className="flex items-center justify-center px-3 py-1.5 text-sm text-white rounded font-Lexend_Medium bg-slate-800"
                                            onClick={() => setIsAssignNewChallengesModalOpen(true)}
                                        >
                                            <FaPlusCircle className="mr-1" size={16} /> Assign New Challenges
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex items-center justify-center w-full">

                            <div className="w-full pt-4 rounded ">


                                <AssignedChallengeTable
                                    assignedChallenges={assignedChallenges}
                                    sortBy={sortBy}
                                    sortDirection={sortDirection}
                                    setSortBy={setSortBy}
                                    setSortDirection={setSortDirection}
                                    onSort={handleSort}
                                    currentPage={currentPage}
                                    setCurrentPage={setCurrentPage}
                                    rowsPerPage={rowsPerPage}
                                    onRemove={confirmDeleteChallenge}
                                    selectedEventData={selectedEventData}
                                    selectedEvent={selectedEvent}
                                    isLoading={tableLoading}
                                />

                                {selectedEvent && assignedChallenges.totalPages > 0 && (
                                    <Pagination
                                        totalItems={assignedChallenges.totalElements}
                                        totalPages={assignedChallenges.totalPages}
                                        currentPage={currentPage}
                                        itemsPerPage={rowsPerPage}
                                        setCurrentPage={setCurrentPage}
                                    />
                                )}

                            </div>

                            {showChallengeDeleteModal && (
                                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                                    <div className="max-w-full p-6 bg-white rounded shadow-lg w-96 font-Lexend_Regular">
                                        <div className="flex justify-end">
                                            <IoCloseSharp
                                                size={20}
                                                className="cursor-pointer hover:text-gray-600"
                                                onClick={() => setShowChallengeDeleteModal(false)}
                                            />
                                        </div>
                                        <div className="text-center">
                                            <AiOutlineCloseCircle size={50} className="mx-auto text-red-600" />
                                            <h3 className="mt-2 mb-4 text-lg font-semibold">Are you sure?</h3>
                                            <p className="mb-4">Do you really want to remove the challenge:</p>
                                            <strong className="text-gray-800">{selectedChallengeName}</strong>
                                            <div className="flex justify-center mt-6 space-x-4">
                                                <button
                                                    className="px-4 py-2 text-white bg-red-600 rounded"
                                                    onClick={handleDeleteChallenge}
                                                    disabled={loadingRemove}
                                                >
                                                    {loadingRemove ? <BeatLoader size={10} color="#fff" /> : "Remove"}
                                                </button>
                                                <button
                                                    className="px-4 py-2 text-gray-700 bg-gray-300 rounded"
                                                    onClick={() => setShowChallengeDeleteModal(false)}
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    {isAssignFromEventModalOpen && (

                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 ">
                            <motion.div
                                key="add-event"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 20 }}
                                transition={{ duration: 0.3, ease: "easeInOut" }}

                            >
                                <div className="max-w-full bg-white rounded shadow-lg font-Lexend_Regular ">
                                    <div className="flex justify-end p-2">
                                        <IoCloseSharp
                                            size={20}
                                            className="cursor-pointer hover:text-gray-600"
                                            onClick={() => setIsAssignFromEventModalOpen(false)}
                                        />
                                    </div>
                                    <p className="px-6 text-lg font-Lexend_SemiBold">Assign From Event</p>
                                    <div className="px-6 py-2 pb-4 ">

                                        <EventSelectorForEvent
                                            selectedEventForChallenges={selectedEventForChallenges}
                                            setSelectedEventForChallenges={setSelectedEventForChallenges}
                                            selectedEvent={selectedEvent}
                                            setSelectedEvent={setSelectedEvent}
                                        />

                                        <div className="flex pt-3 space-x-4">
                                            <button className="px-2 py-1 text-white bg-gray-800 rounded font-Lexend_Medium" onClick={() => handleAssignChallengeFromEvent(selectedEvent, selectedEventForChallenges)}>
                                                Assign
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                    )}
                    {selectedEvent && isAssignNewChallengesModalOpen && (
                        <UnAssignedChallenges
                            selectedEvent={selectedEvent}
                            selectedEventData={selectedEventData}
                            onClose={() => setIsAssignNewChallengesModalOpen(false)}
                            fetchAssignedChallenges={fetchAssignedChallenges}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}


const EventSelectorForEvent = ({ selectedEventForChallenges, setSelectedEventForChallenges, selectedEvent }) => {

    const [isLoading, setIsLoading] = useState(false);
    const cachedOptions = useRef([]); // stores last MAX_OPTIONS only
    const lastSearchTerm = useRef("");
    const token = useMemo(() => localStorage.getItem('Token'), []);
    const axiosInstance = axios.create({
        baseURL: url,
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": 'application/json',
        },
        withCredentials: true,
    });

    const MAX_OPTIONS = 20
    // Fetch paginated & filtered event options
    const loadOptions = async (inputValue, _, { page }) => {
        try {
            setIsLoading(true);

            // Clear cache if search term changed
            if (inputValue !== lastSearchTerm.current) {
                cachedOptions.current = [];
                lastSearchTerm.current = inputValue;
                page = 1;
            }

            const response = await axiosInstance.get("/admin/event/list", {
                params: {
                    page: page - 1,
                    size: 20,
                    searchTerm: inputValue,
                },
            });
           
            let newOptions = response.data?.content?.map((event) => ({
                value: event.id,
                label: event.name,
                color: event.live
                    ? "#10B981"
                    : event.teamSubmissions || event.userSubmissions
                        ? "oklch(64.6% 0.222 41.116)"
                        : event.upcoming ?
                            "oklch(54.6% 0.245 262.881)"
                            : "oklch(27.8% 0.033 256.848)"
                ,
            })) || [];

            if (selectedEvent) {
                newOptions = newOptions.filter((opt) => opt.value !== selectedEvent);
            }
            // Merge and trim to keep only the latest MAX_OPTIONS
            cachedOptions.current = [...cachedOptions.current, ...newOptions].slice(-MAX_OPTIONS);

            return {
                options: cachedOptions.current,
                hasMore: !response.data.last,
                additional: { page: page + 1 },
            };
        } catch (error) {
            toast.error(`${error.response?.data || "Error fetching events"}`);
            return { options: [], hasMore: false };
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AsyncPaginate
            className="text-gray-600 sm:min-w-96 min-w-72"
            classNamePrefix="event-select"
            value={
                selectedEventForChallenges
                    ? cachedOptions.current.find((opt) => opt.value === selectedEventForChallenges) || {
                        value: selectedEventForChallenges,
                        label: "Selected Event",
                    }
                    : null
            }
            loadOptions={loadOptions}
            onChange={(selectedOption) => {
                setSelectedEventForChallenges(selectedOption?.value || null);
            }}
            placeholder="Select Event"
            isClearable
            isLoading={isLoading}
            additional={{ page: 1 }}
            styles={{
                control: (provided, state) => ({
                    ...provided,
                    borderColor: state.isFocused ? "#6b7280" : "#d1d5db",
                    boxShadow: state.isFocused ? "0 0 0 2px rgba(107, 114, 128, 0.3)" : "none",
                    "&:hover": {
                        borderColor: "#6b7280",
                    },
                }),
                singleValue: (provided, { data }) => ({
                    ...provided,
                    color: data.color,
                }),
                option: (provided, { data, isSelected }) => ({
                    ...provided,
                    color: data.color,
                    backgroundColor: isSelected ? "#e5e7eb" : "transparent",
                    "&:hover": {
                        backgroundColor: "#f3f4f6",
                    },
                }),
            }}
        />
    );
};

export default AssignChallenges;

