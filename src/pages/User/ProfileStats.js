
import Sidebar from "./Sidebar"
import Navbar from "./Navbar"
import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { url } from "../Authentication/Utility";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AuthService from "../Authentication/AuthService";
import { useNavigate } from "react-router-dom";
import { IoFlag } from "react-icons/io5";
import { FaCalendarAlt } from "react-icons/fa";
import { MdOutlineStar } from "react-icons/md";
import { BiRefresh } from "react-icons/bi";
import { format } from "date-fns";
import { GoGraph } from "react-icons/go";
import { FaMedal } from "react-icons/fa6";
export default function ProfileStats() {
    const [openSidebar, setOpenSidebar] = useState(true);
    const [userStats, setUserStats] = useState()
    const navigate = useNavigate()
    useEffect(() => {
        const handleResize = () => {
            setOpenSidebar(window.innerWidth >= 1280);
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);
    useEffect(() => {
        const token = AuthService.getToken();
        if (!AuthService.isTokenValid(token)) {
            navigate('/');
        }
    }, [navigate]);
    const token = useMemo(() => localStorage.getItem("Token"), []);
    const axiosInstance = axios.create({
        baseURL: url,
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        withCredentials: true,
    });

    const fetchUserStats = async () => {
        try {
            const res = await axiosInstance.get(`/user/statistics`)
            console.log("userStats", res.data)
            setUserStats(res.data)
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        fetchUserStats()
    }, [])

    const formatDate = (date) => {
        if (!date) return "N/A";
        return format(new Date(date), "dd MMM yyyy, hh:mm a");
    };
    const [refreshMessage, setRefreshMessage] = useState("")
    const handleRefresh = async () => {
        try {
            const res = await axiosInstance.get(`user/statistics/refresh`)
            console.log(res.data)
            setRefreshMessage(res.data)
            fetchUserStats()
            setTimeout(() => {
                setRefreshMessage("");
            }, 5000);
        } catch (error) {
            console.log(error.response?.data)
            setRefreshMessage(error.response?.data)
            setTimeout(() => {
                setRefreshMessage("");
            }, 5000);
        }
    }


    return (
        <div className="overflow-hidden">
            <Sidebar value={openSidebar} setValue={setOpenSidebar} />
            <div className="flex flex-col w-full overflow-hidden">
                <Navbar value={openSidebar} setValue={setOpenSidebar} />
                <ToastContainer />
                <div className={`text-gray-900 overflow-auto min-h-[90vh] text-sm w-full ${openSidebar ? 'pl-0 md:pl-72' : ''}`}>
                    <div className="p-4">
                        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                            <div>
                                <p className="text-xl font-Lexend_SemiBold">My Statistics</p>
                                <p className="text-gray-500 font-Lexend_Regular">
                                    Last updated: {formatDate(userStats?.lastUpdated)}
                                </p>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 md:gap-4">
                                <div
                                    className={`transition-all duration-500 ease-in-out overflow-hidden ${refreshMessage ? "opacity-100 scale-105 max-h-10" : "opacity-0 scale-95 max-h-0"
                                        }`}
                                >
                                    <p className="text-sm text-gray-600">{refreshMessage}</p>
                                </div>
                                <button
                                    className="flex items-center px-2 py-1 space-x-1 text-white bg-blue-500 rounded font-Lexend_Regular"
                                    onClick={handleRefresh}
                                >
                                    <BiRefresh className="text-xl sm:text-2xl" />
                                    <span>Refresh Stats</span>
                                </button>
                            </div>
                        </div>

                        <div className="pt-4 space-y-4 text-sm font-Lexend_Regular">
                            {/* Stats Cards Grid */}
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                                {/* Total Events */}
                                <div className="border border-gray-300 hover:bg-gray-50 rounded-xl flex flex-col p-4 shadow justify-between transition duration-300 ease-in-out transform hover:scale-[1.02] hover:shadow-lg">
                                    <div className="flex items-center justify-between pb-2">
                                        <p className="font-Lexend_SemiBold">Total Events</p>
                                        <FaCalendarAlt className="text-xl text-gray-600" />
                                    </div>
                                    <p className="text-3xl text-gray-800 font-Lexend_SemiBold">
                                        {userStats?.totalParticipatedEvents || 0}
                                    </p>
                                    <div className="flex items-center justify-between mt-2 text-gray-700">
                                        <p>Solo: <span className="text-gray-900">{userStats?.totalSoloEvents || 0}</span></p>
                                        <p>Team: <span className="text-gray-900">{userStats?.totalTeamEvents || 0}</span></p>
                                    </div>
                                </div>

                                {/* Total Points */}
                                <div className="border border-gray-300 hover:bg-gray-50 rounded-xl flex flex-col p-4 shadow justify-between transition duration-300 ease-in-out transform hover:scale-[1.02] hover:shadow-lg">
                                    <div className="flex items-center justify-between pb-2">
                                        <p className="font-Lexend_SemiBold">Total Points</p>
                                        <MdOutlineStar className="text-xl text-purple-600" />
                                    </div>
                                    <p className="text-3xl text-gray-800 font-Lexend_SemiBold">
                                        {(userStats?.totalUserPoints || 0) + (userStats?.totalTeamPoints || 0)}
                                    </p>
                                    <div className="flex items-center justify-between mt-2 text-gray-700">
                                        <p>Solo: <span className="text-gray-900">{userStats?.totalUserPoints || 0}</span></p>
                                        <p>Team: <span className="text-gray-900">{userStats?.totalTeamPoints || 0}</span></p>
                                    </div>
                                </div>

                                {/* Flags Captured */}
                                <div className="border border-gray-300 hover:bg-gray-50 rounded-xl flex flex-col p-4 shadow justify-between transition duration-300 ease-in-out transform hover:scale-[1.02] hover:shadow-lg">
                                    <div className="flex items-center justify-between pb-2">
                                        <p className="font-Lexend_SemiBold">Flags Captured</p>
                                        <IoFlag className="text-xl text-green-600" />
                                    </div>
                                    <p className="text-3xl text-gray-800 font-Lexend_SemiBold">
                                        {(userStats?.totalUserFlagsCaptured || 0) + (userStats?.totalTeamFlagsCaptured || 0)}
                                    </p>
                                    <div className="flex items-center justify-between mt-2 text-gray-700">
                                        <p>Solo: <span className="text-gray-900">{userStats?.totalUserFlagsCaptured || 0}</span></p>
                                        <p>Team: <span className="text-gray-900">{userStats?.totalTeamFlagsCaptured || 0}</span></p>
                                    </div>
                                </div>

                                {/* Success Rate */}
                                <div className="border border-gray-300 hover:bg-gray-50 rounded-xl flex flex-col p-4 shadow justify-between transition duration-300 ease-in-out transform hover:scale-[1.02] hover:shadow-lg">
                                    <div className="flex items-center justify-between pb-2">
                                        <p className="font-Lexend_SemiBold">Success Rate</p>
                                        <GoGraph className="text-xl text-yellow-500" />
                                    </div>
                                    <p className="text-3xl text-gray-800 font-Lexend_SemiBold">
                                        {(
                                            (Number(userStats?.userSuccessRate || 0) + Number(userStats?.teamSuccessRate || 0)) /
                                            ((userStats?.totalSoloEvents || 0) === 0 || (userStats?.totalTeamEvents || 0) === 0 ? 1 : 2)
                                        ).toFixed(1)}
                                        %
                                    </p>
                                    <div className="flex items-center justify-between mt-2 text-gray-700">
                                        <p>Solo: <span className="text-gray-900">{Number(userStats?.userSuccessRate || 0).toFixed(1)}%</span></p>
                                        <p>Team: <span className="text-gray-900">{Number(userStats?.teamSuccessRate || 0).toFixed(1)}%</span></p>
                                    </div>
                                </div>
                            </div>

                            {/* Additional Component */}
                            <PerformanceActivate userStats={userStats} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};



const PerformanceActivate = ({
    userStats
}) => {
    const [activeTab, setActiveTab] = useState(0);

    return (
        <div className="flex w-full px-2 sm:px-0">
            <div className="w-full p-2 bg-white border rounded-lg">
                {/* ─── Tab Headers ───────────────────────────── */}
                <div className="mb-2 border-b">
                    <div className="flex">
                        {["Solo Performance", "Team Performance", "Achievements"].map((label, i) => (
                            <button
                                key={label}
                                className={`w-full sm:w-auto text-left sm:text-center py-2 px-2 text-xs sm:text-sm font-Lexend_SemiBold transition-colors duration-200 ${activeTab === i
                                    ? "border-b-2  border-gray-800 text-gray-800"
                                    : "text-gray-500 hover:text-gray-700"
                                    }`}
                                onClick={() => setActiveTab(i)}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ─── Tab Content ───────────────────────────── */}
                <div className="overflow-x-auto">
                    {activeTab === 0 && (
                        <SoloPerformance userStats={userStats} />
                    )}
                    {activeTab === 1 && (
                        <TeamPerformance userStats={userStats} />
                    )}
                    {activeTab === 2 && (
                        <Achievements userStats={userStats} />
                    )}
                </div>
            </div>
        </div>

    );
};

const SoloPerformance = ({userStats}) => {
    const formatTimeRange = (start, end) => {
        if (!start) return "N/A";
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
    const formatDate = (date) => {
        if (!date) return "N/A";
        return format(new Date(date), "dd MMM yyyy, hh:mm a");
    };
    return (
        <div className="w-full px-2 rounded-lg sm:px-0">
            {/* Solo Performance */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
                {/* Left Column (Performance + Achievements) */}
                <div className="grid grid-cols-1 gap-4 lg:col-span-8">
                    {/* Solo Performance Overview */}
                    <div className="p-4 border rounded-lg">
                        <p className="mb-2 text-base font-Lexend_SemiBold">Solo Performance Overview</p>
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            {/* Progress Stats */}
                            <div className="space-y-4">
                                {/* Challenges Attempted */}
                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <p className="text-xs text-gray-600">Challenges Attempted</p>
                                        <p className="text-xs font-semibold text-gray-800">
                                            {userStats?.totalUserChallengesAttempted || 0}/{userStats?.totalSoloEventChallenges}
                                        </p>
                                    </div>
                                    <div className="w-full h-2 overflow-hidden bg-blue-400 rounded-full">
                                        <div
                                            className="h-full transition-all duration-500 bg-blue-600 rounded-lg"
                                            style={{
                                                width: `${((userStats?.totalUserChallengesAttempted || 0) /
                                                    (userStats?.totalSoloEventChallenges || 1)) * 100
                                                    }%`,
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* Success Rate */}
                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <p className="text-xs text-gray-600">Success Rate</p>
                                        <p>{Number(userStats?.userSuccessRate || 0).toFixed(1)}%</p>
                                    </div>
                                    <div className="w-full h-2 overflow-hidden bg-blue-400 rounded-full">
                                        <div
                                            className="h-full transition-all duration-500 bg-blue-600 rounded-lg"
                                            style={{
                                                width: `${Number(userStats?.userSuccessRate || 0).toFixed(1)}%`,
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* Flags Captured */}
                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <p className="text-xs text-gray-600">Flags Captured</p>
                                        <p>{userStats?.totalUserFlagsCaptured || 0}/{userStats?.totalUserChallengesAttempted || 0}</p>
                                    </div>
                                    <div className="w-full h-2 overflow-hidden bg-blue-400 rounded-full">
                                        <div
                                            className="h-full transition-all duration-500 bg-blue-600 rounded-lg"
                                            style={{
                                                width: `${((userStats?.totalUserFlagsCaptured || 0) /
                                                    (userStats?.totalUserChallengesAttempted || 1)) * 100
                                                    }%`,
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Summary Stats */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-gray-600">Highest Score</p>
                                        <p className="text-gray-900">{userStats?.highestUserScore?.score || 0} pts</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-600">Lowest Score</p>
                                        <p className="text-gray-900">{userStats?.lowestUserScore?.score || 0} pts</p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-gray-600">Last Participated</p>
                                        <p className="text-gray-900">{formatDate(userStats?.lastSoloParticipationUserScore?.lastSoloParticipation)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-600 pe-2">Total Events</p>
                                        <p className="text-gray-900">{userStats?.totalSoloEvents}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Solo Achievements */}
                    <div className="p-4 border rounded-lg">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-base font-Lexend_SemiBold">Solo Achievements</p>
                            <div className="flex space-x-3">
                                <div className="flex items-center space-x-1">
                                    <FaMedal className="text-yellow-500" />
                                    <p>{userStats?.userFirstPlaceScores?.length || 0}</p>
                                </div>
                                <div className="flex items-center space-x-1">
                                    <FaMedal className="text-gray-500" />
                                    <p>{userStats?.userSecondPlaceScores?.length || 0}</p>
                                </div>
                                <div className="flex items-center space-x-1">
                                    <FaMedal className="text-orange-500" />
                                    <p>{userStats?.userThirdPlaceScores?.length || 0}</p>
                                </div>
                            </div>
                        </div>

                        <div className="w-full pt-2 overflow-x-auto">
                            <table className="w-full min-w-[300px] table-auto border-collapse text-left text-xs sm:text-sm">
                                <thead className="bg-gray-200">
                                    <tr>
                                        <th className="px-4 py-2 rounded-tl-lg">Event</th>
                                        <th className="px-4 py-2">Position</th>
                                        <th className="px-4 py-2 rounded-tr-lg">Score</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {userStats?.userFirstPlaceScores?.length > 0 ||
                                        userStats?.userSecondPlaceScores?.length > 0 ||
                                        userStats?.userThirdPlaceScores?.length > 0 ? (
                                        <>
                                            {renderScores(userStats?.userFirstPlaceScores, "text-yellow-500", "st")}
                                            {renderScores(userStats?.userSecondPlaceScores, "text-gray-400", "nd")}
                                            {renderScores(userStats?.userThirdPlaceScores, "text-amber-800", "rd")}
                                        </>
                                    ) : (
                                        <tr>
                                            <td colSpan={3} className="py-4 text-sm text-center text-gray-400">
                                                No individual rankings available.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Right Column (Recent Activity) */}
                <div className="p-4 border rounded-lg lg:col-span-4">
                    <p className="mb-2 text-base font-Lexend_SemiBold">Recent Activity</p>
                    <div className="space-y-1 text-xs text-gray-500">
                        <p className="font-Lexend_SemiBold">Last Participation{" "}</p>
                        <div className="flex items-center space-x-2">
                              <IoFlag className="text-xl text-green-600" />
                            <div>
                                <p className="flex items-center text-sm text-gray-800 ">{userStats?.lastSoloParticipationUserScore?.event?.name}</p>
                                <p>{formatTimeRange(userStats?.lastSoloParticipationUserScore?.event?.startDateTime, userStats?.lastSoloParticipationUserScore?.event?.endDateTime)}</p>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>

    );
};

const renderScores = (scores, color, suffix) => (
    scores?.length > 0 &&
    scores.map((data, i) => (
        <tr key={`${data.event?.id}-${suffix}-${i}`} className="border-b">
            <td className="px-4 py-2">{data.event?.name}</td>
            <td className="flex items-center gap-1 px-4 py-2">
                <FaMedal className={color} /> {data.rank}
                {suffix}
            </td>
            <td className="px-4 py-2">{data.score}</td>
        </tr>
    ))
);

const TeamPerformance = ({userStats}) => {
      const formatTimeRange = (start, end) => {
        if(!start) return "N/A"
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
    const formatDate = (date) => {
        if (!date) return "N/A";
        return format(new Date(date), "dd MMM yyyy, hh:mm a");
    };
    return (
        <div className="w-full px-2 rounded-lg sm:px-0">
            {/* Team Performance */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
                {/* Left Section: Performance + Achievements */}
                <div className="grid grid-cols-1 gap-4 lg:col-span-8">
                    {/* Performance Overview */}
                    <div className="p-4 border rounded-lg">
                        <p className="mb-2 text-base font-Lexend_SemiBold">Team Performance Overview</p>
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            {/* Stats Progress */}
                            <div className="space-y-4">
                                {/* Challenges Attempted */}
                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <p className="text-xs text-gray-600">Challenges Attempted</p>
                                        <p className="text-xs font-semibold text-gray-800">
                                            {userStats?.totalTeamChallengesAttempted || 0}/{userStats?.totalTeamEventChallenges}
                                        </p>
                                    </div>
                                    <div className="w-full h-2 overflow-hidden bg-blue-400 rounded-full">
                                        <div
                                            className="h-full transition-all duration-500 bg-blue-600 rounded-lg"
                                            style={{
                                                width: `${((userStats?.totalTeamChallengesAttempted || 0) / (userStats?.totalTeamEventChallenges || 1)) * 100}%`,
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* Success Rate */}
                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <p className="text-xs text-gray-600">Success Rate</p>
                                        <p>{Number(userStats?.teamSuccessRate || 0).toFixed(1)}%</p>
                                    </div>
                                    <div className="w-full h-2 overflow-hidden bg-blue-400 rounded-full">
                                        <div
                                            className="h-full transition-all duration-500 bg-blue-600 rounded-lg"
                                            style={{
                                                width: `${Number(userStats?.teamSuccessRate || 0).toFixed(1)}%`,
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* Flags Captured */}
                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <p className="text-xs text-gray-600">Flags Captured</p>
                                        <p>{userStats?.totalTeamFlagsCaptured || 0}/{userStats?.totalTeamChallengesAttempted || 0}</p>
                                    </div>
                                    <div className="w-full h-2 overflow-hidden bg-blue-400 rounded-full">
                                        <div
                                            className="h-full transition-all duration-500 bg-blue-600 rounded-lg"
                                            style={{
                                                width: `${((userStats?.totalTeamFlagsCaptured || 0) / (userStats?.totalTeamChallengesAttempted || 1)) * 100}%`,
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Summary Info */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-gray-600">Highest Score</p>
                                        <p className="text-gray-900">{userStats?.highestTeamScore?.score || 0} pts</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-600">Lowest Score</p>
                                        <p className="text-gray-900">{userStats?.lowestTeamScore?.score || 0} pts</p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-gray-600">Last Participated</p>
                                        <p className="text-gray-900">{formatDate(userStats?.lastTeamParticipationTeamScore?.lastTeamParticipation)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-600 pe-2">Total Events</p>
                                        <p className="text-gray-900">{userStats?.totalTeamEvents}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Team Achievements */}
                    <div className="p-4 border rounded-lg">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-base font-Lexend_SemiBold">Team Achievements</p>
                            <div className="flex space-x-3">
                                <div className="flex items-center space-x-1">
                                    <FaMedal className="text-yellow-500" />
                                    <p>{userStats?.teamFirstPlaceScores?.length || 0}</p>
                                </div>
                                <div className="flex items-center space-x-1">
                                    <FaMedal className="text-gray-500" />
                                    <p>{userStats?.teamSecondPlaceScores?.length || 0}</p>
                                </div>
                                <div className="flex items-center space-x-1">
                                    <FaMedal className="text-orange-500" />
                                    <p>{userStats?.teamThirdPlaceScores?.length || 0}</p>
                                </div>
                            </div>
                        </div>

                        <div className="w-full pt-2 overflow-x-auto">
                            <table className="w-full min-w-[300px] table-auto border-collapse text-left text-xs sm:text-sm">
                                <thead className="bg-gray-200">
                                    <tr>
                                        <th className="px-4 py-2 rounded-tl-lg">Event</th>
                                        <th className="px-4 py-2">Position</th>
                                        <th className="px-4 py-2 rounded-tr-lg">Score</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {userStats?.teamFirstPlaceScores?.length > 0 ||
                                        userStats?.teamSecondPlaceScores?.length > 0 ||
                                        userStats?.teamThirdPlaceScores?.length > 0 ? (
                                        <>
                                            {renderScores(userStats?.teamFirstPlaceScores, "text-yellow-500", "st")}
                                            {renderScores(userStats?.teamSecondPlaceScores, "text-gray-400", "nd")}
                                            {renderScores(userStats?.teamThirdPlaceScores, "text-amber-800", "rd")}
                                        </>
                                    ) : (
                                        <tr>
                                            <td colSpan={3} className="py-4 text-sm text-center text-gray-400">
                                                No team rankings available.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Right Section: Recent Activity */}
                <div className="p-4 border rounded-lg lg:col-span-4">
                    <p className="mb-2 text-base font-Lexend_SemiBold">Recent Activity</p>
                    <div className="space-y-1 text-xs text-gray-500">
                        <p className="font-Lexend_SemiBold">Last Participation{" "}</p>
                        <div className="flex items-center space-x-2">
                              <IoFlag className="text-xl text-green-600" />
                            <div>
                                <p className="flex items-center text-sm text-gray-800 ">{userStats?.lastTeamParticipationTeamScore?.event?.name}</p>
                                <p>{formatTimeRange(userStats?.lastTeamParticipationTeamScore?.event?.startDateTime, userStats?.lastTeamParticipationTeamScore?.event?.endDateTime)}</p>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>

    )
}

const Achievements = ({userStats}) => {
    return (
        <div className="w-full px-2 rounded-lg sm:px-0">
            {/* Achievements */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">

                {/* Badge */}
                <div className="p-4 border rounded-lg">
                    <p className="text-base font-Lexend_SemiBold">Badge</p>
                    <div className="flex items-center justify-center h-full">
                        <p>No Badges</p>
                    </div>
                    {/* Badge content here */}
                </div>

                {/* Milestones */}
                <div className="p-4 border rounded-lg">
                    <p className="text-base font-Lexend_SemiBold">Milestones</p>
                    <div className="pt-2 space-y-4">

                        {/* Event Participated */}
                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <p className="text-xs text-gray-600">Event Participated</p>
                                <p className="text-xs font-semibold text-gray-800">
                                    {userStats?.totalParticipatedEvents || 0}/{userStats?.totalEvents || 0}
                                </p>
                            </div>
                            <div className="w-full h-2 overflow-hidden bg-blue-400 rounded-full">
                                <div
                                    className="h-full transition-all duration-500 bg-blue-600 rounded-lg"
                                    style={{
                                        width: `${((userStats?.totalParticipatedEvents || 0) / (userStats?.totalEvents || 1)) * 100}%`,
                                    }}
                                />
                            </div>
                        </div>

                        {/* Flag Captured */}
                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <p className="text-xs text-gray-600">Flag Captured</p>
                                <p className="text-xs font-semibold text-gray-800">
                                    {(userStats?.totalUserFlagsCaptured + userStats?.totalTeamFlagsCaptured) || 0}/
                                    {(userStats?.totalUserChallengesAttempted + userStats?.totalTeamChallengesAttempted) || 0}
                                </p>
                            </div>
                            <div className="w-full h-2 overflow-hidden bg-blue-400 rounded-full">
                                <div
                                    className="h-full transition-all duration-500 bg-blue-600 rounded-lg"
                                    style={{
                                        width: `${((userStats?.totalUserFlagsCaptured + userStats?.totalTeamFlagsCaptured || 0) / (userStats?.totalUserChallengesAttempted + userStats?.totalTeamChallengesAttempted || 1)) * 100}%`,
                                    }}
                                />
                            </div>
                        </div>

                        {/* First Place Finishes */}
                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <p className="text-xs text-gray-600">First Place Finishes</p>
                                <p className="text-xs font-semibold text-gray-800">
                                    {(userStats?.userFirstPlaceScores?.length || 0) + (userStats?.teamFirstPlaceScores?.length || 0)}/
                                    {userStats?.totalParticipatedEvents || 0}
                                </p>
                            </div>
                            <div className="w-full h-2 overflow-hidden bg-blue-400 rounded-full">
                                <div
                                    className="h-full transition-all duration-500 bg-blue-600 rounded-lg"
                                    style={{
                                        width: `${(((userStats?.userFirstPlaceScores?.length || 0) + (userStats?.teamFirstPlaceScores?.length || 0)) / (userStats?.totalEventsParticipated || 1)) * 100}%`,
                                    }}
                                />
                            </div>
                        </div>

                        {/* Total Points */}
                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <p className="text-xs text-gray-600">Total Points</p>
                                <p className="text-xs font-semibold text-gray-800">
                                    {(userStats?.totalUserPoints + userStats?.totalTeamPoints) || 0}/{(userStats?.totalChallengePointsFromParticipatedEvents || 0)}
                                </p>
                            </div>
                            <div className="w-full h-2 overflow-hidden bg-blue-400 rounded-full">
                                <div
                                    className="h-full transition-all duration-500 bg-blue-600 rounded-lg"
                                    style={{
                                        width: `${((userStats?.totalUserPoints + userStats?.totalTeamPoints || 0) / (userStats?.totalChallengePointsFromParticipatedEvents || 1)) * 100}%`,
                                    }}
                                />
                            </div>
                        </div>

                        {/* Success Rate */}
                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <p className="text-xs text-gray-600">Success Rate</p>
                                <p className="text-xs font-semibold text-gray-800">
                                    {(
                                        (Number(userStats?.userSuccessRate) + Number(userStats?.teamSuccessRate)) /
                                        (userStats?.totalSoloEvents === 0 || userStats?.totalTeamEvents === 0 ? 1 : 2)
                                    ).toFixed(1) || 0}%
                                </p>
                            </div>
                            <div className="w-full h-2 overflow-hidden bg-blue-400 rounded-full">
                                <div
                                    className="h-full transition-all duration-500 bg-blue-600 rounded-lg"
                                    style={{
                                        width: `${(
                                            (Number(userStats?.userSuccessRate) + Number(userStats?.teamSuccessRate)) /
                                            (userStats?.totalSoloEvents === 0 || userStats?.totalTeamEvents === 0 ? 1 : 2)
                                        ).toFixed(1) || 0}%`,
                                    }}
                                />
                            </div>
                        </div>

                    </div>
                </div>

                {/* Certificates */}
                <div className="p-4 border rounded-lg">
                    <p className="text-base font-Lexend_SemiBold">Certificates</p>
                    {/* Certificate content here */}
                    <div className="flex items-center justify-center h-full">
                        <p>No Certificates</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
