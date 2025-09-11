import Sidebar from "./Sidebar"
import Navbar from "./Navbar"
import React from "react";
import { useState, useEffect, useMemo } from "react";
import AuthService from "../Authentication/AuthService";
import { AsyncPaginate } from "react-select-async-paginate";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Tooltip as ReactTooltip } from 'react-tooltip'
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { url } from "../Authentication/Utility";
import { BsBoxArrowUpRight } from "react-icons/bs";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import { Pagination } from "swiper/modules";
import "swiper/css/navigation";
import { Navigation, Autoplay } from "swiper/modules";
import { useRef } from "react";
import { FaUser } from "react-icons/fa";
import { FaUsers } from "react-icons/fa6";
import { FaUsersBetweenLines } from "react-icons/fa6";
import { IoFlag } from "react-icons/io5";
import { IoIosArrowForward, IoIosArrowBack } from "react-icons/io";
import { LuArrowUp } from "react-icons/lu";
import { RiPercentLine, RiCalendarEventFill } from "react-icons/ri";
import { FaArrowUpRightFromSquare } from "react-icons/fa6"
import { MdOutlineRateReview, MdOutlineArrowForwardIos, MdOutlineArrowBackIosNew } from "react-icons/md";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function AdminDashboard({ userDetails }) {

    const [open, setOpen] = useState(true);
    const [totalRegisteredUsers, setTotalRegisteredUsers] = useState()
    const [events, setEvents] = useState([])
    const [todayLiveEvents, setTodayLiveEvents] = useState([])
    const [todayNonLiveEvents, setTodayNonLiveEvents] = useState([])
    const [selectedEventForParticipants, setSelectedEventForParticipants] = useState("")
    const token = useMemo(() => AuthService.getToken(), []);
    const navigate = useNavigate()

    useEffect(() => {
        const handleResize = () => setOpen(window.innerWidth >= 1280);
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        if (!AuthService.isTokenValid(token)) navigate("/");
    }, [navigate, token]);

    const axiosInstance = useMemo(() => axios.create({
        baseURL: url,
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        withCredentials: true,
    }), [token]);

    const fetchRegisteredUsers = async () => {
        try {
            const res = await axiosInstance.get(`/admin/users/count`);
            setTotalRegisteredUsers(res.data);
        } catch (error) {

        }
    };

    const fetchEvents = async () => {
        try {
            const response = await axiosInstance.get('/admin/event/list');
            setEvents(response.data);

        } catch (error) {

        }
    };
    const fetchTodayLiveEvents = async () => {
        try {
            const response = await axiosInstance.get('/admin/events/today/live');
            setTodayLiveEvents(response.data);

        } catch (error) {

        }
    };
    const fetchTodayNonLiveEvents = async () => {
        try {
            const response = await axiosInstance.get('/admin/events/today/non-live');
            setTodayNonLiveEvents(response.data);

        } catch (error) {

        }
    };

    useEffect(() => {
        if (events.content?.length > 0 && !selectedEventForParticipants) {
            // setSelectedEventForParticipants(String(events[0].id));
        }
    }, [events]);

    useEffect(() => {
        fetchEvents()
        fetchTodayLiveEvents()
        fetchTodayNonLiveEvents()
        fetchRegisteredUsers()
    }, [])

    return (
        <div className="">
            <Sidebar open={open} name={userDetails.username} value={open} setValue={setOpen} className="fixed top-0 left-0 overflow-y-auto bg-white shadow-lg" />

            <div className="flex flex-col w-full ">
                <Navbar name={userDetails.name} value={open} setValue={setOpen} />
                <ToastContainer />
                <div className={`text-gray-900 overflow-auto min-h-[90vh] w-full ${open ? 'lg:pl-72' : ''} `} >
                    <div className="grid grid-cols-1 gap-4 p-3 m-4 text-sm rounded md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 font-Lexend_Regular">
                        <div className="flex flex-col justify-between p-5 border rounded shadow ">
                            <div className="flex flex-col items-center justify-center">
                                <p className="text-4xl text-center text-gray-800 font-Lexend_SemiBold">{totalRegisteredUsers || 0}</p>
                                <p className="pb-2 text-gray-500">Registered Users</p>
                                <button className="px-2 text-white bg-blue-600 rounded cursor-pointer" onClick={() => navigate("/admin/users")}>View</button>
                            </div>
                            <div className="flex items-end justify-between text-yellow-400">
                                <div className="flex items-center text-green-500 font-Lexend_SemiBold"></div>
                                <FaUser size={44} />
                            </div>
                        </div>

                        <div className="flex flex-col justify-between p-5 border rounded shadow">
                            <div className="flex flex-col items-center justify-center">
                                <p className="text-4xl text-center text-gray-800 font-Lexend_SemiBold">{events.totalElements || 0}</p>
                                <p className="text-gray-500">Events</p>
                            </div>
                            <div className="flex items-end justify-between text-yellow-400">
                                <div className="flex items-center text-green-500 font-Lexend_SemiBold"></div>
                                <RiCalendarEventFill size={44} className="text-blue-500" />
                            </div>
                        </div>
                        <ParticipantsCard
                            axiosInstance={axiosInstance}
                            selectedEventForParticipants={selectedEventForParticipants}
                            setSelectedEventForParticipants={setSelectedEventForParticipants}
                        />
                        <ReviewSubmissionsCarousel todayLiveEvents={todayLiveEvents} />
                    </div>
                    <div className="grid grid-cols-1 gap-4 p-3 m-4 rounded md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 font-Lexend_Regular">

                        <div className="space-y-4 lg:col-span-3 md:col-span-2">
                            <EventScoreGraph />
                        </div>

                        <TodayEvents todayLiveEvents={todayLiveEvents} todayNonLiveEvents={todayNonLiveEvents} />

                    </div>
                </div>
            </div>
        </div>

    )
}

