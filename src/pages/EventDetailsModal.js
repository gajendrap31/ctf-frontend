import { useEffect, useRef } from "react";
import { FaUser } from "react-icons/fa";

const EventDetailsModal = ({ event, isOpen, onClose,  eventImages }) => {
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
       <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 text-sm ">
  <div
    ref={modalRef}
    className="flex flex-col w-11/12 sm:w-3/4 md:w-1/2 lg:w-1/2 xl:w-1/3 2xl:w-1/4 font-Lexend_Regular text-sm bg-white rounded-lg shadow-lg overflow-hidden max-h-[90vh]  animate-modal-fade-in"
  >      {/* Header */}
                <div className="flex items-center justify-end p-2">
                    <button
                        onClick={onClose}
                        className="text-gray-900 hover:text-gray-800 focus:outline-none py-1 px-2"
                    >
                        ✕
                    </button>
                </div>

                {/* Content */}
                <div className="overflow-auto px-4 pb-4">
                    <div className="flex justify-center pb-6">
                        <img
                            src={eventImages || '/ctf_logo.png'}
                            alt={`${event.name} Logo`}
                            className="h-48 object-cover rounded"
                        />
                    </div>
                   
                    <div className="text-center bg-white ">
                        <h3 className="font-Lexend_SemiBold">{event.name} </h3>
                        <p className="text-center pb-2">{event.description || "No description provided."}</p>
                        {event.teamCreationAllowed ? <span className="bg-green-500 text-white px-2 rounded my-2">Team Event</span> : <span className="bg-blue-500 text-white px-2 rounded my-2">Solo Event</span>}
                        <p className="text-xs mt-2">Registration Duration</p>
                        <p className="text-sm">{formatTimeRange(event.registrationStartDateTime, event.registrationEndDateTime)}</p>
                        <p className="text-xs mt-2">Starts on</p>
                        <p className="text-sm">{formatTimeRange(event.startDateTime, event.endDateTime)}</p>

                    </div>
                    {/* Stats */}
                    <div className="flex justify-center items-center text-gray-400 space-x-2 pt-4">
                        {event.live && (
                            <div className="flex flex-col items-center border px-4 py-2 rounded-lg shadow-inner text-gray-900 font-Lexend_SemiBold bg-gradient-to-b from-white/5 to-transparent bg-green-300">
                                <div className="flex items-center space-x-2">
                                    <FaUser size={16} />
                                    <span>{event?.currentUsers?.length}</span>
                                </div>
                                <p>Live Users</p>
                            </div>
                        )}
                        <div className="flex flex-col items-center border px-4 py-2 rounded-lg shadow-inner text-gray-900 font-Lexend_SemiBold bg-gradient-to-b from-white/5 to-transparent bg-blue-300">
                            <div className="flex items-center space-x-2">
                                <FaUser size={16} />
                                <span>{event.users?.length}</span>
                            </div>
                            <p>Registered Users</p>
                        </div>
                    </div>

                   
                </div>
            </div>
        </div>
    );
};

export default EventDetailsModal;
