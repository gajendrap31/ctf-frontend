import Navbar from './Navbar';
import { useState, useEffect } from 'react';
import { url } from './Authentication/Utility';
import axios from 'axios';
import { BsFillInfoCircleFill } from 'react-icons/bs';
import { FaUser } from 'react-icons/fa';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/solid';
import { format } from "date-fns";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Grid, Pagination, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/grid";
import "swiper/css/pagination";
import { IoMdArrowRoundForward } from "react-icons/io";
import { IoMdArrowRoundBack } from "react-icons/io";
import { useRef } from "react";
import EventDetailsModal from './EventDetailsModal';

function UpComingEvents() {
    const [upComingEvents, setUpComingEvents] = useState([])

    const fetchUpComingEvents = async () => {
        try {
            const token = localStorage.getItem('Token');
            const response = await axios.get(`${url}/events/upcoming`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setUpComingEvents(response?.data || []);
            console.log(response.data)
        } catch (error) {
            console.log(error)
        }

    }
    useEffect(() => {
        fetchUpComingEvents()
    }, [])
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
    const [rowsPerPageUpComingEvents, setRowsPerPageUpComingEvents] = useState(10);
    const [searchKeyUpComingEvents, setSearchKeyUpComingEvents] = useState("");
    const [currentPageUpComingEvents, setCurrentPageUpComingEvents] = useState(1);

    const filteredUpComingEventsData = upComingEvents.filter((data) => {
        const startDateFormatted = data?.startDateTime
            ? format(new Date(data.startDateTime), "yyyy-MM-dd")
            : "";

        return (
            data?.name?.toLowerCase()?.includes(searchKeyUpComingEvents.toLowerCase()) ||
            data?.organisationType?.includes(searchKeyUpComingEvents) ||
            startDateFormatted.includes(searchKeyUpComingEvents)
        );
    }
    );

    const totalItemsUpComingEvents = filteredUpComingEventsData.length;
    const totalPagesUpComingEvents = Math.ceil(totalItemsUpComingEvents / rowsPerPageUpComingEvents);

    const paginatedUpComingEventsData = filteredUpComingEventsData.slice(
        (currentPageUpComingEvents - 1) * rowsPerPageUpComingEvents,
        currentPageUpComingEvents * rowsPerPageUpComingEvents
    );

    // const handleUpComingEventsPrevious = () => {
    //     if (currentPageUpComingEvents > 1) setCurrentPageUpComingEvents((prev) => prev - 1);
    // };

    // const handleUpComingEventsNext = () => {
    //     if (currentPageUpComingEvents < totalPagesUpComingEvents) setCurrentPageUpComingEvents((prev) => prev + 1);
    // };
    console.log(paginatedUpComingEventsData)
    const prevRef = useRef(null);
    const nextRef = useRef(null);

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
        console.log(eventId)
        if (eventImages[eventId]) return eventImages[eventId];
        try {
            const response = await axios.get(`${url}/event/${eventId}/image`, {
                responseType: "blob",
            });
            console.log("res",response)
            const imageUrl = URL.createObjectURL(response.data);
            console.log("img",imageUrl)
            setEventImages((prev) => ({ ...prev, [eventId]: imageUrl }));
            return imageUrl;
        } catch (error) {
            console.log(error)
            return null;
        }
    };

    useEffect(() => {

        upComingEvents?.forEach(event => {
            getEventImageById(event.id);
        });

    }, [upComingEvents]);

    return (
        <div>
            <div id="events-section">
                <div className="px-4 pt-6 min-h-[50vh] sm:px-6 md:px-14 lg:px-24 xl:px-48 2xl:px-72">
                    <h1 className="mb-2 text-xl text-blue-600 sm:text-2xl font-Lexend_Regular">Upcoming Events</h1>
                    <p className="w-full my-2 mb-4 border"></p>

                    <div className="relative pb-5">

                        <div className="relative z-10 flex justify-between w-full px-4 mb-2 md:px-10">
                            <button
                                ref={prevRef}
                                className="z-20 p-2 text-gray-800 transition bg-white rounded-full shadow-md hover:bg-white/70 disabled:hidden"
                            >
                                <IoMdArrowRoundBack size={20} />
                            </button>
                            <button
                                ref={nextRef}
                                className="z-20 p-2 text-gray-800 transition bg-white rounded-full shadow-md hover:bg-white/70 disabled:hidden motion-preset-fade-md"
                            >
                                <IoMdArrowRoundForward size={20} />
                            </button>
                        </div>


                        <Swiper
                            modules={[Autoplay, Grid, Pagination, Navigation]}
                            autoplay={{ delay: 6000 }}
                            pagination={{ clickable: true }}
                            navigation={{
                                prevEl: prevRef.current,
                                nextEl: nextRef.current,
                            }}
                            onBeforeInit={(swiper) => {
                                swiper.params.navigation.prevEl = prevRef.current;
                                swiper.params.navigation.nextEl = nextRef.current;
                            }}

                            touchRatio={1}
                            simulateTouch={true}
                            spaceBetween={20}
                            slidesPerView={4}
                            grid={{ rows: 2, fill: "row" }}
                            breakpoints={{
                                320: { slidesPerView: 1, grid: { rows: 2, fill: "row" } },
                                640: { slidesPerView: 2, grid: { rows: 2, fill: "row" } },
                                1024: { slidesPerView: 3, grid: { rows: 2, fill: "row" } },
                                1240: { slidesPerView: 4, grid: { rows: 2, fill: "row" } },
                            }}
                            className="w-full mb-10 motion-preset-slide-up"
                        >
                            {upComingEvents?.length > 0 ? upComingEvents?.map((event, index) => (
                                <SwiperSlide key={index}>
                                    <div key={index} className="w-full p-3 border rounded shadow event-card bg-gray-20 font-Lexend_Regular">
                                        <div className="pb-4 space-y-2 bg-white">
                                            <div className={` h-32 p-1 flex  bg-gray-100 font-Lexend_Regular ${!eventImages[event.id] ? "justify-between" : "justify-end motion-preset-slide-up-sm"}`}
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

                                                {!eventImages[event.id] && <div className='flex items-center motion-preset-slide-up-sm'>
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
                                                        <p>{event.users?.length || 0}</p>
                                                    </div>
                                                </div>
                                                {event.teamCreationAllowed ? <span className="px-2 my-2 text-white bg-green-500 rounded">Team Event</span> : <span className="px-2 my-2 text-white bg-blue-500 rounded">Solo Event</span>}
                                                <p className="mt-2 text-xs">Registration Duration</p>
                                                <p className="text-sm">{formatTimeRange(event.registrationStartDateTime, event.registrationEndDateTime)}</p>
                                                <p className="mt-2 text-xs">Starts on</p>
                                                <p className="text-sm">{formatTimeRange(event.startDateTime, event.endDateTime)}</p>
                                            </div>

                                        </div>
                                    </div>
                                </SwiperSlide>
                            )) : <SwiperSlide>
                                <div className="flex flex-col items-center justify-center w-full h-64 p-6 space-y-4 text-center bg-white border rounded shadow">
                                    <div className="flex items-center justify-center w-16 h-16 text-gray-400 bg-gray-100 rounded-full">
                                        <BsFillInfoCircleFill size={32} />
                                    </div>
                                    <h3 className="text-lg text-gray-500 font-Lexend_SemiBold">No Upcoming Events</h3>
                                    <p className="text-sm text-gray-400">Please check back later. New events will be displayed here.</p>
                                </div>
                            </SwiperSlide>}
                        </Swiper>
                        {/* {upComingEvents.length > 0 && (
                            <Pagination
                                totalItems={totalItemsUpComingEvents}
                                totalPages={totalPagesUpComingEvents}
                                currentPage={currentPageUpComingEvents}
                                handlePrevious={handleUpComingEventsPrevious}
                                handleNext={handleUpComingEventsNext}
                                itemsPerPage={rowsPerPageUpComingEvents}
                                setCurrentPage={setCurrentPageUpComingEvents}
                                rowsPerPage={rowsPerPageUpComingEvents}
                                setRowsPerPage={setRowsPerPageUpComingEvents}
                            />
                        )}  */}

                    </div>
                    <EventDetailsModal
                        event={selectedEvent}
                        isOpen={isModalOpen}
                        eventImages={selectedEventImage}
                        onClose={handleCloseModal}


                    />
                </div>
            </div>
        </div>
    );
}






function TablePagination({
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
export default UpComingEvents