const ParticipantsCard = ({ axiosInstance, selectedEventForParticipants, setSelectedEventForParticipants }) => {
    const [isLoading, setIsLoading] = useState(false);
    const cachedOptions = useRef([]);
    const lastSearchTerm = useRef("");
    const MAX_OPTIONS = 20
    const loadOptions = async (inputValue, _, { page }) => {
        try {
            setIsLoading(true);

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

            const newOptions = response.data?.content?.map((event) => ({
                value: event.id,
                label: event.name,
                totalRegisteredUser: event.totalRegisteredUser,
                color: event.live
                    ? "#10B981"
                    : event.teamSubmissions || event.userSubmissions
                        ? "#374151"
                        : "#374151",
            })) || [];

            // Combine and deduplicate based on `value`
            const allOptions = [...cachedOptions.current, ...newOptions];
            const uniqueOptionsMap = new Map();
            for (const option of allOptions) {
                uniqueOptionsMap.set(option.value, option); // Overwrites duplicates by value
            }
            cachedOptions.current = Array.from(uniqueOptionsMap.values()).slice(-MAX_OPTIONS);

            if (cachedOptions.current.length > 0 && !selectedEventForParticipants) {
                setSelectedEventForParticipants(cachedOptions.current[0].value);
            }

            return {
                options: cachedOptions.current,
                hasMore: !response.data.last,
                additional: { page: page + 1 },
            };
        } catch (error) {
            toast.error("Error loading events");
            return { options: [], hasMore: false };
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        (async () => {
            const { options } = await loadOptions("", null, { page: 1 });

            if (options.length > 0 && !selectedEventForParticipants) {
                setSelectedEventForParticipants(options[0].value);
            }
        })();
    }, []);

    const totalRegisteredUser = cachedOptions.current?.find(
        (data) => String(data.value) === String(selectedEventForParticipants)
    )?.totalRegisteredUser || 0;

    return (
        <div className="relative w-full p-5 border rounded shadow group">
            <div className="flex flex-col justify-between h-full space-y-3 rounded">
                <div className="flex flex-col items-center">
                    {/* Registered Users Display */}
                    {selectedEventForParticipants ? (
                        <div className="text-center ">
                            <p className="text-4xl text-center text-gray-800 font-Lexend_SemiBold">
                                {totalRegisteredUser}
                            </p>
                            <p className="text-sm text-gray-500">Registered Participants</p>
                        </div>
                    ) : <p className="text-gray-500">Participants</p>}


                    <div className="w-full max-w-xs pt-5 mx-auto sm:max-w-sm md:max-w-md">
                        <AsyncPaginate
                            className="text-sm text-gray-600 font-Lexend_Regular"
                            classNamePrefix="event-select"
                            value={
                                selectedEventForParticipants
                                    ? cachedOptions.current.find((opt) => opt.value === selectedEventForParticipants) || {
                                        value: selectedEventForParticipants,
                                        label: "Selected Event",
                                    }
                                    : null
                            }
                            loadOptions={loadOptions}
                            onChange={(selectedOption) =>
                                setSelectedEventForParticipants(selectedOption?.value || null)
                            }
                            placeholder="Select Event"
                            isClearable
                            isLoading={isLoading}
                            additional={{ page: 1 }}
                            styles={{
                                control: (provided, state) => ({
                                    ...provided,
                                    minHeight: "44px",
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
                    </div>
                </div>

                <div className="flex flex-col items-end justify-end w-full text-green-500">
                    <FaUsersBetweenLines size={44} />
                </div>
            </div>
        </div>
    );
};

const EventScoreGraph = () => {
    const [scoreData, setScoreData] = useState([]);
    const [currentEventId, setCurrentEventId] = useState(null);
    const [defaultEventSet, setDefaultEventSet] = useState(false);
    const navigate = useNavigate()
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage] = useState(20);
    const [sortBy] = useState(0);

    const MAX_OPTIONS = 40;
    const cachedOptions = useRef([]);
    const lastSearchTerm = useRef("");

    const token = useMemo(() => AuthService.getToken(), []);
    const axiosInstance = useMemo(() => axios.create({
        baseURL: url,
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        withCredentials: true,
    }), [token]);


    const chartRef = useRef(null);

    useEffect(() => {
        if (!chartRef.current) return;

        const observer = new ResizeObserver(() => {
            requestAnimationFrame(() => {
                if (chartRef.current) {
                    chartRef.current.resize();
                }
            });
        });

        const chartCanvas = chartRef.current.canvas;
        if (chartCanvas && chartCanvas.parentNode) {
            observer.observe(chartCanvas.parentNode);
        }

        return () => observer.disconnect();
    }, []);

    const loadOptions = async (inputValue, _, { page }) => {
        // Prevent initial duplicate fetch
        if (page === 1 && cachedOptions.current.length > 0 && inputValue === lastSearchTerm.current) {
            return {
                options: cachedOptions.current,
                hasMore: false,
                additional: { page: page + 1 },
            };
        }

        try {
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

            const newOptions = (response.data?.content || [])
                .filter((event) => event.teamSubmissions || event.userSubmissions)
                .map((event) => ({
                    value: event.id,
                    label: event.name,
                    color: event.live ? "#10B981" : "#374151",
                }));

            // 🧠 Deduplicate
            const optionMap = new Map();
            [...cachedOptions.current, ...newOptions].forEach(opt => {
                optionMap.set(opt.value, opt);
            });

            const deduped = Array.from(optionMap.values());

            if (!defaultEventSet && deduped.length > 0) {
                setCurrentEventId(deduped[0].value);
                setDefaultEventSet(true);
            }

            cachedOptions.current = deduped.slice(-MAX_OPTIONS);

            return {
                options: cachedOptions.current,
                hasMore: !response.data.last && newOptions.length > 0,
                additional: { page: page + 1 },
            };
        } catch (error) {

            return { options: [], hasMore: false };
        }
    };


    useEffect(() => {
        (async () => {
            const { options } = await loadOptions("", null, { page: 1 });

            if (options.length > 0 && !currentEventId) {
                setCurrentEventId(options[0].value);
            }
        })();
    }, []);
    useEffect(() => {
        if (currentEventId) {
            fetchScoreData(currentEventId);
        }
    }, [currentEventId, currentPage]);

    const fetchScoreData = async (eventId) => {
        try {
            const res = await axiosInstance.get(`/admin/event/${eventId}/score`, {
                params: {
                    page: currentPage - 1,
                    size: rowsPerPage,
                    sortBy
                },
            });
            setScoreData(res.data);
        } catch (error) {

        }
    };
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 640); // Tailwind's sm: 640px
        };

        handleResize(); // Run once on mount
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const data = {
        labels: scoreData.content?.map((team) => team.team?.name || team.user?.fullName),
        datasets: [
            {
                label: "ScoreBoard",
                data: scoreData.content?.map((team) => team.score),
                backgroundColor: (ctx) => {
                    const chart = ctx.chart;
                    const { ctx: canvasCtx, chartArea } = chart;
                    if (!chartArea) return "rgba(54, 162, 235, 0.6)";

                    const gradient = canvasCtx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
                    gradient.addColorStop(0, "rgb(179, 179, 179)");
                    gradient.addColorStop(1, "rgb(38, 38, 38)");
                    return gradient;
                },
                borderRadius: 5,
                barThickness: isMobile ? 5 : 10,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                display: false,
                position: "top",
                labels: {
                    font: {
                        size: isMobile ? 10 : 12, // Smaller legend font on mobile
                    },
                },
            },
        },
        scales: {
            x: {
                ticks: {
                    color: "#4B5563",
                    font: {
                        size: isMobile ? 5 : 12, // Smaller x-axis font on mobile
                    },
                },
                grid: { display: false },
            },
            y: {
                beginAtZero: true,
                ticks: {
                    stepSize: 20,
                    color: "#4B5563",
                    font: {
                        size: isMobile ? 8 : 12, // Smaller y-axis font on mobile
                    },
                },
                grid: {
                    color: "rgba(200, 200, 200, 0.2)",
                },
            },
        },
    };


    return (
        <div className="flex flex-col items-center justify-center w-full text-sm bg-white border rounded shadow">
            {/* Top Bar */}
            <div className="flex flex-col justify-between w-full gap-2 p-4 sm:flex-row sm:items-center">
                {/* Event Selector */}
                <div className="w-full sm:w-auto">
                    <AsyncPaginate
                        className="w-full text-sm text-gray-600 font-Lexend_Regular sm:w-72"
                        classNamePrefix="event-select"
                        value={
                            currentEventId
                                ? cachedOptions.current.find(opt => opt.value === currentEventId) || {
                                    value: currentEventId,
                                    label: "Selected Event",
                                }
                                : null
                        }
                        loadOptions={loadOptions}
                        onChange={(selectedOption) => {
                            setCurrentEventId(selectedOption?.value || null);
                            setCurrentPage(1);
                        }}
                        placeholder="Select Event"
                        isClearable
                        additional={{ page: 1 }}
                        styles={{
                            control: (provided, state) => ({
                                ...provided,
                                minHeight: "44px",
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
                </div>

                {/* Scoreboard Header */}
                <div className="flex items-center space-x-2 text-gray-600 font-Lexend_SemiBold">
                    <p className="hidden h-full px-1 py-1 bg-gray-600 rounded-full sm:inline"></p>
                    <p className="py-2 text-center sm:text-left">Scoreboard</p>
                    <BsBoxArrowUpRight
                        className="cursor-pointer"
                        title="Go to Scoreboard"
                        onClick={() =>
                            navigate("/admin/assign-challenges", {
                                state: { eventId: currentEventId },
                            })
                        }
                    />
                </div>
            </div>

            {/* Conditional Chart Area */}
            {scoreData.content?.length === 0 ? (
                <div className="w-full py-4 text-center text-gray-400">
                    No scores available for this event.
                </div>
            ) : (
                <div className="flex items-center justify-center w-full px-1 overflow-x-auto sm:px-4">
                    <button
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        className="text-gray-500 hover:text-black disabled:cursor-not-allowed disabled:opacity-50 disabled:hidden"
                        disabled={currentPage === 1}
                    >
                        <MdOutlineArrowBackIosNew size={24} />
                    </button>

                    <div className="w-full max-w-full overflow-x-auto">
                        <Bar
                            ref={chartRef}
                            data={data}
                            options={options}
                            className="w-full min-w-[300px] min-h-[300px] sm:h-[450px]"
                        />
                    </div>

                    <button
                        onClick={() => setCurrentPage((prev) => prev + 1)}
                        className="text-gray-500 hover:text-black disabled:cursor-not-allowed disabled:opacity-50 disabled:hidden"
                        disabled={!scoreData.totalPages || currentPage === scoreData.totalPages}
                    >
                        <MdOutlineArrowForwardIos size={24} />
                    </button>
                </div>
            )}
        </div>
    );

};




const TodayEvents = ({ todayLiveEvents, todayNonLiveEvents }) => {

    const formatEventDate = (dateTimeString) => {
        const options = { hour: "2-digit", minute: "2-digit", hour12: true };
        return new Intl.DateTimeFormat("en-US", options).format(new Date(dateTimeString));
    };

    return (
        <div className="flex flex-col col-span-1 p-4 rounded ">
            <div>
                <p className="text-center">Today's Event {new Date().toLocaleDateString("en-US", { day: "2-digit", month: "short", year: 'numeric' })}</p>
                <p className="mb-2 border"></p>

                {todayLiveEvents.length > 0 ?
                    todayLiveEvents.map((event, index) => (
                        <div key={index} className="flex items-center p-1 space-x-2">
                            <p className="p-1"><IoFlag size={18} className="text-green-600 " data-tooltip-id="Live_Event" data-tooltip-content="Live Event" /></p>
                            <div className="text-gray-600 font-Lexend_Regular ">
                                <p className="text-gray-800 font-Lexend_SemiBold">{event.name}</p>

                                <div className="flex space-x-2 text-sm">
                                    <p>{formatEventDate(event.startDateTime)}</p>
                                    <p>-</p>
                                    <p>{formatEventDate(event.endDateTime)}</p>
                                </div>

                            </div>
                        </div>
                    )) : <p></p>
                }
                <ReactTooltip id="Live_Event" />
            </div>

            <div>

                {todayNonLiveEvents.length > 0 ?
                    todayNonLiveEvents.map((event, index) => (
                        <div key={index} className="flex items-center p-1 space-x-2">
                            <p className="p-1"><IoFlag size={18} className="text-yellow-400 " data-tooltip-id="Non-Live_Event" data-tooltip-content="Non-Live Event" /></p>
                            <div className="text-gray-600 font-Lexend_Regular ">
                                <p className="text-gray-800 font-Lexend_SemiBold">{event.name}</p>
                                <div className="flex space-x-2 text-sm">
                                    <p>{formatEventDate(event.startDateTime)}</p>
                                    <p>-</p>
                                    <p>{formatEventDate(event.endDateTime)}</p>
                                </div>

                            </div>
                        </div>
                    )) : <p></p>
                }
            </div>
            <ReactTooltip id="Non-Live_Event" />

        </div>
    )
}

const ReviewSubmissionsCarousel = ({ users, todayLiveEvents }) => {
    const prevRef = useRef(null);
    const nextRef = useRef(null);
    const [reviewSubmissionData, setReviewSubmissionData] = useState([]);
    const [currentEventId, setCurrentEventId] = useState(null);
    const navigate = useNavigate()

    // Get Auth Token & Axios Instance
    const token = useMemo(() => AuthService.getToken(), []);
    const axiosInstance = useMemo(
        () =>
            axios.create({
                baseURL: url,
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                withCredentials: true,
            }),
        [token]
    );

    // Filter Only Live Events
    const filteredEvents = todayLiveEvents?.filter((event) => event.live);

    // Set Initial Event ID
    useEffect(() => {
        if (filteredEvents.length > 0 && !currentEventId) {
            setCurrentEventId(filteredEvents[0].id);
        }
    }, [filteredEvents]);

    // Fetch Submission Data When `currentEventId` Changes
    useEffect(() => {
        if (currentEventId) {
            fetchReviewSubmissionData(currentEventId);
        }
    }, [currentEventId]);

    // Fetch Submission Data
    const fetchReviewSubmissionData = async (eventId) => {
        try {
            const res = await axiosInstance.get(`/admin/event/${eventId}/submissions/review`);

            setReviewSubmissionData(res.data);
        } catch (error) {

        }
    };

    return (
        <div className="relative w-full p-5 border rounded shadow group ">
            {/* Swiper Component */}
            <Swiper
                slidesPerView={1}
                spaceBetween={20}
                modules={[Navigation, Autoplay]} // ✅ Added Autoplay
                // autoplay={{
                //     delay: 3000, // ✅ Auto-scroll every 3 seconds
                //     disableOnInteraction: false,
                // }}
                navigation={{ prevEl: prevRef.current, nextEl: nextRef.current }}
                onSlideChange={(swiper) => {
                    setCurrentEventId(filteredEvents[swiper.activeIndex]?.id);
                }}
                onBeforeInit={(swiper) => {
                    swiper.params.navigation.prevEl = prevRef.current;
                    swiper.params.navigation.nextEl = nextRef.current;
                    swiper.navigation.init();
                    swiper.navigation.update();
                }}
                className="h-full "
            >
                {/* Slides */}
                {filteredEvents.length > 0 ? (
                    filteredEvents.map((event, index) => (
                        <SwiperSlide key={event.id}>
                            <div className="flex flex-col justify-between h-full space-y-3 rounded">
                                <div className="flex flex-col items-center">
                                    <p className="text-4xl text-center text-gray-800 font-Lexend_SemiBold">
                                        {reviewSubmissionData?.length || 0}
                                    </p>
                                    <p className="text-gray-500">Submissions Left to Review</p>
                                    <p className="text-xl text-red-500 font-Lexend_SemiBold">{event.name}</p>
                                    <p className="px-2 text-white -skew-x-12 rounded shadow-md w-fit bg-lime-500">Live</p>
                                </div>
                                <div className="flex items-center justify-between w-full text-gray-700">
                                    <FaArrowUpRightFromSquare
                                        size={24} onClick={() => navigate("/admin/mark-for-review", { state: { event } })}
                                        data-tooltip-id="review-submission"
                                        data-tooltip-content="Go to Review Submission"
                                        className="cursor-pointer"
                                    />
                                    <MdOutlineRateReview size={44} className="text-slate-500" />
                                </div>
                            </div>
                        </SwiperSlide>
                    ))
                ) : (
                    <SwiperSlide>
                        <div className="flex items-center justify-center h-full text-center text-gray-500"><p>Live Events are not available</p></div>
                    </SwiperSlide>
                )}
            </Swiper>
            <ReactTooltip id="review-submission" place="right" />
            {/* Navigation Buttons */}
            <button
                ref={prevRef}
                className="absolute left-0 p-2 text-gray-700 transition-opacity duration-300 transform -translate-y-1/2 rounded shadow opacity-0 top-1/2 group-hover:opacity-100"
            >
                ❮
            </button>
            <button
                ref={nextRef}
                className="absolute right-0 p-2 text-gray-700 transition-opacity duration-300 transform -translate-y-1/2 rounded shadow opacity-0 top-1/2 group-hover:opacity-100"
            >
                ❯
            </button>
        </div>
    );
};

const EventTeamCarousel = ({ users, events }) => {
    const prevRef = useRef(null);
    const nextRef = useRef(null);

    return (
        <div className="relative w-full p-5 border rounded shadow group">
            {/* Swiper with Navigation */}
            <Swiper
                slidesPerView={1}
                spaceBetween={20}
                modules={[Navigation]}
                onBeforeInit={(swiper) => {
                    swiper.params.navigation.prevEl = prevRef.current;
                    swiper.params.navigation.nextEl = nextRef.current;
                    swiper.navigation.init();
                    swiper.navigation.update();
                }}
                className="h-full"
            >
                {events.content?.length > 0 ? (
                    events.content?.map((event, index) => (
                        <SwiperSlide key={index}>

                            <div className="flex flex-col justify-between h-full space-y-3 rounded">

                                <div className="flex flex-col items-center w-fit">

                                    <p className="text-4xl text-center text-gray-800 font-Lexend_SemiBold">{event.teams?.length}</p>
                                    <p className="text-gray-500 ">Teams </p>
                                    <p className="text-xl text-red-500 text-balance font-Lexend_SemiBold">{event.name}</p>

                                </div>
                                <div className="flex flex-col items-end justify-end w-full text-blue-500 ">
                                    <FaUsers size={44} />
                                </div>
                            </div>
                        </SwiperSlide>
                    ))
                ) : (
                    <SwiperSlide>
                        <div className="text-center text-gray-500">Events are not available</div>
                    </SwiperSlide>
                )}
            </Swiper>

            {/* Left & Right Navigation Buttons (Visible on Hover) */}
            <button
                ref={prevRef}
                className="absolute left-0 p-2 text-gray-700 transition-opacity duration-300 transform -translate-y-1/2 rounded shadow opacity-0 top-1/2 group-hover:opacity-100"
            >
                ❮
            </button>
            <button
                ref={nextRef}
                className="absolute right-0 p-2 text-gray-700 transition-opacity duration-300 transform -translate-y-1/2 rounded shadow opacity-0 top-1/2 group-hover:opacity-100"
            >
                ❯
            </button>
        </div>

    );
};

const EventRegisteredUsersCarousel = ({ users, events }) => {
    const prevRef = useRef(null);
    const nextRef = useRef(null);

    return (
        <div className="relative w-full p-5 border rounded shadow group">
            {/* Swiper with Navigation */}
            <Swiper
                slidesPerView={1}
                spaceBetween={20}
                modules={[Navigation]}
                onBeforeInit={(swiper) => {
                    swiper.params.navigation.prevEl = prevRef.current;
                    swiper.params.navigation.nextEl = nextRef.current;
                    swiper.navigation.init();
                    swiper.navigation.update();
                }}
                className="h-full"
            >
                {events.content?.length > 0 ? (
                    events.content?.map((event, index) => (
                        <SwiperSlide key={index}>

                            <div className="flex flex-col justify-between h-full space-y-3 rounded">

                                <div className="flex flex-col items-center ">

                                    <p className="text-4xl text-center text-gray-800 font-Lexend_SemiBold">{event.users?.length}</p>
                                    <p className="text-gray-500 ">Participants</p>
                                    <div>
                                        <div className="flex flex-col items-center gap-2 sm:flex-row">
                                            <select
                                                id="event-select"
                                                className="p-2 text-xl text-red-500 border-b border-gray-300 rounded font-Lexend_SemiBold"
                                            // value={selectedEvent || ""}
                                            //onChange={(e) => setSelectedEvent(e.target.value)}
                                            >
                                                <option value="" disabled>Select Event</option>
                                                {events.content?.map((data, i) => (
                                                    <option key={i} value={data.id} className={`${data.live ? "text-green-500" : "text-gray-600"} text-lg font-Lexend_Regular`}>{data.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>


                                </div>
                                <div className="flex flex-col items-end justify-end w-full text-green-500 ">
                                    <FaUsersBetweenLines size={44} />
                                </div>
                            </div>
                        </SwiperSlide>
                    ))
                ) : (
                    <SwiperSlide>
                        <div className="text-center text-gray-500">Events are not available</div>
                    </SwiperSlide>
                )}
            </Swiper>

            {/* Left & Right Navigation Buttons (Visible on Hover) */}
            <button
                ref={prevRef}
                className="absolute left-0 p-2 text-gray-700 transition-opacity duration-300 transform -translate-y-1/2 rounded shadow opacity-0 top-1/2 group-hover:opacity-100"
            >
                ❮
            </button>
            <button
                ref={nextRef}
                className="absolute right-0 p-2 text-gray-700 transition-opacity duration-300 transform -translate-y-1/2 rounded shadow opacity-0 top-1/2 group-hover:opacity-100"
            >
                ❯
            </button>
        </div>

    );
};




export default AdminDashboard