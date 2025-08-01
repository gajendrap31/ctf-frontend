
import Sidebar from "../Sidebar"
import Navbar from "../Navbar"
import React, { useReducer } from "react";
import { useState, useEffect, useMemo } from "react";
//import AuthService from "../Authentication/AuthService";
import axios from "axios";
import { url } from "../../Authentication/Utility";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Pagination from "./Pagination";
import { useNavigate } from "react-router-dom";
import AuthService from "../../Authentication/AuthService";
import { TbLivePhoto } from "react-icons/tb";
import Select from "react-select";
import { MdArrowDropUp, MdArrowDropDown } from "react-icons/md";
import { RegisteredUsersTableData } from "../Tables/RegisteredUsersTable";
import EventSelector from "./EventSelector";


function RegisteredUsers({ userDetails }) {

    const [open, setOpen] = useState(true);
    const token = useMemo(() => AuthService.getToken(), []);

    const [users, setUsers] = useState([])
    const [selectedEvent, setSelectedEvent] = useState("")
    const navigate = useNavigate()

    {/*pagination sorting,searching*/ }
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(0);
    const [searchKey, setSearchKey] = useState("");
    const [sortBy, setSortBy] = useState(0);
    const [sortDirection, setSortDirection] = useState('ASC');

    const [tableLoading,setTableLoading]=useState(false)
    useEffect(() => {
        const handleResize = () => setOpen(window.innerWidth >= 1280);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        if (!AuthService.isTokenValid(token)) navigate("/");
    }, [navigate, token]);

    const axiosInstance = useMemo(() => axios.create({
        baseURL: url,
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        withCredentials: true,
    }), [token]);

    const fetchUsers = async (eventId) => {
        
        try {
            setTableLoading(true)
            const res = await axiosInstance.get(`/admin/event/${eventId}/users/registered`, {
                params: {
                    page: currentPage - 1,
                    size: rowsPerPage,
                    sortBy,
                    direction: sortDirection,
                    searchTerm: searchKey,
                },
            });
         
            setUsers(res.data);
        } catch (error) {
           
        }finally{
            setTableLoading(false)
        }
    };


    useEffect(() => {
        if (selectedEvent) {
            fetchUsers(selectedEvent);
        }
    }, [selectedEvent, currentPage, rowsPerPage, sortBy, sortDirection, searchKey]);



    const handlePrevious = () => {
        if (currentPage > 0) setCurrentPage((prev) => prev - 1);
    };

    const handleNext = () => {
        if (currentPage < users.totalPages - 1) setCurrentPage((prev) => prev + 1);
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
   
    return (
        <div className="overflow-hidden ">
            <Sidebar open={open} name={userDetails.username} value={open} setValue={setOpen} />

            <div className="flex flex-col w-full overflow-hidden text-sm">
                <Navbar name={userDetails.name} value={open} setValue={setOpen} />
                <ToastContainer />
                <div className={`text-gray-900 min-h-[90vh]  w-full ${open ? 'pl-0 lg:pl-72' : ''} `} >

                    <div className="flex items-center justify-center p-3 py-2 m-4 bg-gray-100 rounded">
                        <p className="px-8 py-1 text-2xl text-gray-800 rounded font-Lexend_Bold"> Registered Users </p>
                    </div>
                    <div className="p-3 mx-4 mb-4 border rounded-lg font-Lexend_Regular">
                        <div className="flex flex-col items-center justify-between gap-4 mt-4 md:flex-row font-Lexend_Regular">
                            {/* Event Selection */}
                            <div className="flex flex-col items-center gap-2 sm:flex-row">
                               
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

                        <RegisteredUsersTableData
                            users={users}
                            selectedEvent={selectedEvent}
                            sortBy={sortBy}
                            sortDirection={sortDirection}
                            setSortBy={setSortBy}
                            setSortDirection={setSortDirection}
                            setCurrentPage={setCurrentPage}
                            handleSort={handleSort}
                            isLoading={tableLoading}
                        />
                        {selectedEvent && users.totalPages > 0 &&
                            <Pagination
                                totalItems={users.totalElements}
                                totalPages={users.totalPages}
                                currentPage={currentPage}
                                handlePrevious={handlePrevious}
                                handleNext={handleNext}
                                itemsPerPage={rowsPerPage}
                                setCurrentPage={setCurrentPage}
                            />
                        }

                    </div>
                </div>

            </div>

        </div>

    )
}



export default RegisteredUsers


