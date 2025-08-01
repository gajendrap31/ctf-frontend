import React, { useState, useEffect, useMemo, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { url } from "../Authentication/Utility";
import { FaLongArrowAltLeft } from "react-icons/fa";
import AuthService from "../Authentication/AuthService";
import { ProfileContext } from "../Context API/ProfileContext";
import Select from "react-select";
import { TeamTableData } from "./Tables/TeamsTable";
import Pagination from "./Tables/Pagination";
function Teams() {
    const [openSidebar, setOpenSidebar] = useState(true);
    const [userActivity, setUserActivity] = useState(null)
    const { userDetails } = useContext(ProfileContext)
    const [registeredEvents, setRegisteredEvents] = useState([])
    const [selectedEvent, setSelectedEvent] = useState()
    const [selectedEventData, setSelectedEventData] = useState({})
    const [currentEventData, setCurrentEventData] = useState({});
    const [currentEventLoaded, setCurrentEventLoaded] = useState(false);
    const [teamData, setTeamData] = useState([]);
    const [teamRequestData, setTeamRequestData] = useState([])
    const [teamInvitationData, setTeamInvitationData] = useState([])
    const [serverTime, setServerTime] = useState()
    const [startTimeLeft, setStartTimeLeft] = useState(0)
    const [endTimeLeft, setEndTimeLeft] = useState(0)

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [teamMemberData, setTeamMemberData] = useState([])
    const [myTeamStatus, setMyTeamStatus] = useState(false)

    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchKey, setSearchKey] = useState("");
    const [sortBy, setSortBy] = useState(0);
    const [sortDirection, setSortDirection] = useState('ASC');

    const [tableLoading, setTableLoading] = useState(false)

    const navigate = useNavigate();
    const token = useMemo(() => localStorage.getItem("Token"), []);

    const axiosInstance = axios.create({
        baseURL: url,
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        withCredentials: true,
    });

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1280) {
                setOpenSidebar(true);
            } else {
                setOpenSidebar(false);
            }
        };

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

    const fetchCurrentEventDetails = async () => {
        try {
            const res = await axiosInstance.get(`/user/event/current`);
            if (res.data?.id) {
                setCurrentEventData(res.data);
            }
            setTeamData([]);
        } catch (error) {

        } finally {
            setCurrentEventLoaded(true)
        }
    };


    const fetchTeamData = async (eventId) => {
        if (!eventId) return;

        try {
            setTableLoading(true);

            const page = Math.max(currentPage - 1, 0);

            const params = {
                page,
                size: rowsPerPage,
                sortBy,
                direction: sortDirection,
                searchTerm: searchKey,
            };

            const response = await axiosInstance.get(`/user/event/${eventId}/team`, { params });

            setTeamData(response.data);
        } catch (error) {

            setTeamData([]);
        } finally {
            setTableLoading(false);
        }
    };


    const fetchTeamRequestData = async () => {
        if (!(currentEventData?.teamCreationAllowed)) return
        try {
            const response = await axiosInstance.get(`/user/team/requests`);

            setTeamRequestData(response.data);
        } catch (error) {

        }
    };
    const fetchTeamInvitationData = async () => {
        if (!(currentEventData?.teamCreationAllowed)) return
        try {
            const response = await axiosInstance.get(`/user/team/invitations`);
            setTeamInvitationData(response.data);
        } catch (error) {

        }
    };

    const fetchMyTeamStatus = async () => {
        if (!(currentEventData?.teamCreationAllowed)) return
        try {
            const res = await axiosInstance.get(`/user/team/exists`);
            setMyTeamStatus(res.data);
        } catch (error) {
            toast.error("Failed to fetch user details");
        }
    };

    useEffect(() => {
        fetchCurrentEventDetails();
    }, []);

    useEffect(() => {
        if (currentEventData?.teamCreationAllowed) {
            fetchTeamInvitationData();
            fetchTeamRequestData();
            fetchMyTeamStatus();
        }
    }, [currentEventData]);


    useEffect(() => {
        const eventId = selectedEventData?.id || currentEventData?.id;
        const isTeamCreationAllowed =
            selectedEventData?.teamCreationAllowed || currentEventData?.teamCreationAllowed;

        if (eventId && isTeamCreationAllowed) {
            fetchTeamData(eventId);
        }
    }, [selectedEvent, selectedEventData, currentEventData, currentPage, rowsPerPage, sortBy, sortDirection, searchKey]);

    useEffect(() => {
        if (!selectedEvent) return;

        const data = registeredEvents.find((item) => String(item.id) === String(selectedEvent));
        setSelectedEventData(data || null);
        setTeamData([]);
    }, [selectedEvent, registeredEvents]);


    const handleMembersClick = (members) => {
        setTeamMemberData(members)
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleRequest = async (id) => {
        try {
            const res = await axiosInstance.post(`user/team/${id}/request`)
            toast.success(res.data)
            fetchTeamInvitationData()
            fetchTeamRequestData()
            fetchMyTeamStatus()
        } catch (error) {
            toast.error(error.response.data)
        }

    }

    const handleAcceptInvitation = async (Id) => {
        try {
            const res = await axiosInstance.post(`/user/team/${Id}/invite/accept`)
            toast.success(res.data)
            if (currentEventData?.id) {
                fetchTeamData(currentEventData.id)
            }
            fetchTeamInvitationData();
            fetchTeamRequestData();
            fetchMyTeamStatus();
            setCurrentPage(1);
        } catch (error) {
            toast.error(error.response.data)
        }
    };
    const handleDeleteInvitation = async (teamId) => {
        try {
            const Invitation = teamInvitationData.find(
                (invitation) => invitation.user?.id === userDetails.id && invitation.team.id === teamId
            );

            const res = await axiosInstance.delete(`/user/teamInvitation/${Invitation.id}/invite`)
            toast.success(res.data)
            if (currentEventData?.id) {
                fetchTeamData(currentEventData.id)
            }
            fetchTeamInvitationData()
            fetchTeamRequestData()
            fetchMyTeamStatus()
        } catch (error) {
            toast.error(error.response.data)
        }
    };
    const handleRejectRequest = async (teamId) => {
        try {
            const Request = teamRequestData.find(
                (request) => request.user?.id === userDetails.id && request.team.id === teamId
            );
            const res = await axiosInstance.delete(`/user/teamInvitation/${Request.id}/request`)
            toast.success(res.data)
            fetchTeamInvitationData()
            fetchTeamRequestData()
            fetchMyTeamStatus()
        } catch (error) {
            toast.error(error.response.data)
        }
    };

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



    const fetchRegisteredEvents = async () => {
        try {
            const response = await axiosInstance.get('/user/event/registered');
            setRegisteredEvents(response.data);
        } catch (error) {
            toast.error(`${error.response?.data || "An error occurred while fetching events"}`)

        }
    };

    useEffect(() => {
        if (currentEventLoaded && Object.keys(currentEventData).length === 0) {
            fetchRegisteredEvents();
        }
    }, [currentEventLoaded, currentEventData]);


    const handlePrevious = () => {
        if (currentPage > 0) setCurrentPage((prev) => prev - 1);
    };

    const handleNext = () => {
        if (currentPage < teamData.totalPages) setCurrentPage((prev) => prev + 1);
    };

    useEffect(() => {
        setCurrentPage(1);
    }, [searchKey]);

    const handleSort = (columnIndex) => {
        setCurrentPage(1)
        if (sortBy === columnIndex) {
            setSortDirection(prev => (prev === 'ASC' ? 'DESC' : 'ASC'));
        } else {
            setSortBy(columnIndex);
            setSortDirection('ASC');
        }
    };

    useEffect(() => {
        if (!userActivity) return;
        if (userActivity.message?.includes("has requested to join your team.")) {
            fetchTeamData();
        }
        if (userActivity.message?.includes("You are invited to join the team") || userActivity.message?.includes(" has been deleted by the Captain.")) {
            fetchTeamInvitationData();
        }
        if (userActivity.message?.includes("You have been removed from the team")) {
            if (currentEventData?.id) {
                fetchTeamData(currentEventData.id)
            }
        }

        if (userActivity.message?.includes("Your request to join the team") && userActivity.message?.includes("has been rejected by the captain.")) {
            if (currentEventData?.id) {
                fetchTeamData(currentEventData.id)
            }
            fetchTeamRequestData()
        }

        if (userActivity.message?.includes("Your request to join the team") && userActivity.message?.includes("has been accepted by the captain.")) {
            if (currentEventData?.id) {
                fetchTeamData(currentEventData.id)
            }
            fetchTeamRequestData()
        }
    }, [userActivity]);

    const eventSelectOptions = registeredEvents.map(event => ({
        value: event.id,
        label: event.name,
        color: event.live ? "#10B981" : event.teamCreationAllowed ? "#374151" : "#9CA3AF",
    }));

    return (
        <div className="overflow-hidden">
            <Sidebar value={openSidebar} setValue={setOpenSidebar} />

            <div className="flex flex-col w-full overflow-hidden text-sm">
                <Navbar value={openSidebar} setValue={setOpenSidebar} setUserActivity={setUserActivity} />
                <ToastContainer />
                <div className={`text-gray-900  min-h-[600px] overflow-auto  space-y-8   w-full ${openSidebar ? 'pl-0 lg:pl-72' : ''} `} >
                    <div className="space-y-4 p-">
                        {currentEventData?.name && (
                            <div className="px-4 bg-white rounded-md font-Lexend_Regular">
                                {/* Top Row: Back Button + Timer */}
                                <div className="flex flex-col items-center justify-between sm:flex-row ">
                                    <div>
                                        {currentEventData?.participationAllowed ? (
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
                                        {currentEventData?.name || "Event Team"}
                                    </h1>
                                    <span className="hidden w-20 border-t-2 border-gray-300 sm:block"></span>
                                </div>
                            </div>
                        )}

                        <div className="flex items-center justify-center p-3 py-2 m-4 bg-gray-100 rounded">
                            <p className="px-8 py-1 text-2xl text-gray-800 rounded font-Lexend_Bold"> Teams </p>
                        </div>
                        <div className="p-3 m-4 border rounded-lg font-Lexend_Regular">

                            {currentEventData?.teamCreationAllowed &&
                                !myTeamStatus && <button
                                    className="px-2 py-1 text-white bg-gray-800 rounded"
                                    onClick={() => {
                                        navigate("/Myteams");
                                    }}
                                >
                                    Create your own team
                                </button>}

                            <div className={`flex flex-col md:flex-row ${!currentEventData?.name ? 'justify-between' : 'justify-end'} items-center gap-4 mt-4 font-Lexend_Regular`}>

                                {!currentEventData?.name && <div className="flex flex-col items-center gap-2 sm:flex-row">
                                    <label htmlFor="event-select" className="font-Lexend_SemiBold">Select Event</label>

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
                                {(currentEventData?.teamCreationAllowed || selectedEventData?.teamCreationAllowed) && (<div className="flex flex-wrap items-center gap-2">
                                    <input
                                        type="text"
                                        value={searchKey}
                                        onChange={(e) => {
                                            setSearchKey(e.target.value)

                                        }}
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
                                </div>)}
                            </div>
                            <TeamTableData
                                teams={teamData}
                                currentPage={currentPage}
                                setCurrentPage={setCurrentPage}
                                rowsPerPage={rowsPerPage}
                                sortBy={sortBy}
                                sortDirection={sortDirection}
                                setSortBy={setSortBy}
                                setSortDirection={setSortDirection}
                                handleSort={handleSort}
                                handleMembersClick={handleMembersClick}
                                selectedEventData={selectedEventData}
                                currentEventData={currentEventData}
                                userDetails={userDetails}
                                teamRequestData={teamRequestData}
                                teamInvitationData={teamInvitationData}
                                handleRequest={handleRequest}
                                handleRejectRequest={handleRejectRequest}
                                handleAcceptInvitation={handleAcceptInvitation}
                                handleDeleteInvitation={handleDeleteInvitation}
                                isLoading={tableLoading}
                            />

                            {teamData.totalPages > 0 && (
                                <Pagination
                                    totalItems={teamData.totalElements}
                                    totalPages={teamData.totalPages}
                                    currentPage={currentPage}
                                    handlePrevious={handlePrevious}
                                    handleNext={handleNext}
                                    itemsPerPage={rowsPerPage}
                                    setCurrentPage={setCurrentPage}
                                />
                            )}
                            <TeamMembersModal
                                isOpen={isModalOpen}
                                onClose={handleCloseModal}
                                teamId={teamData.id}
                                teamMemberData={teamMemberData}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

const TeamMembersModal = ({ isOpen, onClose, teamMemberData }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-modal-fade-in mx-4">
                <h2 className="mb-4 text-xl font-semibold">Team Member Details</h2>

                {teamMemberData.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {teamMemberData.map((member, index) => (
                            <div
                                key={index}
                                className={`border rounded-lg p-4 bg-white shadow-sm space-y-1 ${member.captain ? 'border-gray-500' : 'border-gray-300'}`}

                            >
                                <div className="flex items-center justify-between gap-2">
                                    <span className="font-semibold"># {index + 1}</span>

                                    {member.captain && (
                                        <>
                                            <p className="px-2 text-white bg-gray-500 rounded font-Lexend_SemiBold">Captain</p>
                                            {/* <GiCaptainHatProfile title="Captain" className="text-xl" /> */}
                                        </>
                                    )}
                                </div>
                                <div title="Name">
                                    {member.user.fullName}
                                </div>
                                <div title="Email">
                                    {member.user.email}
                                </div>

                                <div title={member.user.level}>
                                    {member.user.levelInfo}
                                </div>
                                <div title="Organisation">
                                    {member.user.organisation.name}, {member.user.organisation.place}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-gray-500">No users available.</p>
                )}

                <div className="flex justify-end mt-4">
                    <button
                        type="button"
                        className="px-4 py-2 text-gray-700 bg-gray-300 rounded"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

// const TeamMembersModal = ({ isOpen, onClose, teamId, teamMemberData }) => {

//     if (!isOpen) return null;

//     return (
//         <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
//             <div className="w-full max-w-4xl p-8 bg-white rounded-lg shadow-lg ">
//                 <h2 className="mb-4 text-xl font-semibold">Team Member Details</h2>
//                 <div className="p-2 overflow-auto border rounded">
//                     <table className="w-full bg-white rounded">
//                         <thead>
//                             <tr className="h-10 border-b-2 rounded-t bg-slate-100">
//                                 <th className="rounded-tl text-start ps-3">S.No.</th>
//                                 <th className="text-start ps-3">Name</th>
//                                 <th className="text-start ps-3">Email</th>
//                                 <th className="text-start ps-3">Level</th>
//                                 <th className="rounded-tr text-start ps-3">Level Info</th>
//                             </tr>
//                         </thead>
//                         <tbody>
//                             {teamMemberData.length > 0 ? (
//                                 teamMemberData.map((member, index) => (
//                                     <tr key={index} className="border-b-2 h-9 ">
//                                         <td className="flex items-center ps-3">{member.captain && <GiCaptainHatProfile data-tooltip-id="captain" data-tooltip-content="Captain" />}{index + 1}</td>
//                                         <td className="ps-3">{member.user.fullName}</td>
//                                         <td className="ps-3">{member.user.email}</td>
//                                         <td className="ps-3">{member.user.level}</td>
//                                         <td className="ps-3">{member.user.levelInfo} ({member.user.organisation.name},{member.user.organisation.place})</td>


//                                     </tr>
//                                 ))
//                             ) : (
//                                 <tr>
//                                     <td colSpan="7" className="text-center text-gray-500">
//                                         No users available.
//                                     </td>
//                                 </tr>
//                             )}
//                         </tbody>
//                     </table>
//                 </div>
//                 <div className="flex justify-end p-2">
//                     <button
//                         type="button"
//                         className="px-4 py-2 text-gray-700 bg-gray-300 rounded"
//                         onClick={onClose}
//                     >
//                         Cancel
//                     </button>

//                 </div>
//                 <Tooltip id="captain" />
//             </div>
//         </div>
//     );
// };

export default Teams