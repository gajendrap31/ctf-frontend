import React from 'react'
import Sidebar from '../Sidebar';
import { useState, useEffect, useMemo, useRef } from 'react';
import Navbar from '../Navbar';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import { url } from '../../Authentication/Utility';
import { FaPlusCircle } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import { AiOutlineCloseCircle } from "react-icons/ai";
import { IoCloseSharp } from "react-icons/io5";
import { format } from "date-fns";
import Pagination from './Pagination';
import AuthService from '../../Authentication/AuthService';
import { IoClose } from "react-icons/io5";

import { BeatLoader, PulseLoader } from 'react-spinners';
import { PiFunnelX } from "react-icons/pi";
import EventTableData from '../Tables/EventTable';
import { motion, AnimatePresence } from "framer-motion";
function AdminEvents({ userDetails }) {

    //sidebar open close 
    const [open, setOpen] = useState(true);

    const navigate = useNavigate()
    const token = useMemo(() => localStorage.getItem('Token'), []);
    //add event 
    const [eventName, setEventName] = useState("")
    const [eventDescription, setEventDescription] = useState("")
    const [startDateTime, setStartDateTime] = useState(() => {
        const now = new Date();
        now.setHours(now.getHours() + 1);
        const offset = now.getTimezoneOffset();
        const localDateTime = new Date(now.getTime() - offset * 60 * 1000).toISOString().slice(0, 16);
        return localDateTime;
    });
    const [endDateTime, setEndDateTime] = useState(() => {
        const start = new Date(startDateTime);
        start.setHours(start.getHours() + 1);
        const offset = start.getTimezoneOffset();
        const localEnd = new Date(start.getTime() - offset * 60000).toISOString().slice(0, 16);
        return localEnd;
    })
    const [registrationStartDateTime, setRegistrationStartDateTime] = useState(() => {
        const currentDate = new Date();
        return currentDate.toISOString().split("T")[0];
    });
    const [registrationEndDateTime, setRegistrationEndDateTime] = useState(() => {
        const currentDate = new Date();
        return currentDate.toISOString().split("T")[0];
    })
    const [maxAttempts, setMaxAttempts] = useState("")
    const [eventImage, setEventImage] = useState()
    const [allowTeamCreation, setAllowTeamCreation] = useState(false)

    //open add event or close
    const [wantAddEvent, setWantAddEvent] = useState(false)

    //show delete modal
    const [showEventDeleteModal, setShowEventDeleteModal] = useState(false);
    const [selectedForDeleteEventId, setSelectedForDeleteEventId] = useState(null);
    const [selectedForDeleteEventName, setSelectedForDeleteEventName] = useState(null);

    //event and organization data
    const [organizationTypeData, setOrganizationTypeData] = useState([])
    const [events, setEvents] = useState([])

    //update event
    const [updateEventId, setUpdateEventId] = useState()
    const [updateEventName, setUpdateEventName] = useState()
    const [updateEventDescription, setUpdateEventDescription] = useState()
    const [updateMaxAttempt, setUpdateMaxAttempt] = useState()
    const [updateStartDateTime, setUpdateStartDateTime] = useState()
    const [updateRegistrationStartDateTime, setUpdateRegistrationStartDateTime] = useState()
    //const [updateStartTime, setUpdateStartTime] = useState()
    const [updateEndDateTime, setUpdateEndDateTime] = useState()
    const [updateRegistrationEndDateTime, setUpdateRegistrationEndDateTime] = useState()
    //const [updateEndTime, setUpdateEndTime] = useState()
    const [allowUpdateTeamCreation, setUpdateAllowTeamCreation] = useState(false)

    //show update modal
    const [showEventUpdateModal, setShowEventUpdateModal] = useState()

    {/*pagination sorting,searching*/ }
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchKey, setSearchKey] = useState("");
    const [sortBy, setSortBy] = useState(0);
    const [sortDirection, setSortDirection] = useState('ASC');

    //Loading
    const [loadingSubmitEvent, setLoadingSubmitEvent] = useState(false)
    const [loadingUpdateEvent, setLoadingUpdateEvent] = useState(false)
    const [loadingDeleteEvent, setLoadingDeleteEvent] = useState(false)

    const [filterStartDate, setFilterStartDate] = useState('');
    const [filterEndDate, setFilterEndDate] = useState('');

    const [tableLoading, setTableLoading] = useState(false)

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

    const fetchOrganization = async () => {
        try {
            const response = await axiosInstance.get(`/organisation-type`);
            setOrganizationTypeData(response.data);

        } catch (error) {
            toast.error(`${error.response?.data || "Error fetching organizations"}`);

        }
    };
    useEffect(() => {
        fetchOrganization();
    }, []);

    const fetchEvents = async (startDateOverride = filterStartDate, endDateOverride = filterEndDate) => {
        try {
            setTableLoading(true)
            const params = {
                page: currentPage - 1,
                size: rowsPerPage,
                sortBy,
                direction: sortDirection,
                searchTerm: searchKey,
            };
            if (startDateOverride && !isNaN(new Date(startDateOverride))) {
                params.startDateTime = new Date(startDateOverride).toISOString();
            }

            if (endDateOverride && !isNaN(new Date(endDateOverride))) {
                params.endDateTime = new Date(endDateOverride).toISOString();
            }

            const response = await axiosInstance.get(`/admin/event`, {
                params
            });
            setEvents(response.data);
        } catch (error) {
            toast.error(`${error.response?.data || "Error fetching events"}`);
        } finally {
            setTableLoading(false)
        }
    };

    useEffect(() => {
        fetchEvents()
    }, [currentPage, rowsPerPage, sortBy, sortDirection, searchKey])


    const handleEventSubmit = async (event) => {
        event.preventDefault();
        const token = localStorage.getItem("Token");
        setLoadingSubmitEvent(true)
        try {
            const formData = new FormData();
            const eventRequest = {
                name: eventName,
                startDateTime: new Date(startDateTime).toISOString(),
                endDateTime: new Date(endDateTime).toISOString(),
                description: eventDescription,
                maxAttempt: maxAttempts,
                registrationStartDateTime: new Date(registrationStartDateTime).toISOString(),
                registrationEndDateTime: new Date(registrationEndDateTime).toISOString(),
                teamCreationAllowed: allowTeamCreation,
            };
            formData.append("eventRequest", new Blob([JSON.stringify(eventRequest)], { type: "application/json" }));

            if (eventImage) {
                formData.append("image", eventImage);
            }

            const response = await axios.post(`${url}/admin/event`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                },
                withCredentials: true,
            });

            toast.success(response?.data || "Event created successfully!");
            setEventName("");
            setEventDescription("");
            setMaxAttempts(null);
            setAllowTeamCreation(false)
            setWantAddEvent(false)
            fetchEvents();

        } catch (error) {
            toast.error(error.response?.data);

        } finally {

            setUpdateEventId();
            setUpdateEventName();
            setUpdateEventDescription();
            setUpdateMaxAttempt();
            setUpdateStartDateTime();
            setUpdateEndDateTime();
            setShowEventUpdateModal(false);
            setLoadingSubmitEvent(false)
        }
    };

    const handleUpdateEvent = async () => {
        const token = localStorage.getItem("Token");
        setLoadingUpdateEvent(true)
        try {
            const payload = {
                name: updateEventName,
                startDateTime: new Date(updateStartDateTime).toISOString(),
                endDateTime: new Date(updateEndDateTime).toISOString(),
                description: updateEventDescription,
                registrationStartDateTime: new Date(updateRegistrationStartDateTime).toISOString(),
                registrationEndDateTime: new Date(updateRegistrationEndDateTime).toISOString(),
                maxAttempt: updateMaxAttempt,
                teamCreationAllowed: allowUpdateTeamCreation
            };

            const response = await axios.put(`${url}/admin/event/${updateEventId}`, payload, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                withCredentials: true,
            });

            toast.success(response?.data || "Event Updated Sucessfully.");
            setEventName("");
            setEventDescription("");
            setMaxAttempts(null);
            fetchEvents();
            setShowEventUpdateModal(false);
            setUpdateEventId();
            setUpdateEventName();
            setUpdateEventDescription();
            setUpdateMaxAttempt();
            setUpdateStartDateTime();
            setUpdateEndDateTime();

            setUpdateAllowTeamCreation(false)
        } catch (error) {
            toast.error(error.response?.data || "Error updating the event");
        } finally {
            setLoadingUpdateEvent(false)
        }
    };



    const handleDeleteEvent = async (id) => {
        try {
            setLoadingDeleteEvent(true)
            const token = localStorage.getItem("Token");

            const response = await axios.delete(`${url}/admin/event/${selectedForDeleteEventId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                withCredentials: true,
            });

            toast.success("Event deleted successfully!");

            fetchEvents();

        } catch (error) {
            toast.error(error.response?.data || "Error deleting the event");
        } finally {
            setShowEventDeleteModal(false);
            setSelectedForDeleteEventId(null);
            setLoadingDeleteEvent(false)
        }
    };

    const formatEventDate = (dateTimeString) => {
        const options = { dateStyle: "medium", timeStyle: "short" };
        return new Intl.DateTimeFormat("en-US", options).format(new Date(dateTimeString));
    };

    const isPast = (eventDate) => {
        return new Date(eventDate) < new Date();
    };
    const isUpcoming = (eventDate) => {
        return new Date(eventDate) > new Date();
    };


    const handlePrevious = () => {
        if (currentPage > 1) setCurrentPage((prev) => prev - 1);
    };

    const handleNext = () => {
        if (currentPage < events.totalPages) setCurrentPage((prev) => prev + 1);
    };
    const handleSort = (columnIndex) => {
        setCurrentPage(1)
        if (sortBy === columnIndex) {
            setSortDirection(prev => (prev === 'ASC' ? 'DESC' : 'ASC'));
        } else {
            setSortBy(columnIndex);
            setSortDirection('ASC');
        }
    };
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
        events.content?.forEach(event => {
            getEventImageById(event.id);
        });

    }, [events]);

    const [wantEditImage, setWantEditImage] = useState(false);
    const [selectedImage, setSelectedImage] = useState("");
    const [selectedEvent, setSelectedEvent] = useState({})

    const handleImageClick = (imageSrc, event) => {
        setSelectedImage(imageSrc);
        setSelectedEvent(event)
        setWantEditImage(true);
    };

    const fileInputRef = useRef(null);
    const [uploading, setUploading] = useState(false);

    const handleChangeImage = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (file) {
            await uploadImage(file);
        }
    };
    const uploadImage = async (file) => {
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append("image", file);

            const res = await axiosInstance.put(`admin/event/${selectedEvent.id}/image`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            toast.success(res.data);
            const response = await axiosInstance.get(`admin/event/${selectedEvent.id}/image`, {
                responseType: "blob",
            });
            const newImageUrl = URL.createObjectURL(response.data);
            setEventImages(prev => ({
                ...prev,
                [selectedEvent.id]: newImageUrl
            }));

            setSelectedImage(newImageUrl);
            fetchEvents();
        } catch (error) {
            toast.error(error.response?.data || "Upload failed");
        } finally {
            setUploading(false);
        }
    };


    const handleFilter = () => {
        fetchEvents()
    };
    const handleClear = () => {
        setFilterStartDate('');
        setFilterEndDate('');
        setCurrentPage(1); // if you have this state
        fetchEvents('', '');
    };

    const handleUpdate = (event) => {
        const toLocalDatetimeString = (isoString) => {
            if (!isoString) return ""; // Prevent error if null/undefined

            const date = new Date(isoString);
            if (isNaN(date.getTime())) return ""; // Invalid date

            const offset = date.getTimezoneOffset();
            const localDate = new Date(date.getTime() - offset * 60000);
            return localDate.toISOString().slice(0, 16); // 'YYYY-MM-DDTHH:MM'
        };

        setUpdateEventId(event.id);
        setUpdateEventName(event.name);
        setUpdateEventDescription(event.description);
        setUpdateMaxAttempt(event.maxAttempt);
        setUpdateStartDateTime(toLocalDatetimeString(event.startDateTime));
        setUpdateEndDateTime(toLocalDatetimeString(event.endDateTime));
        setUpdateRegistrationStartDateTime(toLocalDatetimeString(event.registrationStartDateTime));
        setUpdateRegistrationEndDateTime(toLocalDatetimeString(event.registrationEndDateTime));
        setUpdateAllowTeamCreation(event.teamCreationAllowed);
        setShowEventUpdateModal(true);
    };

    const handleDelete = (event) => {
        setSelectedForDeleteEventId(event.id);
        setSelectedForDeleteEventName(event.name);
        setShowEventDeleteModal(true);
    };

    const handleAssignChallenges = (event) => {
        navigate("/Admin/AssignChallenges", { state: { eventId: event.id } })
    };
    return (
        <div className="overflow-hidden ">
            <Sidebar open={open} name={userDetails.username} value={open} setValue={setOpen} />

            <div className="flex flex-col w-full overflow-hidden text-sm">
                <Navbar name={userDetails.name} value={open} setValue={setOpen} />
                <ToastContainer />
                <div className={`text-gray-900 min-h-lvh  w-full ${open ? 'pl-0 lg:pl-72' : ''} `} >

                    <div className="flex items-center justify-center p-3 py-2 m-4 bg-gray-100 rounded">
                        <p className="px-8 py-1 text-2xl text-gray-800 rounded font-Lexend_Bold">Manage Events</p>
                    </div>
                    <div className=''>

                        {wantAddEvent ? (


                            <div className={`p-3 mx-4 bg-gray-100 rounded font-Lexend_Medium  motion-preset-slide-down-sm`}>
                                <div className='flex justify-between ite'>
                                    <p className='flex items-center text-xl'>Add Event</p>
                                    <IoCloseSharp size={18} onClick={() => setWantAddEvent(false)} />
                                </div>

                                <div>

                                    <form className="mt-5 space-y-4" onSubmit={handleEventSubmit}>

                                        <div className='flex flex-col space-y-4 lg:flex-row lg:space-x-4 lg:space-y-0 '>
                                            <div className="flex flex-col w-full lg:w-1/2">
                                                <label>Name</label>
                                                <input
                                                    className="p-2 text-gray-600 rounded h-9"
                                                    placeholder="Enter event name "
                                                    value={eventName}
                                                    onChange={(e) => setEventName(e.target.value)}
                                                />
                                            </div>
                                            <div className='flex flex-col w-full lg:w-1/2'>
                                                <div className="flex flex-col items-center w-full space-x-0 space-y-4 sm:space-y-0 sm:flex-row">
                                                    <div className='w-full'>
                                                        <label> Start Date & Time</label>
                                                        <input
                                                            type="datetime-local"
                                                            className="w-full p-2 rounded-l h-9"
                                                            placeholder="Enter start date "
                                                            value={startDateTime}
                                                            onChange={(e) => setStartDateTime(e.target.value)}
                                                        />
                                                    </div>
                                                    <p className='px-4 '>to</p>
                                                    <div className="w-full">
                                                        <label>End Date & Time</label>
                                                        <input
                                                            type="datetime-local"
                                                            className="w-full p-2 rounded-l h-9"
                                                            placeholder="Enter end date "
                                                            value={endDateTime}
                                                            onChange={(e) => setEndDateTime(e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className='flex flex-col space-y-4 lg:flex-row lg:space-x-4 lg:space-y-0'>

                                            <div className="flex flex-col w-full lg:w-1/2">
                                                <label>Description</label>
                                                <textarea
                                                    rows={5}
                                                    className="p-2 text-gray-600 rounded"
                                                    placeholder="Description "
                                                    value={eventDescription}
                                                    onChange={(e) => setEventDescription(e.target.value)}
                                                />
                                            </div>
                                            <div className='flex flex-col w-full space-y-4 lg:w-1/2'>
                                                <div className="flex flex-col items-center justify-between w-full space-y-4 sm:space-y-0 sm:flex-row">
                                                    <div className='w-full'>
                                                        <label>Registration Start Date & Time</label>
                                                        <input
                                                            type="datetime-local"
                                                            className="w-full p-2 rounded-l h-9"
                                                            placeholder="Enter registration start date "
                                                            value={registrationStartDateTime}
                                                            onChange={(e) => {
                                                                setRegistrationStartDateTime(e.target.value)
                                                                // setRegistrationEndDate(e.target.value)
                                                            }}
                                                        />
                                                    </div>
                                                    <p className='px-4 '>to</p>
                                                    <div className="w-full">
                                                        <label>Registration End Date & Time</label>
                                                        <input
                                                            type="datetime-local"
                                                            className="w-full p-2 rounded-l h-9"
                                                            placeholder="Enter registration end date "
                                                            value={registrationEndDateTime}
                                                            onChange={(e) => setRegistrationEndDateTime(e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                                <div className='flex flex-col items-center justify-between space-x-0 space-y-4 sm:space-x-4 sm:space-y-0 sm:flex-row'>
                                                    <div className="w-full">
                                                        <label>Max Attempts per Challenges</label>
                                                        <input
                                                            className="w-full p-2 text-gray-600 rounded h-9"
                                                            placeholder="Enter number of attempts"
                                                            value={maxAttempts}
                                                            type='number'
                                                            min={1}
                                                            onChange={(e) => setMaxAttempts(e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="w-full">
                                                        <label className="mb-1 font-medium text-gray-700">Upload Image</label>
                                                        <input
                                                            className="w-full p-1 text-gray-600 bg-white border-gray-300 rounded "
                                                            type="file"
                                                            accept=".png,.jpg"

                                                            onChange={(e) => {
                                                                const file = e.target.files[0];
                                                                if (file) {
                                                                    const validTypes = ['image/jpeg', 'image/png'];
                                                                    if (!validTypes.includes(file.type)) {
                                                                        toast.error("Only JPG or PNG image files are allowed.");
                                                                        e.target.value = null;
                                                                        return;
                                                                    }
                                                                    setEventImage(file);
                                                                }
                                                            }}
                                                        />
                                                    </div>
                                                </div>

                                            </div>

                                        </div>
                                        <div className='flex space-x-1 text-gray-600 '>
                                            <input
                                                type="checkbox"
                                                checked={allowTeamCreation}
                                                onChange={(e) => setAllowTeamCreation(e.target.checked)}
                                            />
                                            <p>Allow Team Creation</p>
                                        </div>
                                        <button
                                            className="p-1 text-white rounded bg-slate-700 w-28 h-9" type="submit"
                                            disabled={loadingSubmitEvent}
                                        >
                                            {loadingSubmitEvent ? <BeatLoader size={15} color={"#fff"} /> : "Add"}
                                        </button>
                                    </form>
                                </div>
                            </div>) : (<div className={`flex items-center justify-center md:justify-end w-full px-4`}>
                                <button className='flex items-center justify-center px-2 py-1 text-sm text-white rounded cursor-pointer font-Lexend_Medium bg-slate-800'
                                    onClick={() => { setWantAddEvent(!wantAddEvent) }}
                                >
                                    <FaPlusCircle className='mr-1' size={18} /><p className=''>Add Event </p>

                                </button>
                            </div>)}

                        <div className="p-3 m-4 overflow-auto border rounded-lg">
                            <div className='flex items-center justify-end space-x-2 font-Lexend_Regular'>
                                <div className='flex items-center space-x-1'>
                                    <p className='w-2 h-4 bg-green-500 border'></p>
                                    <p>Live Events</p>
                                </div>

                                <div className='flex items-center space-x-1'>
                                    <p className='w-2 h-4 bg-blue-500 border '></p>
                                    <p>Upcoming Events</p>
                                </div>
                                <div className='flex items-center space-x-1 '>
                                    <p className='w-2 h-4 bg-orange-600 border '></p>
                                    <p>Past Events</p>
                                </div>
                            </div>
                            <div className="flex flex-col gap-4 py-3 lg:flex-row font-Lexend_Regular">
                                {/* Left spacer */}
                                <div className="hidden w-full lg:block lg:w-auto" />

                                {/* Date Filter Section */}
                                <div className="flex flex-col items-center justify-center w-full gap-2 md:flex-row">
                                    <div className="flex flex-col w-full gap-2 sm:flex-row sm:w-auto">
                                        <label className='block sm:hidden'>Select start date & time</label>
                                        <input
                                            type="datetime-local"
                                            value={filterStartDate}
                                            onChange={(e) => setFilterStartDate(e.target.value)}
                                            className="w-full p-2 border rounded sm:w-auto"
                                        />
                                        <label className='block sm:hidden'>Select end date & time</label>
                                        <input
                                            type="datetime-local"
                                            value={filterEndDate}
                                            onChange={(e) => setFilterEndDate(e.target.value)}
                                            className="w-full p-2 border rounded sm:w-auto"
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleFilter}
                                            className="w-full px-4 text-white bg-blue-600 rounded hover:bg-blue-700 sm:w-auto"
                                        >
                                            Apply Filter
                                        </button>
                                        <button
                                            onClick={handleClear}
                                            className="flex items-center justify-center w-full h-10 px-4 text-white rounded bg-slate-800 hover:bg-slate-700 sm:w-auto"
                                        >
                                            <PiFunnelX size={24} title="Clear Filter" />
                                        </button>
                                    </div>
                                </div>

                                {/* Search & Rows Per Page (shown in row only in sm and up) */}
                                <div className="flex items-center justify-center w-full gap-2 lg:w-auto">
                                    <input
                                        type="text"
                                        value={searchKey}
                                        onChange={(e) => setSearchKey(e.target.value)}
                                        placeholder="Search..."
                                        className="w-4/5 p-2 border border-gray-300 rounded sm:w-auto"
                                    />
                                    <select
                                        value={rowsPerPage}
                                        onChange={(e) => {
                                            setRowsPerPage(Number(e.target.value));
                                            setCurrentPage(1);
                                        }}
                                        className="w-1/5 p-2 border border-gray-300 rounded sm:w-auto"
                                    >
                                        {[10, 20, 50, 100].map((num) => (
                                            <option key={num} value={num}>
                                                {num}
                                            </option>
                                        ))}
                                    </select>
                                </div>


                            </div>

                            <EventTableData
                                events={events}
                                eventImages={eventImages}
                                sortBy={sortBy}
                                sortDirection={sortDirection}
                                setSortBy={setSortBy}
                                setSortDirection={setSortDirection}
                                handleSort={handleSort}
                                currentPage={currentPage}
                                setCurrentPage={setCurrentPage}
                                rowsPerPage={rowsPerPage}
                                formatEventDate={formatEventDate}
                                isPast={isPast}
                                isUpcoming={isUpcoming}
                                handleImageClick={handleImageClick}
                                onUpdate={handleUpdate}
                                onDelete={handleDelete}
                                onAssignChallenges={handleAssignChallenges}
                                isLoading={tableLoading}
                            />
                            {events.totalPages > 0 &&
                                <Pagination
                                    totalItems={events.totalElements}
                                    totalPages={events.totalPages}
                                    currentPage={currentPage}
                                    handlePrevious={handlePrevious}
                                    handleNext={handleNext}
                                    itemsPerPage={rowsPerPage}
                                    setCurrentPage={setCurrentPage}
                                />
                            }
                        </div>
                        {wantEditImage && (
                            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                                <div className="relative max-w-lg p-4 space-y-4 bg-white rounded-lg shadow-lg font-Lexend_Regular">
                                    <button
                                        className="absolute text-gray-600 top-2 right-2 hover:text-gray-900"
                                        onClick={() => setWantEditImage(false)}
                                    >
                                        <IoClose size={24} />
                                    </button>
                                    <div className='font-Lexend_SemiBold'>
                                        <p className='text-gray-500'>Event</p>
                                        <p className='pt-1 font-Lexend_SemiBold'>{selectedEvent.name}</p>
                                    </div>

                                    <div className='flex items-center justify-center'>
                                        <img src={selectedImage} alt="Preview" className="max-w-full border rounded-lg max-h-48 " />
                                    </div>
                                    <input
                                        type="file"
                                        accept=".jpg, .jpeg, .png"
                                        ref={fileInputRef}
                                        className="hidden"
                                        onChange={handleFileChange}
                                    />

                                    <div className="flex justify-between w-full space-x-2">
                                        <button
                                            className="px-4 py-2 text-white bg-gray-800 rounded hover:bg-gray-900"
                                            onClick={handleChangeImage}
                                            disabled={uploading}
                                        >
                                            {uploading ? "Uploading..." : "Change Image"}
                                        </button>
                                        <button
                                            className="px-4 py-2 text-white bg-red-500 rounded hover:bg-red-600"
                                            onClick={() => setWantEditImage(false)}
                                        >
                                            Close
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                        {showEventDeleteModal && (
                            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 font-Lexend_Regular">

                                <div className="text-center bg-white rounded shadow-lg">
                                    <p className="flex justify-end p-1"><IoCloseSharp size={20} onClick={() => setShowEventDeleteModal(false)} className="hover:text-slate-600" /></p>
                                    <div className="p-6">
                                        <div className="flex items-center justify-center text-red-600 "><AiOutlineCloseCircle size={50} /></div>
                                        <h2 className="mb-4 text-lg font-semibold">Are you sure?</h2>
                                        <p>Do you really want to delete this Event?</p>
                                        <strong>{selectedForDeleteEventName}</strong>
                                        <div className="flex justify-center mt-6 space-x-4">
                                            <button
                                                className="px-4 py-2 text-white bg-red-600 rounded"
                                                onClick={() => handleDeleteEvent()}
                                                disabled={loadingDeleteEvent}
                                            >
                                                {loadingDeleteEvent ? <BeatLoader size={15} color={"#fff"} /> : "Delete"}
                                            </button>
                                            <button
                                                className="px-4 py-2 text-gray-700 bg-gray-300 rounded"
                                                onClick={() => setShowEventDeleteModal(false)}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        )}

                        {showEventUpdateModal && (
                            <div className="fixed inset-0 flex items-center justify-center px-4 bg-black bg-opacity-50">
                                <div className="w-full max-w-3xl p-6 bg-gray-100 rounded shadow-lg max-h-[80vh] font-Lexend_Regular overflow-auto">
                                    <h2 className="text-lg font-semibold text-center">Update</h2>
                                    <div>
                                        <form className="mt-5 space-y-4" onSubmit={handleEventSubmit}>
                                            <div className="flex flex-col">
                                                <label>Name</label>
                                                <input
                                                    className="p-2 text-gray-600 rounded h-9"
                                                    placeholder="Enter event name"
                                                    value={updateEventName}
                                                    onChange={(e) => setUpdateEventName(e.target.value)}
                                                />
                                            </div>
                                            <div className="flex flex-col justify-between space-y-4 md:flex-row md:space-y-0 md:space-x-4">
                                                <div className="flex-1">
                                                    <label>Start Date & Time</label>
                                                    <div className="flex space-x-2">
                                                        <input
                                                            type="datetime-local"
                                                            className="w-full p-2 rounded h-9"
                                                            placeholder="Enter start date"
                                                            value={updateStartDateTime}
                                                            onChange={(e) => {
                                                                setUpdateStartDateTime(e.target.value);

                                                            }}
                                                        />

                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-center">
                                                    <p>to</p>
                                                </div>
                                                <div className="flex-1">
                                                    <label>End Date & Time</label>
                                                    <div className="flex space-x-2">
                                                        <input
                                                            type="datetime-local"
                                                            className="w-full p-2 rounded h-9"
                                                            placeholder="Enter end date"
                                                            value={updateEndDateTime}
                                                            onChange={(e) => setUpdateEndDateTime(e.target.value)}
                                                        />

                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex flex-col">
                                                <label>Description</label>
                                                <textarea
                                                    rows={3}
                                                    className="p-2 text-gray-600 rounded"
                                                    placeholder="Enter description"
                                                    value={updateEventDescription}
                                                    onChange={(e) => setUpdateEventDescription(e.target.value)}
                                                />
                                            </div>
                                            <div className="flex flex-col items-center justify-between w-full sm:flex-row ">
                                                <div className=''>
                                                    <label>Registration Start Date & Time</label>
                                                    <input
                                                        type="datetime-local"
                                                        className="w-full p-2 rounded h-9"
                                                        placeholder="Enter registration start date "
                                                        value={updateRegistrationStartDateTime}
                                                        onChange={(e) => {
                                                            setUpdateRegistrationStartDateTime(e.target.value)
                                                            // setRegistrationEndDate(e.target.value)
                                                        }}
                                                    />
                                                </div>
                                                <p className='px-4 mt-4'>to</p>
                                                <div className="">
                                                    <label>Registration End Date & Time</label>
                                                    <input
                                                        type="datetime-local"
                                                        className="w-full p-2 rounded h-9"
                                                        placeholder="Enter registration end date "
                                                        value={updateRegistrationEndDateTime}
                                                        onChange={(e) => setUpdateRegistrationEndDateTime(e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex flex-col justify-between space-y-4 md:flex-row md:space-y-0 md:space-x-4">

                                                <div className="flex flex-col flex-1">
                                                    <label>Max Attempts per Challenges</label>
                                                    <input
                                                        className="w-full p-2 text-gray-600 rounded h-9"
                                                        placeholder="Enter max attempt"
                                                        type='number'
                                                        min={1}
                                                        value={updateMaxAttempt}
                                                        onChange={(e) => setUpdateMaxAttempt(e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        </form>
                                    </div>
                                    <div className="flex items-center pt-2 space-x-1 text-gray-600">
                                        <input
                                            type="checkbox"
                                            checked={allowUpdateTeamCreation}
                                            onChange={(e) => setUpdateAllowTeamCreation(e.target.checked)}
                                        />
                                        <p>Allow Team Creation</p>
                                    </div>
                                    <div className="flex justify-center mt-4 space-x-4">
                                        <button
                                            className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
                                            onClick={() => handleUpdateEvent()}
                                            disabled={loadingUpdateEvent}
                                        >
                                            {loadingUpdateEvent ? <BeatLoader size={15} color={"#fff"} /> : "Update"}
                                        </button>
                                        <button
                                            className="px-4 py-2 text-gray-700 bg-gray-300 rounded hover:bg-gray-400"
                                            onClick={() => setShowEventUpdateModal(false)}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>

                </div>
            </div>

        </div >

    )
}




export default AdminEvents
