import { useEffect, useRef } from "react";
import { FaUser } from "react-icons/fa";

const EventDetailsModal = ({ event, eventImages, isOpen, onClose, handleGoLiveEvents, eventType }) => {
    const modalRef = useRef();

    // Close modal when clicking outside
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
        <div className="fixed inset-0 z-50 flex items-center justify-center text-sm bg-black bg-opacity-50">
            <div ref={modalRef} className="flex flex-col w-11/12 sm:w-3/4 md:w-1/2 lg:w-1/2 xl:w-1/3 2xl:w-1/4 font-Lexend_Regular text-sm bg-white rounded-lg shadow-lg overflow-hidden max-h-[90vh] animate-modal-fade-in">
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
                    <div className="flex flex-col items-center space-y-2">
                        <p className="text-2xl text-center font-Lexend_SemiBold">{event.name}</p>
                        <p className="text-center">{event.description || "No description provided."}</p>
                         {event.teamCreationAllowed ? <span className="px-2 my-2 text-white bg-green-500 rounded">Team Event</span> : <span className="px-2 my-2 text-white bg-blue-500 rounded">Solo Event</span>}
                        <p className="mt-2 text-xs">Registration Duration</p>
                        <p className="text-sm">{formatTimeRange(event.registrationStartDateTime, event.registrationEndDateTime)}</p>
                        <p className="mt-2 text-xs">Starts on</p>
                        <p className="text-sm">{formatTimeRange(event.startDateTime, event.endDateTime)}</p>
                       
                    </div>
                    
                    <div className="flex items-center justify-center pt-4 space-x-2">
                        <div className="flex flex-col items-center px-4 py-2 text-gray-900 bg-green-300 border rounded-lg shadow-inner font-Lexend_SemiBold bg-gradient-to-b from-white/5 to-transparent">
                            <div className="flex items-center space-x-2 ">
                                <FaUser size={16} />
                                <span>{event.currentUsers} </span>
                            </div>
                            <p>Live Users</p>
                        </div>
                        <div className="flex flex-col items-center px-4 py-2 text-gray-900 bg-blue-300 border rounded-lg shadow-inner font-Lexend_SemiBold bg-gradient-to-b from-white/5 to-transparent">
                            <div className="flex items-center space-x-2">
                                <FaUser size={16} />
                                <span>{event.users}</span>
                            </div>
                            <p>Registered Users</p>
                        </div>

                    </div>
                </div>
                <div className="flex justify-end px-4 py-4 space-x-4 pb-">
                    {/* <button
                        className="px-4 py-2 text-white bg-red-500 rounded hover:bg-red-600"
                        onClick={onClose}
                    >
                        Close
                    </button> */}
                    {eventType === "Today's Event" ? (
                        <button
                            className="flex items-center px-5 py-1 text-white bg-blue-600 border border-blue-500 rounded hover:bg-blue-400"
                            onClick={() => {
                                handleGoLiveEvents(event.id)
                                onClose()
                            }}
                        >
                            Go Live
                        </button>
                    ) : (<></>)}
                </div>
            </div>
        </div>
    );
};

export default EventDetailsModal;
