import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Select from "react-select";
import { toast, ToastContainer } from "react-toastify";
import { FaLongArrowAltLeft } from "react-icons/fa";
import { PiFunnelX } from "react-icons/pi";

import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import Pagination from "./Tables/Pagination";
import SubmissionTable from "./Tables/SubmissionTable";

import AuthService from "../Authentication/AuthService";
import { url } from "../Authentication/Utility";

import "react-toastify/dist/ReactToastify.css";
import "react-tooltip/dist/react-tooltip.css";

function Submissions() {
    const [openSidebar, setOpenSidebar] = useState(true);
    const navigate = useNavigate()

    const [currentEventData, setCurrentEventData] = useState({})
    const [currentEventLoaded, setCurrentEventLoaded] = useState(false);
    const [events, setEvents] = useState([])
    const [selectedEvent, setSelectedEvent] = useState("")
    const [selectedEventData, setSelectedEventData] = useState([])
    const [submissionData, setSubmissionData] = useState([])
    const [serverTime, setServerTime] = useState()
    const [startTimeLeft, setStartTimeLeft] = useState(0)
    const [endTimeLeft, setEndTimeLeft] = useState(0)

    {/*pagination sorting,searching*/ }
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchKey, setSearchKey] = useState("");
    const [sortBy, setSortBy] = useState(0);
    const [sortDirection, setSortDirection] = useState('ASC');

    const [loadingReview, setLoadingReview] = useState(false)
    const [tableLoading, setTableLoading] = useState(false)

    const [fileterEventStartDate, setFileterEventStartDate] = useState('');
    const [fileterEventEndDate, setFileterEventEndDate] = useState('');
    useEffect(() => {
        const handleResize = () => {
            setOpenSidebar(window.innerWidth >= 1280);
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);
    useEffect(() => {
        const token = AuthService.getToken();
        if (!AuthService.isTokenValid(token)) {
            navigate('/');
        }
    }, [navigate]);

    const token = useMemo(() => localStorage.getItem("Token"), []);
    const axiosInstance = axios.create({
        baseURL: url,
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        withCredentials: true,
    });
    const fetchCurrentEventDetails = async () => {
        try {
            const res = await axiosInstance.get(`/user/event/current`);
            setCurrentEventData(res.data);
        } catch (error) {
            //toast.error("Failed to fetch event details");
        } finally {
            setCurrentEventLoaded(true)
        }
    };

    const fetchUserRegisteredEvents = async () => {
        try {

            const response = await axiosInstance.get('/user/event/registered');
            setEvents(response.data);
        } catch (error) {
            toast.error(`${error.response?.data || "An error occurred while fetching events"}`)
        }
    };
    useEffect(() => {
        fetchCurrentEventDetails()
    }, [])
    useEffect(() => {
        if (currentEventLoaded && Object.keys(currentEventData).length === 0) {
            fetchUserRegisteredEvents()
        }
    }, [currentEventLoaded, currentEventData]);

    const fetchSubmissionData = async (eventId, startDateTime = '', endDateTime = '') => {
        try {
            setTableLoading(true)
            const params = {
                page: currentPage - 1 === -1 ? 0 : currentPage - 1,
                size: rowsPerPage,
                sortBy,
                direction: sortDirection,
                searchTerm: searchKey,
            };
            if (startDateTime && !isNaN(new Date(startDateTime))) {
                params.startDateTime = new Date(startDateTime).toISOString();
            }

            if (endDateTime && !isNaN(new Date(endDateTime))) {
                params.endDateTime = new Date(endDateTime).toISOString();
            }
            const res = await axiosInstance.get(`/user/event/${eventId}/submissions`, {
                params
            });
            setSubmissionData(res.data);
        } catch (error) {
        } finally {
            setTableLoading(false)
        }
    };

    useEffect(() => {
        if (currentEventData?.id || selectedEvent) {
            if (currentEventData?.id) {
                fetchSubmissionData(currentEventData.id);
            } else {
                fetchSubmissionData(selectedEvent)
            }
        }
    }, [currentEventData, selectedEvent, currentPage, rowsPerPage, sortBy, sortDirection, searchKey]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchKey]);
    //count down
    useEffect(() => {
        if (currentEventData?.startDateTime) {
            const serverTimestamp = new Date(serverTime).getTime();
            const eventStartTime = new Date(currentEventData.startDateTime).getTime();
            const timeRemaining = Math.max(0, Math.floor((eventStartTime - serverTimestamp) / 1000));
            setStartTimeLeft(timeRemaining);
        }
        if (currentEventData?.endDateTime) {
            const serverTimestamp = new Date(serverTime).getTime();
            const eventEndTime = new Date(currentEventData.endDateTime).getTime();
            const timeRemaining = Math.max(0, Math.floor((eventEndTime - serverTimestamp) / 1000));
            setEndTimeLeft(timeRemaining);
        }
    }, [currentEventData, serverTime]);

    const fetchServerTime = async () => {
        try {
            const res = await axiosInstance.get(`user/server/time`)
            setServerTime(res.data)
        } catch (error) {

        }
    }
    useEffect(() => {
        fetchServerTime();
    }, []);

    // Timer Countdown
    useEffect(() => {
        if (startTimeLeft > 0) {
            const timer = setInterval(() => {
                setStartTimeLeft((prev) => prev - 1);
            }, 1000);

            return () => clearInterval(timer);
        }
        if (endTimeLeft > 0) {
            const timer = setInterval(() => {
                setEndTimeLeft((prev) => prev - 1);
            }, 1000);

            return () => clearInterval(timer);
        }
    }, [startTimeLeft, endTimeLeft]);

    const formatTime = (seconds) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hrs.toString().padStart(2, "0")}:${mins
            .toString()
            .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };
    const formatSubmissionDate = (dateTimeString) => {
        const options = { dateStyle: "medium", timeStyle: "short" };
        return new Intl.DateTimeFormat("en-US", options).format(new Date(dateTimeString));
    };

    const getEventById = (id) => {
        const data = events.find((event) => String(event.id) === String(id)) || null;
        setSelectedEventData(data);
    };

    useEffect(() => {
        if (selectedEvent && events.length > 0) {
            setSelectedEventData([])
            getEventById(selectedEvent)
        }
    }, [selectedEvent, events]);

    const handleMarkForReview = async (submissionId) => {
        setLoadingReview(true)
        const eventId = currentEventData?.id || selectedEvent
        try {
            const res = await axiosInstance.post(`/user/event/${eventId}/submission/${submissionId}/mark`);
            toast.success(res.data)
            fetchSubmissionData(eventId)
        } catch (error) {
            toast.error(error.response?.data || "Failed to fetch user details");
        } finally {
            setLoadingReview(false)
        }
    }

    const handleSort = (columnIndex) => {
        setCurrentPage(1)
        if (sortBy === columnIndex) {
            setSortDirection(prev => (prev === 'ASC' ? 'DESC' : 'ASC'));
        } else {
            setSortBy(columnIndex);
            setSortDirection('ASC');
        }
    };

    const eventSelectOptions = events.map(event => ({
        value: event.id,
        label: event.name,
        color: event.live ? "#10B981" : event.teamSubmissions || event.userSubmissions ? "#374151" : "#9CA3AF",
    }));

    const handleEventFilter = () => {
        if (currentEventData?.id || selectedEvent) {
            if (currentEventData?.id) {
                fetchSubmissionData(currentEventData.id, fileterEventStartDate, fileterEventEndDate);
            } else {
                fetchSubmissionData(selectedEvent, fileterEventStartDate, fileterEventEndDate);
            }
        }
    };

    const handleEventClear = () => {
        setFileterEventStartDate('');
        setFileterEventEndDate('');
        setCurrentPage(1);
        if (currentEventData?.id || selectedEvent) {
            if (currentEventData?.id) {
                fetchSubmissionData(currentEventData.id, '', '');
            } else {
                fetchSubmissionData(selectedEvent, '', '');
            }
        }
        fetchSubmissionData(currentEventData.id, '', '');
    };

    return (
        <div className="overflow-hidden">
            <Sidebar value={openSidebar} setValue={setOpenSidebar} />

            <div className="flex flex-col w-full overflow-hidden text-sm ">
                <Navbar value={openSidebar} setValue={setOpenSidebar} />
                <ToastContainer />
                <div className={`text-gray-900 overflow-auto min-h-[600px] space-y-8   w-full ${openSidebar ? 'pl-0 lg:pl-72' : ''} `} >

                    <div className="p-4 space-y-4">
                        {currentEventData?.name && (
                            <div className="px-4 bg-white rounded-md font-Lexend_Regular">
                                {/* Top Row: Back Button + Timer */}
                                <div className="flex flex-col items-center justify-between sm:flex-row ">
                                    <div>
                                        {currentEventData.participationAllowed ? (
                                            <button
                                                className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                                                onClick={() => navigate("/EventChallenges")}
                                            >
                                                <FaLongArrowAltLeft /> Back to Challenges
                                            </button>
                                        ) : (
                                            <button
                                                className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                                                onClick={() => navigate("/Instruction")}
                                            >
                                                <FaLongArrowAltLeft /> Back to Event
                                            </button>
                                        )}
                                    </div>

                                    <div className="mt-2 text-sm text-red-500 sm:mt-0">
                                        {startTimeLeft > 0 ? null : formatTime(endTimeLeft)}
                                    </div>
                                </div>

                                {/* Title with lines */}
                                <div className="flex items-center justify-center space-x-4 text-center">
                                    <span className="hidden w-20 border-t-2 border-gray-300 sm:block"></span>
                                    <h1 className="text-2xl text-gray-800 sm:text-3xl md:text-4xl font-Lexend_Bold">
                                        {currentEventData?.name || "Event Score"}
                                    </h1>
                                    <span className="hidden w-20 border-t-2 border-gray-300 sm:block"></span>
                                </div>
                            </div>
                        )}
                        <div className="flex items-center justify-center p-3 py-2 bg-gray-100 rounded ">
                            <p className="px-8 py-1 text-2xl text-gray-800 rounded font-Lexend_Bold"> Submissions </p>
                        </div>
                        <div className="p-3 border rounded-lg font-Lexend_Regular">

                            <div className={`flex flex-col md:flex-row ${Object.keys(currentEventData).length > 0 ? 'justify-end' : 'justify-between'} items-center gap-4 mt-4 font-Lexend_Regular`}>
                                {/* Event Selection */}
                                {!Object.keys(currentEventData).length > 0 && <div className="flex flex-col items-center gap-2 sm:flex-row">
                                   
                                    <Select
                                        className="text-gray-600 sm:min-w-96 min-w-72"
                                        classNamePrefix="event-select"
                                        value={eventSelectOptions.find(option => option.value === selectedEvent) || null}
                                        onChange={(selectedOption) => {
                                            setSelectedEvent(selectedOption?.value || "");
                                            setCurrentPage(1);
                                            setSearchKey("");
                                            setRowsPerPage(10);
                                        }}
                                        options={eventSelectOptions}
                                        placeholder="Select Event"
                                        isClearable
                                        styles={{
                                            control: (provided, state) => ({
                                                ...provided,
                                                borderColor: state.isFocused ? "#6b7280" : "#d1d5db", // Focus: Gray-500, Default: Gray-300
                                                boxShadow: state.isFocused ? "0 0 0 2px rgba(107, 114, 128, 0.3)" : "none", // Focus ring effect
                                                "&:hover": {
                                                    borderColor: "#6b7280",
                                                },
                                            }),
                                            singleValue: (provided, { data }) => ({
                                                ...provided,
                                                color: data.color, // Apply color styling based on event status
                                            }),
                                            option: (provided, { data, isSelected }) => ({
                                                ...provided,
                                                color: data.color, // Style options dynamically
                                                backgroundColor: isSelected ? "#e5e7eb" : "transparent", // Set selected option background color
                                                "&:hover": {
                                                    backgroundColor: "#f3f4f6", // Hover effect for options
                                                },
                                            }),
                                        }}
                                    />
                                </div>}

                                {/* Search and Rows Per Page */}
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
                                        onChange={(e) => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                                        className="p-2 border border-gray-300 rounded"
                                    >
                                        {[10, 20, 50, 100].map((num, index) => (
                                            <option key={index} value={num}>{num}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {(selectedEvent || Object.keys(currentEventData).length > 0) &&
                                <div className="pt-2 font-Lexend_Regular">
                                    <div className="flex flex-col items-center gap-3 py-1 rounded md:flex-row md:justify-center bg-whit">
                                        {/* Date Inputs */}
                                        <div className="flex flex-col items-center gap-2 sm:flex-row">
                                            <input
                                                type="datetime-local"
                                                value={fileterEventStartDate}
                                                onChange={(e) => setFileterEventStartDate(e.target.value)}
                                                className="p-2 border rounded"
                                            />
                                            to
                                            <input
                                                type="datetime-local"
                                                value={fileterEventEndDate}
                                                onChange={(e) => setFileterEventEndDate(e.target.value)}
                                                className="p-2 border rounded"
                                            />
                                        </div>

                                        {/* Buttons */}
                                        <div className="flex justify-center gap-2 md:justify-start">
                                            <button
                                                onClick={handleEventFilter}
                                                className="h-10 px-4 text-white bg-blue-600 rounded hover:bg-blue-700"
                                            >
                                                Apply Filter
                                            </button>
                                            <button
                                                onClick={handleEventClear}
                                                className="h-10 px-4 text-white rounded bg-slate-800 hover:bg-slate-700"
                                            >
                                                <PiFunnelX size={24} title="Clear Filter" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            }
                           <SubmissionTable
                                eventData={currentEventData.id ? currentEventData : selectedEventData}
                                selectedEvent={selectedEvent}
                                submissionData={submissionData}
                                sortBy={sortBy}
                                setSortBy={setSortBy}
                                sortDirection={sortDirection}
                                setSortDirection={setSortDirection}
                                handleSort={handleSort}
                                handleMarkForReview={handleMarkForReview}
                                currentPage={currentPage}
                                setCurrentPage={setCurrentPage}
                                rowsPerPage={rowsPerPage}
                                formatSubmissionDate={formatSubmissionDate}
                                loadingReview={loadingReview}
                                isLoading={tableLoading}
                            />
                            {(selectedEvent || currentEventData?.id)&& submissionData.totalPages > 0 && (
                                <Pagination
                                    totalItems={submissionData.totalElements}
                                    totalPages={submissionData.totalPages}
                                    currentPage={currentPage}
                                    itemsPerPage={rowsPerPage}
                                    setCurrentPage={setCurrentPage}
                                />
                            )}

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Submissions;