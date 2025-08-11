

import Sidebar from "../Sidebar"
import Navbar from "../Navbar"
import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { url } from '../../Authentication/Utility';

import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useLocation } from "react-router-dom";
import Pagination from "./Pagination";
import AuthService from "../../Authentication/AuthService";
import { useNavigate } from "react-router-dom";
import { ScoreBoardTable, ScoreboardMobileCards } from "../Tables/ScoreboardTable";
import EventSelector from "./EventSelector";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

function AdminScoreboard({ userDetails }) {

    const [open, setOpen] = useState(true);
    const location = useLocation()
    const token = useMemo(() => localStorage.getItem('Token'), []);
    const navigate = useNavigate()
    const [selectedEvent, setSelectedEvent] = useState(location.state?.eventId || "")
    const [selectedEventData, setSelectedEventData] = useState([])
    const [scoreData, setScoreData] = useState([])

    {/*pagination sorting,searching*/ }
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(0);
    const [searchKey, setSearchKey] = useState("");
    const [sortBy, setSortBy] = useState(0);
    const [sortDirection, setSortDirection] = useState('ASC');

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

    const fetchScoreData = async (eventId,) => {
        try {
            setTableLoading(true)
            const res = await axiosInstance.get(`/admin/event/${eventId}/score`, {
                params: {
                    page: currentPage - 1,
                    size: rowsPerPage,
                    sortBy,
                    direction: sortDirection,
                    searchTerm: searchKey,
                },
            });
        
            setScoreData(res.data);
        } catch (error) {
           
        } finally {
            setTableLoading(false)
        }
    };

    const fetchEventDataById = async (eventId) => {
        try {
            const res = await axiosInstance.get(`admin/event/${eventId}`)
            setSelectedEventData(res.data);
        } catch (error) {
          
        }
    };

    useEffect(() => {
        if (selectedEvent) {
            fetchEventDataById(selectedEvent)
        }
    }, [selectedEvent]);

    useEffect(() => {
        if (selectedEvent) {
            fetchScoreData(selectedEvent);
        }
    }, [selectedEvent, currentPage, rowsPerPage, sortBy, sortDirection, searchKey]);

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

    const handleDownloadExcel = async () => {

        try {
            let allUsersScore = [];
            let page = 0;
            const size = 100;
            let totalPages = 1;

            do {
                const res = await axiosInstance.get(`admin/event/${selectedEvent}/score`, {
                    params: {
                        eventId: selectedEvent,
                        page,
                        size,
                        sortBy,
                        direction: sortDirection,
                        searchTerm: searchKey,
                    }
                });

                const { content, totalPages: tp } = res.data;
                allUsersScore = [...allUsersScore, ...content];
                totalPages = tp;
                page++;
            } while (page < totalPages);

            if (allUsersScore.length === 0) {
                toast.warn("No Users available to export");
                return;
            }

            const dataToExport = allUsersScore.map(user => ({
                Name: user.user.fullName,
                Email: user.user.email,
                Score: user.score,
                Rank: user.rank,
            }));

            const worksheet = XLSX.utils.json_to_sheet(dataToExport);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "State_UT Users");

            const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
            const fileData = new Blob([excelBuffer], { type: "application/octet-stream" });
            saveAs(fileData, `Scoreboard_Users_${selectedEventData?.name}.xlsx`);
        } catch (error) {

            //   alert("Failed to download. Please try again.");
        }
    };

    return (
        <div className="overflow-hidden ">
            <Sidebar open={open} name={userDetails.username} value={open} setValue={setOpen} />

            <div className="flex flex-col w-full overflow-hidden text-sm ">
                <Navbar name={userDetails.name} value={open} setValue={setOpen} />
                <ToastContainer />
                <div className={`text-gray-900 min-h-[90vh] overflow-auto  w-full ${open ? 'pl-0 lg:pl-72' : ''} `} >
                    
                    <div className="flex items-center justify-center p-3 py-2 m-4 bg-gray-100 rounded">
                        <p className="px-8 py-1 text-2xl text-gray-800 rounded font-Lexend_Bold"> Scoreboards </p>
                    </div>
                    <div className="p-3 mx-4 mb-4 border rounded-lg">
                        <div className="flex flex-col items-center justify-between gap-4 mt-4 mb-2 md:flex-row font-Lexend_Regular">
                       
                      
                            {/* Event Selection */}
                            <div className="flex flex-col items-center gap- sm:flex-row ">

                                <EventSelector
                                    selectedEvent={selectedEvent}
                                    setSelectedEvent={setSelectedEvent}
                                />
                            </div>

                            {/* Search and Rows Per Page */}
                            <div className="flex flex-wrap items-center gap-2">
                                <input
                                    type="text"
                                    value={searchKey}
                                    onChange={(e) => setSearchKey(e.target.value)}
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
                            </div>
                        </div>
                        {selectedEvent && scoreData.totalElements>0 && <div className="flex justify-end font-Lexend_Regular">
                            <button
                                onClick={handleDownloadExcel}
                                className="px-4 py-2 text-white transition bg-blue-600 rounded w-fit hover:bg-blue-700"
                            >
                                Download Excel
                            </button>
                        </div>}
                        <>
                            <ScoreBoardTable
                                selectedEvent={selectedEvent}
                                selectedEventData={selectedEventData}
                                scoreData={scoreData}
                                currentPage={currentPage}
                                rowsPerPage={rowsPerPage}
                                sortBy={sortBy}
                                sortDirection={sortDirection}
                                handleSort={handleSort}
                                isLoading={tableLoading}
                            />
                            <ScoreboardMobileCards
                                selectedEvent={selectedEvent}
                                selectedEventData={selectedEventData}
                                scoreData={scoreData}
                                currentPage={currentPage}
                                setCurrentPage={setCurrentPage}
                                rowsPerPage={rowsPerPage}
                                sortBy={sortBy}
                                sortDirection={sortDirection}
                                setSortBy={setSortBy}
                                setSortDirection={setSortDirection}
                                handleSort={handleSort}
                                isLoading={tableLoading}
                            />
                        </>
                        {selectedEvent && scoreData.totalPages > 0 && (
                            <Pagination
                                totalItems={scoreData.totalElements}
                                totalPages={scoreData.totalPages}
                                currentPage={currentPage}
                                itemsPerPage={rowsPerPage}
                                setCurrentPage={setCurrentPage}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}


export default AdminScoreboard
