

import Sidebar from "../Sidebar"
import Navbar from "../Navbar"
import React from "react";
import { useState, useEffect } from "react";
import axios from "axios";
import { url } from '../../Authentication/Utility';
import { useMemo } from "react";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useLocation } from "react-router-dom";
import Pagination from "./Pagination";
import AuthService from "../../Authentication/AuthService";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import { PiFunnelX } from "react-icons/pi";
import MarkForReviewTable from '../Tables/MarkForReviewTable'
import EventSelector from "./EventSelector";
function AdminMarkForReview({ userDetails }) {

    const [open, setOpen] = useState(true);
    const location = useLocation()
    const token = useMemo(() => localStorage.getItem('Token'), []);
    const navigate = useNavigate()
    const eventData = location.state?.event
    const [selectedEvent, setSelectedEvent] = useState(eventData?.id || "")
    const [selectedEventData, setSelectedEventData] = useState([])
    const [reviewData, setReviewData] = useState([])

    {/*pagination sorting,searching*/ }
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(0);
    const [searchKey, setSearchKey] = useState("");
    const [sortBy, setSortBy] = useState(0); // default sort index
    const [sortDirection, setSortDirection] = useState('ASC');

    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const [tableLoading, setTableLoading] = useState(false)
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1280) {
                setOpen(true);
            } else {
                setOpen(false);
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

    const axiosInstance = axios.create({
        baseURL: url,
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": 'application/json',
        },
        withCredentials: true,
    });

    const fetchReviewData = async (eventId, startDateOverride = startDate, endDateOverride = endDate) => {

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
        
            const res = await axiosInstance.get(`/admin/event/${eventId}/submissions/review`, {
                params
            });
          
            setReviewData(res.data);
        } catch (error) {
          
        } finally {
            setTableLoading(false)
        }
    };


    const handleReviewStatus = async (eventId, submissionId, status) => {
        try {
            const res = await axiosInstance.put(`/admin/event/${eventId}/submissions/${submissionId}/review`, { status });
          
            toast.success(res.data)
            fetchReviewData(eventId)
        } catch (error) {
           
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

    const formatSubmissionDate = (dateTimeString) => {
        const options = { dateStyle: "medium", timeStyle: "short" };
        return new Intl.DateTimeFormat("en-US", options).format(new Date(dateTimeString));
    };

    useEffect(() => {
        if (selectedEvent) {
            fetchReviewData(selectedEvent);
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



    const handleClear = () => {
        setStartDate('');
        setEndDate('');
        setCurrentPage(1); // if you have this state
        fetchReviewData(selectedEvent, '', '');
    };
    return (
        <div className="overflow-hidden ">
            <Sidebar open={open} name={userDetails.username} value={open} setValue={setOpen} />

            <div className="flex flex-col w-full overflow-hidden text-sm ">
                <Navbar name={userDetails.name} value={open} setValue={setOpen} />
                <ToastContainer />
                <div className={`text-gray-900 min-h-[90vh] overflow-auto  w-full ${open ? 'pl-0 lg:pl-72' : ''} `} >
                    
                    <div className="flex items-center justify-center p-3 py-2 m-4 bg-gray-100 rounded">
                        <p className="px-8 py-1 text-2xl text-gray-800 rounded font-Lexend_Bold"> Review Submissions </p>
                    </div>
                    <div className="p-3 mx-4 mb-4 border rounded-lg">
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
                        {selectedEvent && reviewData.content?.length > 0 && (
                            <div className="pt-2 font-Lexend_Regular">
                                <div className="flex flex-col gap-3 py-1 rounded md:flex-row md:items-center md:justify-center bg-whit">
                                    {/* Date Inputs */}
                                    <div className="flex flex-col gap-2 sm:flex-row">
                                        <input
                                            type="datetime-local"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                            className="w-full p-2 border rounded md:w-auto"
                                        />
                                        <input
                                            type="datetime-local"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                            className="w-full p-2 border rounded md:w-auto"
                                        />
                                    </div>

                                    {/* Buttons */}
                                    <div className="flex justify-center gap-2 md:justify-start">
                                        <button
                                            onClick={() => fetchReviewData(selectedEvent)}
                                            className="w-full h-10 px-4 text-white bg-blue-600 rounded hover:bg-blue-700 sm:w-auto"
                                        >
                                            Apply Filter
                                        </button>
                                        <button
                                            onClick={handleClear}
                                            className="flex items-center justify-center w-full h-10 px-4 text-white rounded bg-slate-800 hover:bg-slate-700 sm:w-auto"
                                        >
                                            <PiFunnelX size={20} title="Clear Filter" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}


                        <MarkForReviewTable
                            selectedEvent={selectedEvent}
                            selectedEventData={selectedEventData}
                            reviewData={reviewData}
                            currentPage={currentPage}
                            setCurrentPage={setCurrentPage}
                            rowsPerPage={rowsPerPage}
                            sortBy={sortBy}
                            sortDirection={sortDirection}
                            setSortBy={setSortBy}
                            setSortDirection={setSortDirection}
                            handleSort={handleSort}
                            handleReviewStatus={handleReviewStatus}
                            formatSubmissionDate={formatSubmissionDate}
                            isLoading={tableLoading}
                        />


                        {reviewData.totalPages > 0 && (
                            <Pagination
                                totalItems={reviewData.totalElements}
                                totalPages={reviewData.totalPages}
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


export default AdminMarkForReview
