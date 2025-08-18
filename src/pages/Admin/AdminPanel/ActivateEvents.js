
import React from 'react'
import Sidebar from '../Sidebar';
import { useState, useEffect } from 'react';
import Navbar from '../Navbar';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import { url } from '../../Authentication/Utility';
import { useMemo } from 'react';
import { PulseLoader } from 'react-spinners';
import { FaUser } from "react-icons/fa";
import EventDetailsModal from './EventDetailsModal';
import { BsFillInfoCircleFill } from "react-icons/bs";
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/solid';
import AuthService from '../../Authentication/AuthService';
import { useNavigate } from 'react-router-dom';
import { use } from 'react';
function ActivateEvents({ userDetails }) {

    const [open, setOpen] = useState(true);
    const [liveEventsData, setLiveEventsData] = useState([])
    const [todaysEventsData, setTodaysEventsData] = useState([])
    const token = useMemo(() => localStorage.getItem('Token'), []);
    const navigate = useNavigate()
    const [liveLoadingIds, setLiveLoadingIds] = useState([]);
    const [stopLoadingIds, setStopLoadingIds] = useState([])
    const [eventType, setEventType] = useState("")
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1280) {
                setOpen(true);
            } else {
                setOpen(false);
            }
        };
        handleResize();
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);
    useEffect(() => {
        const token = AuthService.getToken();
        if (!AuthService.isTokenValid(token)) {
            navigate('/');
        }
    }, [navigate]);
    const axiosInstance = axios.create({
        baseURL: url,
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": 'application/json',
        },
        withCredentials: true,
    });

    const fetchLiveEvents = async () => {
        try {
            const response = await axiosInstance.get('/admin/events/today/live');
            setLiveEventsData(response.data);
        } catch (error) {
            toast.error(`${error.response?.data || "Failed to fetch live events"}`);
        }
    };
    const fetchTodaysEvents = async () => {
        try {
            const response = await axiosInstance.get('admin/events/today/non-live');
            setTodaysEventsData(response.data);
        } catch (error) {
            toast.error(`${error.response?.data || "Failed to fetch today's events"}`);
        }
    };

    useEffect(() => {
        fetchLiveEvents()
        fetchTodaysEvents()
    }, [])

    useEffect(() => {
        if (!liveEventsData || liveEventsData.length === 0) return;

        const timers = [];

        liveEventsData.forEach(event => {
            if (event.endDateTime) {
                
                const endTime = new Date(event.endDateTime).getTime();
                const now = Date.now();
                const timeLeft = endTime - now;
                if (timeLeft > 0) {
                    const timer = setTimeout(() => {
                        fetchLiveEvents();
                        fetchTodaysEvents();
                    }, timeLeft+3000);

                    timers.push(timer);
                }
            }
        });

        return () => timers.forEach(timer => clearTimeout(timer));
    }, [liveEventsData]);

    const formatTimeRange = (start, end) => {
        const options = { month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true };
        const startDate = new Date(start).toLocaleString('en-US', options);
        const endDate = new Date(end).toLocaleString('en-US', options);
        const startDay = startDate.split(',')[0];
        const endDay = endDate.split(',')[0];
        if (startDay === endDay) {
            return `${startDay}, ${startDate.split(',')[1]} to ${endDate.split(',')[1]}`;
        }
        return `${startDate} to ${endDate}`;
    };

    const handleGoLiveEvents = async (id) => {

        try {
            setLiveLoadingIds((prev) => [...prev, id])
            const response = await axiosInstance.post(`admin/event/${id}/live`);
            toast.success(response.data);
            fetchTodaysEvents()
            fetchLiveEvents()
        } catch (error) {
            toast.error(`${error.response?.data || "Failed to set event live."}`);
        } finally {
            setLiveLoadingIds((prev) => prev.filter((loadingId) => loadingId !== id))
        }
    }

    const handleCloseEvent = async (id) => {

        try {
            setStopLoadingIds((prev) => [...prev, id])
            const response = await axiosInstance.post(`admin/event/${id}/close`);
            toast.success(response.data);
            fetchTodaysEvents()
            fetchLiveEvents()
        } catch (error) {
            toast.error(`${error.response?.data || "Failed to close event ."}`);
        } finally {
            setStopLoadingIds((prev) => prev.filter((loadingId) => loadingId !== id))
        }
    }
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [selectedEventImage, setSelectedEventImage] = useState()
    const [isModalOpen, setModalOpen] = useState(false);

    const handleViewDetails = (event) => {
        setSelectedEvent(event);
        setSelectedEventImage(eventImages[event.id])
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setSelectedEvent(null);
    };


    {/*pagination for Live events*/ }
    const [rowsPerPageLiveEvents, setRowsPerPageLiveEvents] = useState(10);
    const [searchKeyLiveEvents, setSearchKeyLiveEvents] = useState("");
    const [currentPageLiveEvents, setCurrentPageLiveEvents] = useState(1);

    const filteredLiveEventsData = liveEventsData.filter((data) => {
        return (
            data?.name?.toLowerCase()?.includes(searchKeyLiveEvents.toLowerCase())

        );
    }
    );

    const totalItemsLiveEvents = filteredLiveEventsData.length;
    const totalPagesLiveEvents = Math.ceil(totalItemsLiveEvents / rowsPerPageLiveEvents);

    const paginatedLiveEventsData = filteredLiveEventsData.slice(
        (currentPageLiveEvents - 1) * rowsPerPageLiveEvents,
        currentPageLiveEvents * rowsPerPageLiveEvents
    );

    const handleLiveEventsPrevious = () => {
        if (currentPageLiveEvents > 1) setCurrentPageLiveEvents((prev) => prev - 1);
    };

    const handleLiveEventsNext = () => {
        if (currentPageLiveEvents < totalPagesLiveEvents) setCurrentPageLiveEvents((prev) => prev + 1);
    };

    {/*pagination for Today's events*/ }
    const [rowsPerPageTodayEvents, setRowsPerPageTodayEvents] = useState(10);
    const [searchKeyTodayEvents, setSearchKeyTodayEvents] = useState("");
    const [currentPageTodayEvents, setCurrentPageTodayEvents] = useState(1);

    const filteredTodayEventsData = todaysEventsData.filter((data) => {
        return (
            data?.name?.toLowerCase()?.includes(searchKeyTodayEvents.toLowerCase())
        );
    }
    );

    const totalItemsTodayEvents = filteredTodayEventsData.length;
    const totalPagesTodayEvents = Math.ceil(totalItemsTodayEvents / rowsPerPageTodayEvents);

    const paginatedTodayEventsData = filteredTodayEventsData.slice(
        (currentPageTodayEvents - 1) * rowsPerPageTodayEvents,
        currentPageTodayEvents * rowsPerPageTodayEvents
    );

    const handleTodayEventsPrevious = () => {
        if (currentPageTodayEvents > 1) setCurrentPageTodayEvents((prev) => prev - 1);
    };

    const handleTodayEventsNext = () => {
        if (currentPageTodayEvents < totalPagesTodayEvents) setCurrentPageTodayEvents((prev) => prev + 1);
    };

    const [countdowns, setCountdowns] = useState({});
    const handleStartNowEvent = async (eventId) => {
        try {
            const response = await axiosInstance.post(`admin/event/${eventId}/start/now`);
            toast.success(response.data);
            setCountdowns((prev) => ({
                ...prev,
                [eventId]: 10,
            }));
        } catch (error) {
            toast.error(`${error.response?.data || "Failed to start event."}`);
        }
    };

    useEffect(() => {
        const timers = [];

        Object.entries(countdowns).forEach(([eventId, timeLeft]) => {
            if (timeLeft > 0) {
                const timer = setTimeout(() => {
                    setCountdowns((prev) => ({
                        ...prev,
                        [eventId]: prev[eventId] - 1,
                    }));
                }, 1000);
                timers.push(timer);
            } else if (timeLeft === 0) {
                setCountdowns((prev) => {
                    const updated = { ...prev };
                    delete updated[eventId];
                    return updated;
                });
                fetchLiveEvents(); // refresh event list after countdown ends
            }
        });

        return () => {
            timers.forEach((timer) => clearTimeout(timer));
        };
    }, [countdowns]);

    const [eventImages, setEventImages] = useState({});

    const getEventImageById = async (eventId) => {
        if (eventImages[eventId]) return eventImages[eventId];
        try {
            const response = await axiosInstance.get(`admin/event/${eventId}/image`, {
                responseType: "blob",
            });
            const imageUrl = URL.createObjectURL(response.data);
            setEventImages((prev) => ({ ...prev, [eventId]: imageUrl }));
            return imageUrl;
        } catch (error) {
            return null;
        }
    };

    useEffect(() => {
        liveEventsData.forEach(event => {
            getEventImageById(event.id);
        });
        todaysEventsData.forEach(event => {
            getEventImageById(event.id);
        });
    }, [liveEventsData, todaysEventsData]);

    const [selectedEventIdToExtend, setSelectedEventIdToExtend] = useState(null);
    const [minutes, setMinutes] = useState("");
    const handleExtend = async (eventId) => {
        try {
            const response = await axiosInstance.post(`/admin/event/${eventId}/live/extend`, { minutes: minutes });

            fetchLiveEvents()
            setSelectedEventIdToExtend(null);
            setMinutes("");
            toast.success(response?.data)
        } catch (error) {
            toast.error(error?.response?.data)
        }
    };
    return (
        <div className="overflow-hidden scroll-pt-8">
            <Sidebar open={open} name={userDetails.username} value={open} setValue={setOpen} />

            <div className="flex flex-col w-full overflow-hidden text-sm">
                <Navbar name={userDetails.name} value={open} setValue={setOpen} />
                <ToastContainer />
                <div className={`text-gray-900 min-h-lvh  w-full space-y- ${open ? 'pl-0 lg:pl-72' : ''} `} >
                    <div className="p-4 live-events-container">
                        <div className="flex items-center pb-3">
                            <p className="font-Lexend_Bold w-36">Live Events</p>
                            <span className="w-full h-0 border-2 rounded-full "></span>
                        </div>

                        {liveEventsData.length > 0 ? (
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                                {liveEventsData.map((event, index) => (
                                    <div
                                        key={index}
                                        className="p-3 border rounded shadow bg-gray-20 font-Lexend_Regular border:animation-pulse h-fit"
                                    >
                                        <div className="space-y-2 bg-white " >
                                            <div className="flex justify-between h-32 p-1 bg-gray-100 font-Lexend_Regular"
                                                style={{
                                                    backgroundImage: `url(${eventImages[event.id]})`,
                                                    backgroundSize: "cover",
                                                    backgroundPosition: "center",
                                                    backgroundRepeat: "no-repeat",
                                                    alt: "Event image"
                                                }}
                                            >
                                                <div className='flex items-center px-2 py-1 space-x-1 h-fit'>
                                                    <p className="px-2 text-white -skew-x-12 border rounded shadow-md w-fit bg-lime-500 border-lime-400">
                                                        Live
                                                    </p>
                                                </div>
                                                {!eventImages[event.id] && <div className='flex items-center'>
                                                    <img
                                                        className="h-24 rounded"
                                                        src={"/ctf_logo.png"}
                                                        alt="CTF Logo"
                                                        loading="lazy"
                                                    />

                                                </div>

                                                }

                                                <div className="p-1 text-gray-400 bg-white rounded-full shadow-md cursor-pointer h-fit">
                                                    <i className="text-sm fas fa-info" title="Details">
                                                        <BsFillInfoCircleFill size={20}
                                                            onClick={() => {
                                                                setEventType("Live Event")
                                                                handleViewDetails(event)
                                                            }}
                                                        />
                                                    </i>
                                                </div>
                                            </div>

                                            {/* Event Details */}
                                            <div className="text-center bg-white ">
                                                <h3 className="font-Lexend_SemiBold">{event.name} </h3>
                                                <div className="flex items-center justify-center my-2 text-gray-400">
                                                    <div className="flex items-center justify-center px-2 space-x-1 border rounded-lg">
                                                        <FaUser size={12} />
                                                        <p>{event.users || 0}</p>
                                                    </div>
                                                </div>
                                                {event.teamCreationAllowed ? <span className="px-2 my-2 text-white bg-green-500 rounded">Team Event</span> : <span className="px-2 my-2 text-white bg-blue-500 rounded">Solo Event</span>}
                                                <p className="mt-2 text-xs">Registration Duration</p>
                                                <p className="text-sm">{formatTimeRange(event.registrationStartDateTime, event.registrationEndDateTime)}</p>
                                                <p className="mt-2 text-xs">Starts on</p>
                                                <p className="text-sm">{formatTimeRange(event.startDateTime, event.endDateTime)}</p>

                                            </div>
                                            {/* Action Buttons */}
                                            <div className="flex items-end justify-center">
                                                {event.live && (
                                                    <div className='space-y-1'>
                                                        <div className='flex space-x-2'>
                                                            <button
                                                                className="flex items-center px-5 py-1 space-x-1 text-white bg-red-600 border border-red-500 rounded hover:bg-red-500"
                                                                onClick={() => { handleCloseEvent(event.id) }}
                                                                disabled={stopLoadingIds.includes(event.id)}
                                                            >
                                                                {stopLoadingIds.includes(event.id) ? (
                                                                    <PulseLoader size={16} color={"#fff"} />
                                                                ) : (

                                                                    "Stop"
                                                                )}

                                                            </button>
                                                            <button
                                                                className={`border border-blue-500 px-5 rounded flex items-center py-1 w-fit
    ${event.participationAllowed
                                                                        ? "bg-gray-300 border-gray-300 text-gray-700 hover:bg-gray-400"
                                                                        : countdowns[event.id] !== undefined
                                                                            ? "bg-blue-400 text-white cursor-not-allowed"
                                                                            : "bg-blue-600 hover:bg-blue-500 text-white"
                                                                    }
`}
                                                                onClick={() => {
                                                                    if (countdowns[event.id] === undefined && !event.participationAllowed) {
                                                                        handleStartNowEvent(event.id);
                                                                    }
                                                                }}
                                                                disabled={event.participationAllowed || countdowns[event.id] !== undefined}
                                                            >
                                                                {event.participationAllowed ? (
                                                                    "Started"
                                                                ) : countdowns[event.id] !== undefined ? (
                                                                    `Starting in ${countdowns[event.id]}s`
                                                                ) : (
                                                                    "Start Now"
                                                                )}

                                                            </button>

                                                        </div>
                                                        <div>
                                                            <button
                                                                className="w-full py-1 text-white rounded bg-slate-800 font-Lexend_Regular"
                                                                onClick={() => setSelectedEventIdToExtend(event.id)}
                                                            >
                                                                Extend
                                                            </button>

                                                            {/* Modal - Shown only for selected event */}
                                                            {selectedEventIdToExtend === event.id && (
                                                                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                                                                    <div className="p-4 bg-white rounded shadow-lg w-80">
                                                                        <h2 className="mb-2 text-lg font-semibold">Extend Time</h2>
                                                                        <input
                                                                            type="number"
                                                                            value={minutes}
                                                                            onChange={(e) => setMinutes(e.target.value)}
                                                                            placeholder="Enter minutes"
                                                                            className="w-full px-3 py-2 mb-3 border rounded focus:outline-none focus:ring-2 focus:ring-slate-500"
                                                                        />
                                                                        <div className="flex justify-end space-x-2">
                                                                            <button
                                                                                className="px-3 py-1 rounded bg-slate-200 hover:bg-slate-300"
                                                                                onClick={() => {
                                                                                    setSelectedEventIdToExtend(null);
                                                                                    setMinutes("");
                                                                                }}
                                                                            >
                                                                                Cancel
                                                                            </button>
                                                                            <button
                                                                                className="px-3 py-1 text-white rounded bg-slate-800 hover:bg-slate-700"
                                                                                onClick={() => {
                                                                                    handleExtend(event.id);
                                                                                    // const mins = parseInt(minutes, 10);
                                                                                    // if (!isNaN(mins) && mins > 0) {

                                                                                    //     setSelectedEventId(null);
                                                                                    //     setMinutes("");
                                                                                    // } else {
                                                                                    //     alert("Enter a valid number of minutes.");
                                                                                    // }
                                                                                }}
                                                                            >
                                                                                Submit
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center font-Lexend_Regular">
                                <p>No events are available</p>
                            </div>
                        )}
                        {liveEventsData.length > 0 &&
                            <Pagination
                                totalItems={totalItemsLiveEvents}
                                totalPages={totalPagesLiveEvents}
                                currentPage={currentPageLiveEvents}
                                handlePrevious={handleLiveEventsPrevious}
                                handleNext={handleLiveEventsNext}
                                itemsPerPage={rowsPerPageLiveEvents}
                                setCurrentPage={setCurrentPageLiveEvents}
                                rowsPerPage={rowsPerPageLiveEvents}
                                setRowsPerPage={setRowsPerPageLiveEvents}
                            />
                        }
                    </div>

                    <div className="p-4 live-events-container">
                        <div className="flex items-center pb-3">
                            <p className="font-Lexend_Bold w-36">Today's Events</p>
                            <span className="w-full h-0 border-2 rounded-full "></span>
                        </div>

                        {todaysEventsData.length > 0 ? (
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                                {todaysEventsData.map((event, index) => (
                                    <div
                                        key={index}
                                        className="p-3 border rounded shadow bg-gray-20 h-fit font-Lexend_Regular "
                                    >
                                        <div className="space-y-2 bg-white "

                                        >
                                            <div className="flex justify-between h-32 p-1 bg-gray-100 font-Lexend_Regular"
                                                style={{
                                                    backgroundImage: `url(${eventImages[event.id]})`,
                                                    backgroundSize: "cover",
                                                    backgroundPosition: "center",
                                                    backgroundRepeat: "no-repeat",
                                                    alt: "Event image"
                                                }}
                                            >
                                                <div className='flex items-center space-x-1 text-gray-100 h-fit'>
                                                    {!eventImages[event.id] && "...."}
                                                </div>

                                                {!eventImages[event.id] && <div className='flex items-center'>
                                                    <img
                                                        className="h-24 rounded"
                                                        src={"/ctf_logo.png"}
                                                        alt="CTF Logo"
                                                        loading="lazy"
                                                    />

                                                </div>
                                                }
                                                <div className="p-1 text-gray-400 bg-white rounded-full shadow-md cursor-pointer h-fit">
                                                    <i className="text-sm fas fa-info" title="Details">
                                                        <BsFillInfoCircleFill size={20}
                                                            onClick={() => {
                                                                setEventType("Today's Event")
                                                                handleViewDetails(event)
                                                            }}
                                                        />
                                                    </i>
                                                </div>
                                            </div>

                                            {/* Event Details */}
                                            <div className="text-center bg-white ">
                                                <h3 className="font-Lexend_SemiBold">{event.name} </h3>
                                                <div className="flex items-center justify-center my-2 text-gray-400">
                                                    <div className="flex items-center justify-center px-2 space-x-1 border rounded-lg">
                                                        <FaUser size={12} />
                                                        <p>{event.users || 0}</p>
                                                    </div>
                                                </div>
                                                {event.teamCreationAllowed ? <span className="px-2 my-2 text-white bg-green-500 rounded">Team Event</span> : <span className="px-2 my-2 text-white bg-blue-500 rounded">Solo Event</span>}
                                                <p className="mt-2 text-xs">Registration Duration</p>
                                                <p className="text-sm">{formatTimeRange(event.registrationStartDateTime, event.registrationEndDateTime)}</p>
                                                <p className="mt-2 text-xs">Starts on</p>
                                                <p className="text-sm">{formatTimeRange(event.startDateTime, event.endDateTime)}</p>

                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex items-end justify-center">
                                                {!event.live &&
                                                    <button
                                                        className="flex items-center px-5 py-1 text-white bg-blue-600 border border-blue-500 rounded hover:bg-blue-400"
                                                        onClick={() => handleGoLiveEvents(event.id)}
                                                        disabled={liveLoadingIds.includes(event.id)} // Correct condition
                                                    >
                                                        {liveLoadingIds.includes(event.id) ? (
                                                            <PulseLoader size={16} color={"#fff"} />
                                                        ) : (

                                                            "Go Live"
                                                        )}
                                                    </button>
                                                }
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center font-Lexend_Regular">
                                <p>No events are available</p>
                            </div>
                        )}
                        {todaysEventsData.length > 0 &&
                            <Pagination
                                totalItems={totalItemsTodayEvents}
                                totalPages={totalPagesTodayEvents}
                                currentPage={currentPageTodayEvents}
                                handlePrevious={handleTodayEventsPrevious}
                                handleNext={handleTodayEventsNext}
                                itemsPerPage={rowsPerPageTodayEvents}
                                setCurrentPage={setCurrentPageTodayEvents}
                                rowsPerPage={rowsPerPageTodayEvents}
                                setRowsPerPage={setRowsPerPageTodayEvents}
                            />
                        }
                    </div>
                    <EventDetailsModal
                        event={selectedEvent}
                        eventImages={selectedEventImage}
                        isOpen={isModalOpen}
                        onClose={handleCloseModal}
                        handleGoLiveEvents={handleGoLiveEvents}
                        eventType={eventType}
                    />
                </div>
            </div>

        </div>

    )
}


function Pagination({
    totalItems,
    totalPages,
    currentPage,
    itemsPerPage,
    handlePrevious,
    handleNext,
    setCurrentPage,
    rowsPerPage,
    setRowsPerPage
}) {
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
                    className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${currentPage === i
                        ? "z-10 bg-gray-800 text-white"
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
                        className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-400 border border-gray-200 "
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
        <div className="flex items-center justify-between p-1 mt-4 bg-white border border-gray-200 rounded ">
            <div>


                <select
                    value={rowsPerPage}
                    onChange={(e) => {
                        setRowsPerPage(Number(e.target.value))
                        setCurrentPage(1)
                    }}
                    className="w-20 px-2 py-1 border rounded"
                >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                </select>
                <label className="mr-2 font-semibold"> per page</label>

            </div>
            <div className="hidden space-x-2 sm:flex sm:flex-1 sm:items-center sm:justify-end">
                <div>
                    <p className="text-sm text-gray-700">

                        <span className="font-medium">
                            {(currentPage - 1) * itemsPerPage + 1}
                        </span>{" "}
                        -{" "}
                        <span className="font-medium">
                            {Math.min(currentPage * itemsPerPage, totalItems)}
                        </span>{" "}
                        of <span className="font-medium">{totalItems}</span>
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
                            <span className="sr-only">Next</span>
                            <ChevronRightIcon aria-hidden="true" className="w-5 h-5" />
                        </button>
                    </nav>
                </div>
            </div>
        </div>
    );
}


export default ActivateEvents
