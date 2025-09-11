import { useEffect, useState, useRef } from "react";
import { FaUser } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
const EventDetailsModal = ({ selectedEvent, isOpen, onClose, handleJoin, eventType, userDetails, eventImages, joinedEventId, handleRegisterEventsAfterLive, liveEvents }) => {
    const modalRef = useRef();
    const navigate = useNavigate()
    const [event, setEvent] = useState(selectedEvent)
    
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen, onClose]);

    useEffect(() => {
        if (!selectedEvent || !liveEvents?.content) return;
       
        if (eventType === "Live Event" && liveEvents?.totalElements > 0) {
            const updated = liveEvents.content.find(e => e.id === selectedEvent.id);
            setEvent(updated );
        }else{
            setEvent(selectedEvent)
        }
        
    }, [selectedEvent, liveEvents]);

    if (!isOpen || !event) return null;
    // Do not render if modal is closed or event is null

    const formatTimeRange = (start, end) => {
        const options = {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            hour12: true,
        };

        const startDate = new Date(start);
        const endDate = new Date(end);

        const sameDay =
            startDate.getFullYear() === endDate.getFullYear() &&
            startDate.getMonth() === endDate.getMonth() &&
            startDate.getDate() === endDate.getDate();

        const formattedStart = startDate.toLocaleString('en-US', options);
        const formattedEnd = endDate.toLocaleString('en-US', options);

        if (sameDay) {
            const datePart = startDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            });
            const startTime = startDate.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: 'numeric',
                hour12: true,
            });
            const endTime = endDate.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: 'numeric',
                hour12: true,
            });
            return `${datePart}, ${startTime} to ${endTime}`;
        }

        return `${formattedStart} to ${formattedEnd}`;
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center text-sm bg-black bg-opacity-50 ">
            <div
                ref={modalRef}
                className="flex flex-col w-11/12 sm:w-3/4 md:w-1/2 lg:w-1/2 xl:w-1/3 2xl:w-1/4 font-Lexend_Regular text-sm bg-white rounded-lg shadow-lg overflow-hidden max-h-[90vh]  animate-modal-fade-in"
            >      {/* Header */}
                <div className="flex items-center justify-end p-2">
                    <button
                        onClick={onClose}
                        className="px-2 py-1 text-gray-900 hover:text-gray-800 focus:outline-none"
                    >
                        ✕
                    </button>
                </div>

                {/* Content */}
                <div className="px-4 pb-4 overflow-auto">
                    <div className="flex justify-center pb-6">
                        <img
                            src={eventImages || '/ctf_logo.png'}
                            alt={`${event.name} Logo`}
                            className="object-cover h-48 rounded"
                        />
                    </div>

                    <div className="text-center bg-white ">
                        <h3 className="font-Lexend_SemiBold">{event.name} </h3>
                        <p className="pb-2 text-center">{event.description || "No description provided."}</p>
                        {event.teamCreationAllowed ? <span className="px-2 my-2 text-white bg-green-500 rounded">Team Event</span> : <span className="px-2 my-2 text-white bg-blue-500 rounded">Solo Event</span>}
                        <p className="mt-2 text-xs">Registration Duration</p>
                        <p className="text-sm">{formatTimeRange(event.registrationStartDateTime, event.registrationEndDateTime)}</p>
                        <p className="mt-2 text-xs">Starts on</p>
                        <p className="text-sm">{formatTimeRange(event.startDateTime, event.endDateTime)}</p>

                    </div>
                    {/* Stats */}
                    <div className="flex items-center justify-center pt-4 space-x-2 text-gray-400">
                        {event.live && (
                            <div className="flex flex-col items-center px-4 py-2 text-gray-900 bg-green-300 border rounded-lg shadow-inner font-Lexend_SemiBold bg-gradient-to-b from-white/5 to-transparent">
                                <div className="flex items-center space-x-2">
                                    <FaUser size={16} />
                                    <span>{event.currentUsers?.length}</span>
                                </div>
                                <p>Live Users</p>
                            </div>
                        )}
                        <div className="flex flex-col items-center px-4 py-2 text-gray-900 bg-blue-300 border rounded-lg shadow-inner font-Lexend_SemiBold bg-gradient-to-b from-white/5 to-transparent">
                            <div className="flex items-center space-x-2">
                                <FaUser size={16} />
                                <span>{event.users.length}</span>
                            </div>
                            <p>Registered Users</p>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end pt-4 space-x-4">
                        {eventType === "Live Event" && (
                            <div className="flex items-end justify-center">
                                {event.currentUsers?.includes(userDetails?.id) ? (
                                    event.participationAllowed ?
                                        <button
                                            className="px-5 text-white bg-blue-500 border border-blue-500 rounded hover:bg-blue-400 hover:border-blue-400"
                                            onClick={() => navigate("/event-challenges")}
                                        >
                                            Go to Event
                                        </button> : <button
                                            className="px-5 text-white bg-blue-500 border border-blue-500 rounded hover:bg-blue-400 hover:border-blue-400"
                                            onClick={() => navigate("/instruction")}
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

                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventDetailsModal;
