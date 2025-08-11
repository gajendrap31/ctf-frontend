import Sidebar from "./Sidebar"
import Navbar from "./Navbar"
import { useState, useEffect, useMemo, useContext } from "react";
import axios from "axios";
import { url } from "../Authentication/Utility";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaUser } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import EventDetailsModal from "./EventDetailsModal";
import { BsFillInfoCircleFill } from "react-icons/bs";
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/solid';
import AuthService from "../Authentication/AuthService";
import { ProfileContext } from "../Context API/ProfileContext";
function UserDashboard() {

    const [openSidebar, setOpenSidebar] = useState(true);
    const [userActivity, setUserActivity] = useState(null)
    const navigate = useNavigate()
    const token = useMemo(() => localStorage.getItem('Token'), []);

    const [liveEvents, setLiveEvents] = useState([])
    const [rowsPerPageLiveEvents, setRowsPerPageLiveEvents] = useState(10);
    const [currentPageLiveEvents, setCurrentPageLiveEvents] = useState(1);

    const [upComingEvents, setUpComingEvents] = useState([])
    const [rowsPerPageUpComingEvents, setRowsPerPageUpComingEvents] = useState(10);
    const [currentPageUpComingEvents, setCurrentPageUpComingEvents] = useState(1);

    const [pastEvents, setPastEvents] = useState([])
    const [rowsPerPagePastEvents, setRowsPerPagePastEvents] = useState(5);
    const [currentPagePastEvents, setCurrentPagePastEvents] = useState(1);

    const [eventType, setEventType] = useState("")
    const { userDetails } = useContext(ProfileContext);
    useEffect(() => {
        const token = AuthService.getToken();
        if (!AuthService.isTokenValid(token)) {
            navigate('/');
        }
    }, [navigate]);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1280) {
                setOpenSidebar(true);
            } else {
                setOpenSidebar(false);
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);


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
            const response = await axiosInstance.get('/user/events/live', {
                params: {
                    page: currentPageLiveEvents - 1 === -1 ? 0 : currentPageLiveEvents - 1,
                    size: rowsPerPageLiveEvents,
                },
            });
            setLiveEvents(response.data);

        } catch (error) {

        }
    };
    useEffect(() => {
        fetchLiveEvents()
    }, [currentPageLiveEvents, rowsPerPageLiveEvents])

    const handleLiveEventsPrevious = () => {
        if (currentPageLiveEvents > 1) setCurrentPageLiveEvents((prev) => prev - 1);
    };

    const handleLiveEventsNext = () => {
        if (currentPageLiveEvents < liveEvents.totalPages) setCurrentPageLiveEvents((prev) => prev + 1);
    };

    const fetchUpComingEvents = async () => {
        try {
            const response = await axiosInstance.get('/user/events/upcoming', {
                params: {
                    page: currentPageUpComingEvents - 1 === -1 ? 0 : currentPageUpComingEvents - 1,
                    size: rowsPerPageUpComingEvents,
                },
            });
            setUpComingEvents(response.data);

        } catch (error) {

        }
    };
    useEffect(() => {
        fetchUpComingEvents()
    }, [currentPageUpComingEvents, rowsPerPageUpComingEvents]);

    const handleUpComingEventsPrevious = () => {
        if (currentPageUpComingEvents > 1) setCurrentPageUpComingEvents((prev) => prev - 1);
    };

    const handleUpComingEventsNext = () => {
        if (currentPageUpComingEvents < upComingEvents.totalPages) setCurrentPageUpComingEvents((prev) => prev + 1);
    };

    const fetchPastEvents = async () => {
        try {
            const response = await axiosInstance.get('/user/events/past', {
                params: {
                    page: currentPagePastEvents - 1 === -1 ? 0 : currentPagePastEvents - 1,
                    size: rowsPerPagePastEvents,
                },
            });
            setPastEvents(response.data);

        } catch (error) {

        }
    };
    useEffect(() => {
        fetchPastEvents();
    }, [currentPagePastEvents, rowsPerPagePastEvents]);

    const handlePastEventsPrevious = () => {
        if (currentPagePastEvents > 1) setCurrentPagePastEvents((prev) => prev - 1);
    };

    const handlePastEventsNext = () => {
        if (currentPagePastEvents < pastEvents.totalPages) setCurrentPagePastEvents((prev) => prev + 1);
    };

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

    const handleRegisterEvents = async (id) => {
        try {
            const res = await axiosInstance.post(`/user/event/${id}/user/register`);
            toast.success(res.data || "");
            fetchUpComingEvents()
        } catch (error) {
            toast.error(error.response?.data || "");
        }
    }

    const handleRegisterEventsAfterLive = async (id) => {
        try {
            const res = await axiosInstance.post(`/user/event/${id}/user/register`);
            toast.success(res.data || "");
            fetchLiveEvents()
        } catch (error) {
            toast.error(error.response?.data || "");
        }
    }

    const handleJoin = async (event) => {
        try {
            const res = await axiosInstance.post(`/user/event/${event.id}/join`);
            navigate("/Instruction", { state: { event, userData: { userDetails } } });
        } catch (error) {
            toast.error(error.response?.data || "");
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


    const [eventImages, setEventImages] = useState({});

    const getEventImageById = async (eventId) => {
        if (eventImages[eventId]) return eventImages[eventId];
        try {
            const response = await axiosInstance.get(`user/event/${eventId}/image`, {
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
        liveEvents.content?.forEach(event => {
            getEventImageById(event.id);
        });
        upComingEvents.content?.forEach(event => {
            getEventImageById(event.id);
        });
        pastEvents.content?.forEach(event => {
            getEventImageById(event.id);
        });
    }, [liveEvents, upComingEvents, pastEvents]);

    useEffect(() => {
        if (!userActivity) return;

        const msg = userActivity.message?.toLowerCase();

        if (msg?.includes("is now live!")) {
            fetchLiveEvents();
            fetchUpComingEvents();
        } else if (msg?.includes("now over!")) {
            fetchLiveEvents();
            fetchUpComingEvents();
            fetchPastEvents();
        } else if (msg?.includes("has now started!")) {
            fetchLiveEvents();
        }

    }, [userActivity?.notificationTime]); // ✅ or userActivity?.eventId if it’s always unique


    const joinedEventId = liveEvents.content?.find(event =>
        event.currentUsers?.includes(userDetails?.id)
    )?.id;

    return (
        <div className="overflow-hidden ">
            <Sidebar value={openSidebar} setValue={setOpenSidebar} />

            <div className="flex flex-col w-full overflow-hidden ">
                <Navbar value={openSidebar} setValue={setOpenSidebar} setUserActivity={setUserActivity} />
                <ToastContainer />
                <div className={`text-gray-900 overflow-auto w-full text-sm ${openSidebar ? 'pl-0 lg:pl-72' : ''} `} >
                    <div className="p-4 live-events-container">
                        <div className="flex items-center pb-3">
                            <p className="font-Lexend_Bold w-36">LIVE EVENTS</p>
                            <span className="w-full h-0 border-2 rounded-full "></span>
                        </div>
                        {liveEvents.content?.length > 0 ? (
                            <div className="grid grid-cols-1 gap-4 events-grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
                                {liveEvents.content?.map((event, index) => (
                                    <div key={index} className="w-full p-3 border rounded shadow event-card bg-gray-20 h-fit font-Lexend_Regular">
                                        <div className="space-y-2 bg-white ">
                                            <div className="flex justify-between h-32 p-1 bg-gray-100 rounded font-Lexend_Regular"
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
                                            <div className="text-center bg-white ">
                                                <h3 className="font-Lexend_SemiBold">{event.name} </h3>
                                                <div className="flex items-center justify-center my-2 text-gray-400">
                                                    <div className="flex items-center justify-center px-2 space-x-1 border rounded-lg">
                                                        <FaUser size={12} />
                                                        <p>{event.users.length || 0}</p>
                                                    </div>
                                                </div>
                                                {event.teamCreationAllowed ? <span className="px-2 my-2 text-white bg-green-500 rounded">Team Event</span> : <span className="px-2 my-2 text-white bg-blue-500 rounded">Solo Event</span>}
                                                <p className="mt-2 text-xs">Registration Duration</p>
                                                <p className="text-sm">{formatTimeRange(event.registrationStartDateTime, event.registrationEndDateTime)}</p>
                                                <p className="mt-2 text-xs">Starts on</p>
                                                <p className="text-sm">{formatTimeRange(event.startDateTime, event.endDateTime)}</p>
                                            </div>
                                            <div className="flex items-end justify-center">
                                                {event.currentUsers?.includes(userDetails?.id) ? (
                                                    event.participationAllowed ?
                                                        <button
                                                            className="px-5 text-white bg-blue-500 border border-blue-500 rounded hover:bg-blue-400 hover:border-blue-400"
                                                            onClick={() => navigate("/EventChallenges")}
                                                        >
                                                            Go to Event
                                                        </button> : <button
                                                            className="px-5 text-white bg-blue-500 border border-blue-500 rounded hover:bg-blue-400 hover:border-blue-400"
                                                            onClick={() => navigate("/Instruction")}
                                                        >
                                                            Go to Instruction
                                                        </button>
                                                ) : event.users?.includes(userDetails?.id) ? (joinedEventId ?
                                                    <button
                                                        disabled
                                                        title="You’ve already joined another event. Please leave it before joining a new one."
                                                        className="px-5 text-white bg-gray-400 border border-gray-400 rounded cursor-not-allowed"
                                                    >
                                                        Join Now
                                                    </button> :
                                                    <button
                                                        className="px-5 text-white border rounded border-lime-500 bg-lime-500 hover:bg-lime-400 hover:border-lime-400"
                                                        onClick={() => handleJoin(event)}
                                                    >
                                                        Join Now
                                                    </button>
                                                ) : (

                                                    <button
                                                        className={`border  px-5 text-white  rounded  bg-blue-600 hover:bg-blue-500 border-blue-500`}
                                                        onClick={() => {
                                                            handleRegisterEventsAfterLive(event.id)

                                                        }}
                                                    >
                                                        Register
                                                    </button>
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
                        {liveEvents.totalPages > 1 &&
                            <Pagination
                                totalItems={liveEvents.totalElements}
                                totalPages={liveEvents.totalPages}
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
                            <p className="w-56 font-Lexend_Bold">UPCOMING EVENTS</p>
                            <span className="w-full h-0 border-2 rounded-full "></span>
                        </div>

                        {upComingEvents.content?.length > 0 ? (
                            <div className="grid grid-cols-1 gap-4 events-grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
                                {upComingEvents.content?.map((event, index) => (
                                    <div key={index} className="w-full p-3 border rounded shadow event-card bg-gray-20 font-Lexend_Regular">
                                        <div className="pb-4 space-y-2 bg-white">
                                            <div className={` h-32 p-1 flex  bg-gray-100 font-Lexend_Regular ${!eventImages[event.id] ? "justify-between" : "justify-end"}`}
                                                style={{
                                                    backgroundImage: `url(${eventImages[event.id]})`,
                                                    backgroundSize: "cover",
                                                    backgroundPosition: "center",
                                                    backgroundRepeat: "no-repeat",
                                                    alt: "Event image"
                                                }}
                                            >
                                                {!eventImages[event.id] && <div className='flex items-center space-x-1 text-gray-100 h-fit'>
                                                    ....
                                                </div>}

                                                {!eventImages[event.id] && <div className='flex items-center'>
                                                    <img
                                                        className=" h-28"
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
                                                                setEventType("Past Event")
                                                                handleViewDetails(event)
                                                            }}
                                                        />
                                                    </i>
                                                </div>
                                            </div>

                                            <div className="text-center bg-white ">
                                                <h3 className="font-Lexend_SemiBold">{event.name} </h3>
                                                <div className="flex items-center justify-center my-2 text-gray-400">
                                                    <div className="flex items-center justify-center px-2 space-x-1 border rounded-lg">
                                                        <FaUser size={12} />
                                                        <p>{event.users.length || 0}</p>
                                                    </div>
                                                </div>
                                                {event.teamCreationAllowed ? <span className="px-2 my-2 text-white bg-green-500 rounded">Team Event</span> : <span className="px-2 my-2 text-white bg-blue-500 rounded">Solo Event</span>}
                                                <p className="mt-2 text-xs">Registration Duration</p>
                                                <p className="text-sm">{formatTimeRange(event.registrationStartDateTime, event.registrationEndDateTime)}</p>
                                                <p className="mt-2 text-xs">Starts on</p>
                                                <p className="text-sm">{formatTimeRange(event.startDateTime, event.endDateTime)}</p>
                                            </div>
                                            <div className="flex items-end justify-center">
                                                {userDetails && event.users.includes(userDetails.id) ? (
                                                    <button
                                                        className={`border border-green-800 px-5 text-white hover:bg-green-700 rounded  cursor-not-allowed bg-green-800`}
                                                    >
                                                        Registered
                                                    </button>
                                                ) : (
                                                    <button
                                                        className={`border  px-5 text-white  rounded  bg-blue-600 hover:bg-blue-500 border-blue-500`}
                                                        onClick={() => handleRegisterEvents(event.id)}
                                                    >
                                                        Register
                                                    </button>
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
                        {upComingEvents.totalPages > 1 &&
                            <Pagination
                                totalItems={upComingEvents.totalElements}
                                totalPages={upComingEvents.totalPages}
                                currentPage={currentPageUpComingEvents}
                                handlePrevious={handleUpComingEventsPrevious}
                                handleNext={handleUpComingEventsNext}
                                itemsPerPage={rowsPerPageUpComingEvents}
                                setCurrentPage={setCurrentPageUpComingEvents}
                                rowsPerPage={rowsPerPageUpComingEvents}
                                setRowsPerPage={setRowsPerPageUpComingEvents}
                            />
                        }
                    </div>
                    <div className="p-4 live-events-container">
                        <div className="flex items-center pb-3">
                            <p className="font-Lexend_Bold w-36">PAST EVENTS</p>
                            <span className="w-full h-0 border-2 rounded-full "></span>
                        </div>
                        {pastEvents.content?.length > 0 ? (
                            <div className="grid grid-cols-1 gap-4 events-grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
                                {pastEvents.content?.map((event, index) => (
                                    <div key={index} className="w-full p-3 border rounded shadow event-card bg-gray-20 font-Lexend_Regular">
                                        <div className="pb-2 space-y-2 bg-white">
                                            <div className={` h-32 p-1 flex  bg-gray-100 font-Lexend_Regular ${!eventImages[event.id] ? "justify-between" : "justify-end"}`}
                                                style={{
                                                    backgroundImage: `url(${eventImages[event.id]})`,
                                                    backgroundSize: "cover",
                                                    backgroundPosition: "center",
                                                    backgroundRepeat: "no-repeat",
                                                    alt: "Event image"
                                                }}
                                            >
                                                {!eventImages[event.id] && <div className='flex items-center space-x-1 text-gray-100 h-fit'>
                                                    ....
                                                </div>}

                                                {!eventImages[event.id] && <div className='flex items-center'>
                                                    <img
                                                        className=" h-28"
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
                                                                setEventType("Past Event")
                                                                handleViewDetails(event)
                                                            }}
                                                        />
                                                    </i>
                                                </div>
                                            </div>
                                            <div className="text-center bg-white ">
                                                <h3 className="font-Lexend_SemiBold">{event.name} </h3>
                                                <div className="flex items-center justify-center my-2 text-gray-400">
                                                    <div className="flex items-center justify-center px-2 space-x-1 border rounded-lg">
                                                        <FaUser size={12} />
                                                        <p>{event.users.length || 0}</p>
                                                    </div>
                                                </div>
                                                {event.teamCreationAllowed ? <span className="px-2 my-2 text-white bg-green-500 rounded">Team Event</span> : <span className="px-2 my-2 text-white bg-blue-500 rounded">Solo Event</span>}
                                                <p className="mt-2 text-xs">Registration was open from </p>
                                                <p className="text-sm">{formatTimeRange(event.registrationStartDateTime, event.registrationEndDateTime)}</p>
                                                <p className="mt-2 text-xs">Event was held</p>
                                                <p className="text-sm">{formatTimeRange(event.startDateTime, event.endDateTime)}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="no-events">
                                <p>No events are available</p>
                            </div>
                        )}
                        {pastEvents.totalPages > 0 &&
                            <Pagination
                                totalItems={pastEvents.totalElements}
                                totalPages={pastEvents.totalPages}
                                currentPage={currentPagePastEvents}
                                handlePrevious={handlePastEventsPrevious}
                                handleNext={handlePastEventsNext}
                                itemsPerPage={rowsPerPagePastEvents}
                                setCurrentPage={setCurrentPagePastEvents}
                                rowsPerPage={rowsPerPagePastEvents}
                                setRowsPerPage={setRowsPerPagePastEvents}
                            />
                        }
                    </div>
                    <EventDetailsModal
                        key={selectedEvent?.id}
                        liveEvents={liveEvents}
                        selectedEvent={selectedEvent}
                        setSelectedEvent={setSelectedEvent}
                        isOpen={isModalOpen}
                        eventImages={selectedEventImage}
                        onClose={handleCloseModal}
                        handleJoin={handleJoin}
                        eventType={eventType}
                        userDetails={userDetails}
                        joinedEventId={joinedEventId}
                        handleRegisterEventsAfterLive={handleRegisterEventsAfterLive}
                    />

                </div>
            </div>

        </div >

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
                    <option value={15}>15</option>
                    <option value={20}>20</option>
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



export default UserDashboard