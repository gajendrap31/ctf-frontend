import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import React, { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { url } from "../Authentication/Utility";
import { FaUserShield } from "react-icons/fa";
import { FaUserTie } from "react-icons/fa";
import { FaPlusCircle } from "react-icons/fa";
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/solid';
import AuthService from "../Authentication/AuthService";
function CreateTeam({ userDetails }) {
    const [openSidebar, setOpenSidebar] = useState(true); 
    const [teamData, setTeamData] = useState([]); 
    const location = useLocation(); 
    const navigate = useNavigate(); 
    const [teamName, setTeamName] = useState("")
    const [eventUserData, setEventUserData] = useState([])
    
    const token = useMemo(() => localStorage.getItem("Token"), []);

    const { state } = location || {};
    const { event } = state || {};

    const [wantAddTeam, setWantAddTeam] = useState(false)
    
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

        handleResize(); 
        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);
    useEffect(() => {
        const token = AuthService.getToken(); 
        if (!AuthService.isTokenValid(token)) {
            navigate('/'); 
        }
    }, [navigate]);

    const handleFetchTeam = async () => {
        try {
            const response = await axiosInstance.get(`/user/event/${event.id}/team`);
            setTeamData(response.data); 
           
        } catch (error) {
           // toast.error(error.response?.data || "Failed to fetch team data");
        }
    };
    const handleFetchUser = async () => {
        try {
            const response = await axiosInstance.get(`/user/event/${event.id}/users/live`);
            setEventUserData(response.data);
           // toast.success("User data fetched successfully!");
        } catch (error) {
           // toast.error(error.response?.data || "Failed to fetch team data");
        }
    };

    useEffect(() => {
        if (event?.id) {
            handleFetchTeam();
            handleFetchUser()
        } else {
            toast.error("No event data found!");
        }
    }, [event]);

    const handleNavigate = () => {
        if (event) {
            navigate("/EventChallenges", { state: { event } });
        } else {
            toast.error("Event data is missing!");
        }
    };

    const handleTeamSubmit = async () => {
        try {
            const response = await axiosInstance.post(`/user/event/${event.id}/team`,
                { teamName }
            );
            toast.success("Team added successfully!");
            setTeamName("")
        } catch (error) {
            toast.error(error.response?.data || "Failed to fetch team data");
        }
    }

    //pagination for Team table
    const [rowsPerPageTeam, setRowsPerPageTeam] = useState(10);
    const [searchKeyTeam, setSearchKeyTeam] = useState("");
    const [currentPageTeam, setCurrentPageTeam] = useState(1);

    const filteredTeamData = teamData.filter(({ name = "", }) => {
        const searchKey = searchKeyTeam.trim().toLowerCase();
        return (
            name.toLowerCase().includes(searchKey) 
        );
    });

    const filteredTeam = filteredTeamData;

    const totalItemsTeam = filteredTeam.length;
    const totalPagesTeam = Math.ceil(totalItemsTeam / rowsPerPageTeam);

    const paginatedTeamData = filteredTeam.slice(
        (currentPageTeam - 1) * rowsPerPageTeam,
        currentPageTeam * rowsPerPageTeam
    );

    const handleTeamPrevious = () => {
        if (currentPageTeam > 1) setCurrentPageTeam((prev) => prev - 1);
    };

    const handleTeamNext = () => {
        if (currentPageTeam < totalPagesTeam) setCurrentPageTeam((prev) => prev + 1);
    };

    return (
              <div className=" overflow-hidden">
            <Sidebar value={openSidebar} setValue={setOpenSidebar} />

            <div className="w-full flex flex-col  overflow-hidden  ">
                <Navbar value={openSidebar} setValue={setOpenSidebar} />
                <ToastContainer />
                <div className={`text-gray-900 overflow-auto     w-full ${openSidebar ? 'pl-0 lg:pl-72' : ''} `}  >
                    {wantAddTeam ? (
                        <div className='font-Lexend_Medium  m-4 rounded bg-gray-100 p-3 space-y-2'>
                            <p className='flex items-center text-xl'>Add New Team</p>

                            <div className="flex flex-col w-full lg:w-1/2">
                                <label>Name</label>
                                <input
                                    className="rounded h-9 p-2 text-gray-600"
                                    placeholder="Enter team name "
                                    value={teamName}
                                    onChange={(e) => setTeamName(e.target.value)}
                                />
                            </div>


                            <button className="bg-slate-700 text-white p-1 w-28 h-9 rounded" type="submit" onClick={handleTeamSubmit}>Add</button>


                        </div>
                    ) : (
                        <div className='flex items-center justify-center'>
                            <div className='flex items-center justify-center font-Lexend_Medium w-1/3 text-3xl h-16 mt-4  rounded bg-gray-100 p-3 hover:bg-gray-200 cursor-pointer'
                                onClick={() => { setWantAddTeam(!wantAddTeam) }}
                            >
                                <p>Add New Team</p>
                                <FaPlusCircle className='ml-1' size={28} />
                            </div>
                        </div>
                    )}
                    
                    <div className="bg-gray-100 p-3 m-4 rounded">
                        <p className="text-center text-2xl font-Lexend_SemiBold">List of Teams</p>
                        <div className="flex items-center justify-between">

                            <div className="flex items-center font-Lexend_SemiBold">
                                <div className="flex items-center w- p-2">
                                    <label className="mr-2 font-semibold">Search:</label>
                                    <input
                                        type="text"
                                        value={searchKeyTeam}
                                        onChange={(e) => setSearchKeyTeam(e.target.value)}
                                        placeholder="Type to search..."
                                        className=" rounded h-9 p-2 text-gray-600 "
                                        title="Enter Team name, rank"
                                    />
                                </div>


                                <select
                                    value={rowsPerPageTeam}
                                    onChange={(e) => {
                                        setRowsPerPageTeam(Number(e.target.value))
                                        setCurrentPageTeam(1)
                                    }}
                                    className="rounded h-9 p-2 text-gray-600"
                                >
                                    <option value={10}>10</option>
                                    <option value={20}>20</option>
                                    <option value={50}>50</option>
                                    <option value={100}>100</option>
                                </select>

                            </div>
                        </div>

                        <table className="w-full h-full rounded-lg bg-white font-Lexend_Regular overflow-auto">
                            <thead className="rounded-t-lg">
                                <tr className="rounded-t-lg h-10 border-b-2 bg-slate-100">

                                    <th className="text-start rounded-tl-lg ps-1">S.No.</th>
                                    <th className="text-start ps-1">Team Name</th>
                                    <th className="text-start ps-1">Captain</th>
                                    <th className="text-start ps-1">Rank</th>
                                    <th className="text-start ps-1">Score</th>
                                    <th className="text-start ps-1">Members</th>                                    
                                    <th className="text-start rounded-tr-lg ps-1">Action</th>
                                </tr>
                            </thead>

                            <tbody className="rounded-b-lg">

                                {paginatedTeamData.length > 0 ?
                                    (
                                        paginatedTeamData.map((team, index) => (
                                            <tr key={index} className={`border-b-2 h-9`}>
                                                <td className="ps-1 text-gray-700">{index + 1}</td>
                                                <td className="ps-1 text-gray-700">{team.name}</td>
                                                <td className="ps-1 text-gray-700">{team.captain.fullName}</td>
                                                <td className="ps-1 text-gray-500">{team.rank}</td>
                                                <td className="ps-1 text-gray-500">{team.score}</td>
                                                <td className="ps-1 text-gray-500">{team.members?.length}</td>                                        
                                                <td className="ps-1 text-gray-500">
                                                    <button>Invite</button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="7" className="ps-1 text-center text-gray-500">No Teams available.</td>
                                        </tr>
                                    )
                                }



                            </tbody>
                        </table>
                        {paginatedTeamData.length > 0 &&
                            <Pagination
                                totalItems={totalItemsTeam}
                                totalPages={totalPagesTeam}
                                currentPage={currentPageTeam}
                                handlePrevious={handleTeamPrevious}
                                handleNext={handleTeamNext}
                                itemsPerPage={rowsPerPageTeam}
                                setCurrentPage={setCurrentPageTeam}
                            />
                        }

                    </div>
                    
                </div>
            </div>
        </div>
    );
}

function Pagination({
    totalItems,
    totalPages,
    currentPage,
    itemsPerPage,
    handlePrevious,
    handleNext,
    setCurrentPage,
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
                        className="relative inline-flex items-center px-4 py-2 text-sm font-semibold border border-gray-200 text-gray-400"
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
        <div className="flex items-center justify-between rounded-b-lg border-gray-200 bg-white px-4 py-3 sm:px-6">
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                    <p className="text-sm text-gray-700">
                        Showing{" "}
                        <span className="font-medium">
                            {(currentPage - 1) * itemsPerPage + 1}
                        </span>{" "}
                        to{" "}
                        <span className="font-medium">
                            {Math.min(currentPage * itemsPerPage, totalItems)}
                        </span>{" "}
                        of <span className="font-medium">{totalItems}</span> results
                    </p>
                </div>
                <div>
                    <nav
                        aria-label="Pagination"
                        className="isolate inline-flex -space-x-px rounded-md shadow-sm"
                    >
                        <button
                            onClick={handlePrevious}
                            disabled={currentPage === 1}
                            className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <span className="sr-only">Previous</span>
                            <ChevronLeftIcon aria-hidden="true" className="h-5 w-5" />
                        </button>

                        {renderPageNumbers()}

                        <button
                            onClick={handleNext}
                            disabled={currentPage === totalPages}
                            className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <span className="sr-only">Next</span>
                            <ChevronRightIcon aria-hidden="true" className="h-5 w-5" />
                        </button>
                    </nav>
                </div>
            </div>
        </div>
    );
}
export default CreateTeam;
