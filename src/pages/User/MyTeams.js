import Sidebar from "./Sidebar"
import Navbar from "./Navbar"
import React, { useState, useContext } from "react";
import axios from "axios";
import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { url } from "../Authentication/Utility";
//import AuthService from "../Authentication/AuthService";
import { GiCaptainHatProfile } from "react-icons/gi";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaLongArrowAltLeft } from "react-icons/fa";
import AuthService from "../Authentication/AuthService";
import { ProfileContext } from "../Context API/ProfileContext";
import { RiCloseLine } from "react-icons/ri";
function MyTeams() {
    const [openSidebar, setOpenSidebar] = useState(true);
    const [userActivity, setUserActivity] = useState(null)
    const { userDetails } = useContext(ProfileContext)
    const [currentEventData, setCurrentEventData] = useState({});
    const [teamName, setTeamName] = useState("")
    const [teamData, setTeamData] = useState([])
    const [serverTime, setServerTime] = useState()
    const [startTimeLeft, setStartTimeLeft] = useState(0)
    const [endTimeLeft, setEndTimeLeft] = useState(0)

    const [teamInvitation, setTeamInvitation] = useState([])
    const [teamRequest, setTeamRequest] = useState([])
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCurrentUserCaptain, setIsCurrentUserCaptain] = useState(false)

    const [loadingTeamSubmit, setLoadingTeamSubmit] = useState(false)
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

    // Handle Sidebar Toggle on Resize
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


    // Fetch Event Details
    const fetchCurrentEventDetails = async () => {
        try {
            const res = await axiosInstance.get(`/user/event/current`);
            setCurrentEventData(res.data);
        } catch (error) {
            //toast.error("Failed to fetch event details");
        }
    };

    const fetchTeam = async () => {
        try {
            const res = await axiosInstance.get('/user/team')
            setTeamData(res.data)
        } catch (error) {
        }
    }

    const fetchTeamInvitation = async (id) => {
        try {
            const res = await axiosInstance.get(`/user/team/${id}/captain/invitations`)
            setTeamInvitation(res.data)
        } catch (error) {
        }
    }
    const fetchTeamRequest = async (id) => {
        try {
            const res = await axiosInstance.get(`/user/team/${id}/captain/requests`)
            setTeamRequest(res.data)
        } catch (error) {
        }
    }

    useEffect(() => {
        fetchCurrentEventDetails();
    }, []);

    useEffect(() => {
        if (currentEventData?.teamCreationAllowed) {
            fetchTeam()
        }
    }, [currentEventData]);

    useEffect(() => {
        if (teamData && teamData.id) {
            fetchTeamInvitation(teamData.id);
            fetchTeamRequest(teamData.id);
        }
        // Ensure `teamData.captain` and `userDetails` are defined before setting state
        if (teamData?.captain && userDetails?.id) {
            setIsCurrentUserCaptain(teamData.captain.id === userDetails.id);
        }
    }, [teamData, userDetails]);


    const handleTeamSubmit = async (event) => {
        try {
            const response = await axiosInstance.post(`/user/event/${event.id}/team`,
                { teamName }
            );
            toast.success(response.data || "Team added successfully!");
            setTeamName("")
            fetchCurrentEventDetails();
            fetchTeam();
        } catch (error) {
            toast.error(error.response?.data || "Failed to create team");
        }
    }

    const handleInviteClick = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        fetchTeam(teamData.id)
        fetchTeamInvitation(teamData.id)
        fetchTeamRequest(teamData.id)
    };

    const handleDeleteMember = async (id, memberId) => {
        try {
            const res = await axiosInstance.delete(`/user/team/${id}/member/${memberId}`)
            toast.success(res.data)
            fetchCurrentEventDetails();
            fetchTeam();
        } catch (error) {
            toast.error(error.response?.data || "Error occurred while deleting team member!")
        }

    }

    const handleDeleteInvitation = async (id) => {
        try {
            const res = await axiosInstance.delete(`/user/teamInvitation/${id}/captain/invite`)
            toast.success(res.data)
            fetchCurrentEventDetails();
            fetchTeam();
        } catch (error) {
            toast.error(error.response?.data)
        }
    }

    const handleRejectRequest = async (id) => {
        try {
            const res = await axiosInstance.delete(`/user/teamInvitation/${id}/captain/request`)
            toast.success(res.data)
            fetchCurrentEventDetails();
            fetchTeam();
        } catch (error) {
            toast.error(error.response?.data)
        }
    }

    const handleAcceptRequest = async (id) => {
        try {
            const res = await axiosInstance.post(`/user/teamInvitation/${id}/accept`)
            toast.success(res.data)
            fetchCurrentEventDetails();
            fetchTeam();
        } catch (error) {
            toast.error(error.response?.data)
        }
    }
    const handleLeaveTeam = async (id) => {
        try {
            const res = await axiosInstance.post(`/user/team/${id}/leave`)
            toast.success(res.data)

            setTeamData([]);  // Ensures UI updates immediately

            // Fetch updated team details
            await fetchCurrentEventDetails();
            await fetchTeam();
        } catch (error) {
            toast.error(error.response?.data)

        }
    }
    const handleAssignCaptain = async (teamId, userId) => {
        try {
            const res = await axiosInstance.post(`/user/team/${teamId}/captain/new`, { userId })
            toast.success(res.data)
            fetchCurrentEventDetails();
            fetchTeam();
        } catch (error) {
            toast.error(error.response?.data)
        }
    }
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

    useEffect(() => {
        if (!userActivity) return;
        if (userActivity.message?.includes("accepted your invitation to join the team.")) {
            fetchTeamInvitation(teamData?.id);
            fetchTeam()
        } else if (userActivity.message?.includes(" has requested to join your team") || userActivity.message?.includes("has deleted the team join request.")) {
            fetchTeamRequest(teamData?.id);
            fetchTeam(teamData?.id)
        } else if (userActivity.message?.includes("You have been removed from the team")) {
            fetchTeam(teamData?.id)
        }else if (userActivity.message){
            fetchTeam()
        }
    }, [userActivity]);

    const [liveUsersNotInTeam, setLiveUsersNotInTeam] = useState([])

    const fetLiveUsersNotInTeamData = async (eventId) => {
        try {
            const res = await axiosInstance.get(`/user/event/${eventId}/users/live/no-team`)
            setLiveUsersNotInTeam(res.data)
        } catch (error) {
        }

    }
    useEffect(() => {
        if (currentEventData.id) {
            fetLiveUsersNotInTeamData(currentEventData.id)
        }
    }, [currentEventData])

    const [activeUserRequestTab, setActiveUserRequestTab] = useState(0)

    const handleInviteUser = async (id) => {
        try {
            const res = await axiosInstance.post(`user/${id}/invite`, { teamId: teamData.id })
            toast.success(res.data)
            await fetchTeamInvitation(teamData.id);
            fetLiveUsersNotInTeamData(currentEventData.id)
        } catch (error) {
            toast.error(error.response?.data || "error while sending invitation")
        }
    };

    return (
        <div className="overflow-hidden">
            <Sidebar value={openSidebar} setValue={setOpenSidebar} />

            <div className="flex flex-col w-full overflow-hidden text-sm">
                <Navbar value={openSidebar} setValue={setOpenSidebar} setUserActivity={setUserActivity} />
                <ToastContainer />
                <div className={`text-gray-900 overflow-auto  space-y-8   w-full ${openSidebar ? 'pl-0 lg:pl-72' : ''} `} >
                    {Object.keys(currentEventData).length > 0 ? (
                        <div className="p-4">
                            {currentEventData?.name && (
                                <div className="mx-4 bg-white rounded-md font-Lexend_Regular">
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
                                        <span className="hidden w-20 border-2 border-gray-300 sm:block"></span>
                                        <h1 className="text-2xl text-gray-800 sm:text-3xl md:text-4xl font-Lexend_Bold">
                                            {currentEventData?.name || "Event Team"}
                                        </h1>
                                        <span className="hidden w-20 border-2 border-gray-300 sm:block"></span>
                                    </div>
                                </div>
                            )}
                            <div className="flex items-center justify-center p-3 py-2 m-4 bg-gray-100 rounded">
                                <p className="px-8 py-1 text-2xl text-gray-800 rounded font-Lexend_Bold"> My Team </p>
                            </div>
                            {currentEventData.teamCreationAllowed ?
                                teamData.length === 0 ? (
                                    <div className='p-3 m-4 space-y-2 bg-gray-100 rounded font-Lexend_Medium'>
                                        <p className='flex items-center text-xl'>Create New Team</p>

                                        <div className="flex flex-col w-full lg:w-1/2">
                                            <label>Name</label>
                                            <input
                                                className="p-2 text-gray-600 rounded h-9"
                                                placeholder="Enter team name "
                                                value={teamName}
                                                onChange={(e) => setTeamName(e.target.value)}
                                            />
                                        </div>
                                        <button className="p-1 text-white rounded bg-slate-700 w-28 h-9" type="submit" onClick={() => { handleTeamSubmit(currentEventData) }}>Create</button>
                                    </div>
                                ) : (
                                    <div className='p-3 m-4 border rounded-lg font-Lexend_Medium '>
                                        <div className="flex flex-col items-center justify-between sm:flex-row">
                                            <p className="text-xl font-Lexend_SemiBold" title="Team Name">{teamData.name}</p>
                                            {isCurrentUserCaptain ? (
                                                <div className="flex space-x-2">
                                                    <button
                                                        className="px-2 py-1 text-white bg-gray-800 rounded"
                                                        onClick={() => {
                                                            handleInviteClick();
                                                            setActiveUserRequestTab(2);
                                                        }}
                                                    >
                                                        User requests<span className="px-1 ml-1 text-sm bg-red-600 rounded-full" title="Total request">{teamRequest.length}</span>
                                                    </button>
                                                    <button
                                                        className="px-2 py-1 text-white bg-gray-800 rounded"
                                                        onClick={() => {
                                                            handleInviteClick()
                                                            setActiveUserRequestTab(0)
                                                        }}
                                                    >
                                                        Invite New Members
                                                    </button>
                                                </div>
                                            ) : (
                                                <button className="px-2 py-1 text-white bg-gray-800 rounded"
                                                    onClick={() => handleLeaveTeam(teamData.id)}

                                                >
                                                    Leave Team
                                                </button>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 mt-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
                                            <div className="flex flex-col items-center p-4 bg-white border rounded-lg shadow">
                                                <p className="text-2xl text-gray-900 font-Lexend_Regular">{teamData.rank}</p>
                                                <p className="text-sm text-center text-gray-600">Team Rank</p>
                                            </div>
                                            <div className="flex flex-col items-center p-4 bg-white border rounded-lg shadow">
                                                <p className="text-2xl text-gray-900 font-Lexend_Regular">{teamData.score}</p>
                                                <p className="text-sm text-center text-gray-600">Team Score</p>
                                            </div>
                                        </div>


                                        <p className="mt-2 text-base font-Lexend_SemiBold">Members</p>
                                        <TeamMemberCardList
                                            teamData={teamData}
                                            isCurrentUserCaptain={isCurrentUserCaptain}
                                            handleLeaveTeam={handleLeaveTeam}
                                            handleDeleteMember={handleDeleteMember}
                                            handleAssignCaptain={handleAssignCaptain}
                                        />

                                        <InviteMemberModal
                                            isOpen={isModalOpen}
                                            onClose={handleCloseModal}
                                            liveUsersNotInTeam={liveUsersNotInTeam}
                                            fetchTeamInvitation={fetchTeamInvitation}
                                            teamInvitation={teamInvitation}
                                            teamRequest={teamRequest}
                                            isCurrentUserCaptain={isCurrentUserCaptain}
                                            activeUserRequestTab={activeUserRequestTab}
                                            handleDeleteInvitation={handleDeleteInvitation}
                                            handleAcceptRequest={handleAcceptRequest}
                                            handleRejectRequest={handleRejectRequest}
                                            handleInviteUser={handleInviteUser}
                                        />
                                    </div>
                                ) : <div className="p-2 m-4 text-center bg-white border rounded-lg ">

                                    <div>
                                        <p className="mb-2 text-3xl text-gray-700 font-Lexend_SemiBold">
                                            You've joined a solo event.
                                        </p>
                                        <p className="text-base text-gray-500 font-Lexend_Regular">
                                            Team creation is not available for this event.
                                        </p>
                                    </div>
                                </div>
                            }
                        </div>
                    ) : (<div>
                          <div className="flex items-center justify-center p-3 py-2 m-4 bg-gray-100 rounded">
                                <p className="px-8 py-1 text-2xl text-gray-800 rounded font-Lexend_Bold"> My Team </p>
                            </div>
                        <div className="p-6 m-4 text-center border rounded-lg font-Lexend_Regular">
                            <div className="mb-4">
                                <p
                                    className="flex items-center justify-center p-2 text-blue-500 rounded cursor-pointer"
                                    onClick={() => {
                                        navigate("/Dashboard");
                                    }}
                                >
                                    <FaLongArrowAltLeft className="mr-2" /> Back to Dashboard
                                </p>
                            </div>
                            <div>
                                <p className="mb-2 text-xl font-semibold text-gray-700">It looks like you haven't joined any event yet.</p>
                                <p className="text-gray-500">To participate in events, please join an active event first. Once you've joined, you'll be able to view and interact with team data.</p>
                            </div>
                        </div>
                        </div>
                    )}

                </div>

            </div>
        </div>

    )
}


const TeamMemberCardList = ({
    teamData,
    isCurrentUserCaptain,
    handleLeaveTeam,
    handleDeleteMember,
    handleAssignCaptain,
}) => {
    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {teamData?.members?.length > 0 ? (
                teamData.members.map((member, index) => {
                    const isCaptain = teamData.captain.id === member.user.id;

                    return (
                        <div
                            key={index}
                            className={`border rounded-lg p-4 bg-white shadow-sm space-y-2 ${isCaptain ? 'border-gray-500' : 'border-gray-300'}`}
                        >
                            <div className="flex items-center justify-between gap-2">
                                <span className="font-Lexend_SemiBold"># {index + 1}</span>

                                {isCaptain && (
                                    <>
                                        <p className="px-2 text-white bg-gray-500 rounded font-Lexend_SemiBold">Captain</p>
                                        {/* <GiCaptainHatProfile title="Captain" className="text-xl" /> */}
                                    </>
                                )}
                            </div>
                            <div>
                                <span className="font-Lexend_SemiBold">Name:</span>{" "}
                                {member.user.fullName}
                            </div>
                            <div>
                                <span className="font-Lexend_SemiBold">Email:</span>{" "}
                                {member.user.email}
                            </div>

                            {member.user.level != null ? <div>
                                <span className="font-Lexend_SemiBold">{member.user.level}:</span>{" "}
                                {member.user.levelInfo}
                            </div> : <div>
                                <p className="italic text-gray-500 font-Lexend_Regular">Profession not updated yet</p>
                            </div>}
                            <div>
                                <span className="font-Lexend_SemiBold">Organisation:</span>{" "}
                                {member.user.organisation.name}, {member.user.organisation.place}
                            </div>

                            {isCurrentUserCaptain && (
                                <div className="flex flex-wrap gap-2 pt-2">
                                    {isCaptain ? (
                                        <button
                                            className="px-3 py-1 text-sm text-white bg-gray-800 rounded"
                                            onClick={() => handleLeaveTeam(teamData.id)}
                                        >
                                            Leave Team
                                        </button>
                                    ) : (
                                        <>
                                            <button
                                                className="px-3 py-1 text-sm text-white bg-red-600 rounded"
                                                onClick={() =>
                                                    handleDeleteMember(teamData.id, member.id)
                                                }
                                            >
                                                Remove
                                            </button>
                                            <button
                                                className="px-3 py-1 text-sm text-white bg-blue-600 rounded"
                                                onClick={() =>
                                                    handleAssignCaptain(teamData.id, member.user.id)
                                                }
                                            >
                                                Assign Captain
                                            </button>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })
            ) : (
                <div className="text-center text-gray-500">
                    No Team Members available.
                </div>
            )}
        </div>
    );
};


const InviteMemberModal = ({
    isOpen,
    onClose,
    teamInvitation,
    liveUsersNotInTeam,
    isCurrentUserCaptain,
    handleAcceptRequest,
    handleDeleteInvitation,
    handleInviteUser,
    teamRequest,
    handleRejectRequest,
    activeUserRequestTab
}) => {
    const [activeTab, setActiveTab] = useState(activeUserRequestTab || 0);

    useEffect(() => {
        setActiveTab(activeUserRequestTab);
    }, [activeUserRequestTab]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black bg-opacity-50">
            <div className="bg-white  rounded-lg shadow-lg w-full max-w-full sm:max-w-2xl min-h-[50vh] max-h-[90vh] overflow-hidden motion-preset-slide-down-sm">
                <div className="flex items-center justify-end p-1"><RiCloseLine size={22} onClick={onClose} /></div>
                <div className="px-4 sm:px-6 md:px-8 pb-4 sm:pb-6 md:pb-8 max-h-[80vh] overflow-y-auto">
                    {/* ─── Tab Headers ─────────────────────────────────────────────── */}
                    <div className="sticky top-0 z-10 px-4 mb-2 bg-white border-b sm:mb-6 ">
                        <div className="flex">
                            {["Invite new member", "Invitation sent", "User Requests"].map((label, i) => (
                                <button
                                    key={label}
                                    className={`flex-1 py-2 text-xs sm:text-sm md:text-base font-Lexend_SemiBold
                                ${activeTab === i
                                            ? "border-b-2 border-gray-800 text-gray-800"
                                            : "text-gray-500 hover:text-gray-700"
                                        }`}
                                    onClick={() => setActiveTab(i)}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* ─── Tab Content ─────────────────────────────────────────────── */}
                    {activeTab === 0 && (
                        <InviteNewTeamMember
                            liveUsersNotInTeam={liveUsersNotInTeam}
                            handleInviteUser={handleInviteUser}
                            teamInvitation={teamInvitation}
                            teamRequest={teamRequest}
                        />
                    )}

                    {activeTab === 1 && (
                        <InvitationSent
                            teamInvitation={teamInvitation}
                            isCurrentUserCaptain={isCurrentUserCaptain}
                            handleDeleteInvitation={handleDeleteInvitation}
                        />
                    )}

                    {activeTab === 2 && (
                        <TeamRequest
                            teamRequest={teamRequest}
                            isCurrentUserCaptain={isCurrentUserCaptain}
                            handleAcceptRequest={handleAcceptRequest}
                            handleRejectRequest={handleRejectRequest}
                        />
                    )}

                    {/* ─── Footer ─────────────────────────────────────────────────── */}
                    {/* <div className="flex justify-end mt-8">
                        <button
                            type="button"
                            className="px-4 py-2 text-gray-700 bg-gray-300 rounded"
                            onClick={onClose}
                        >
                            Close
                        </button>
                    </div> */}
                </div>
            </div>
        </div>
    );
};

const InviteNewTeamMember = ({
    liveUsersNotInTeam = [],
    teamInvitation = [],
    teamRequest = [],
    handleInviteUser,
}) => {
    // 1️⃣  Filter out users that appear in either list
    const candidates = liveUsersNotInTeam.filter(
        (user) =>
            !teamInvitation.some((inv) => inv.user.id === user.id) &&
            !teamRequest.some((req) => req.user.id === user.id)
    );

    return (
        <div className="p-2 rounded-lg ">

            {candidates.length === 0 ? (
                <div className="text-center text-gray-500">No users available.</div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-1">
                    {candidates.map((user, index) => (
                        <div
                            key={user.id}
                            className="flex items-center justify-between p-4 bg-white border rounded-lg"
                        >
                            <div>
                                <p className="text-sm text-gray-600 ">#{index + 1} <span className="text-gray-800 font-Lexend_SemiBold">{user.fullName}</span></p>
                                <p className="text-sm text-gray-600 font-Lexend_Regular">{user.email}</p>
                                <p className="text-gray-600 font-Lexend_Regular">
                                    {user.levelInfo}
                                </p>
                                <p className="text-gray-600 font-Lexend_Regular">
                                    {user.organisation.name},{" "}{user.organisation.place}
                                </p>
                            </div>

                            <button
                                className="px-3 py-1 text-white bg-gray-800 rounded h-fit hover:bg-gray-700"
                                onClick={() => handleInviteUser(user.id)}
                            >
                                Invite
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};


const InvitationSent = ({
    teamInvitation,
    isCurrentUserCaptain,
    handleDeleteInvitation

}) => {
    return (
        <div className="space-y-4">
            {teamInvitation?.length > 0 ? (
                teamInvitation.map((member, index) => (
                    <div
                        key={member.id}
                        className="flex items-center justify-between p-4 bg-white border rounded-lg"
                    >
                        <div>
                            <p className="text-sm text-gray-600 ">#{index + 1} <span className="text-gray-800 font-Lexend_SemiBold">{member.user.fullName}</span></p>
                            <p className="text-sm text-gray-600 font-Lexend_Regular">{member.user.email}</p>
                            <p className="text-gray-600 font-Lexend_Regular">
                                {member.user.levelInfo}
                            </p>
                            <p className="text-gray-600 font-Lexend_Regular">
                                {member.user.organisation.name},{" "}{member.user.organisation.place}
                            </p>
                        </div>
                        {isCurrentUserCaptain && (
                            <div className="flex flex-wrap gap-2 pt-2">

                                <button
                                    className="px-3 py-1 text-sm text-white bg-red-600 rounded"
                                    onClick={() => handleDeleteInvitation(member.id)}
                                >
                                    Delete
                                </button>
                            </div>
                        )}
                    </div>
                ))
            ) : (
                <div className="py-2 text-center text-gray-500 bg-white rounded">No User Invited.</div>
            )}
        </div>

    )
}

const TeamRequest = ({
    teamRequest,
    isCurrentUserCaptain,
    handleAcceptRequest,
    handleRejectRequest
}) => {
    return (
        <div className="space-y-4">
            {teamRequest?.length > 0 ? (
                teamRequest.map((member, index) => (
                    <div
                        key={member.id}
                        className="flex items-center justify-between p-4 bg-white border rounded-lg"
                    >
                        <div>
                            <p className="text-sm text-gray-600 ">#{index + 1} <span className="text-gray-800 font-Lexend_SemiBold">{member.user.fullName}</span></p>
                            <p className="text-sm text-gray-600 font-Lexend_Regular">{member.user.email}</p>
                            <p className="text-gray-600 font-Lexend_Regular">
                                {member.user.levelInfo}
                            </p>
                            <p className="text-gray-600 font-Lexend_Regular">
                                {member.user.organisation.name},{" "}{member.user.organisation.place}
                            </p>
                        </div>
                        {isCurrentUserCaptain && (
                            <div className="flex flex-col gap-2 pt-2">
                                <button
                                    className="px-3 py-1 text-sm text-white bg-green-600 rounded"
                                    onClick={() => handleAcceptRequest(member.id)}
                                >
                                    Accept
                                </button>
                                <button
                                    className="px-3 py-1 text-sm text-white bg-red-600 rounded"
                                    onClick={() => handleRejectRequest(member.id)}
                                >
                                    Reject
                                </button>
                            </div>
                        )}
                    </div>
                ))
            ) : (
                <div className="py-2 text-center text-gray-500 bg-white rounded">No User requested.</div>
            )}
        </div>

    )
}




export default MyTeams