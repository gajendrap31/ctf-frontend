
import Sidebar from "./Sidebar"
import Navbar from "./Navbar"
import React from "react";
import { useState, useEffect } from "react";
import axios from "axios";
import { url } from '../Authentication/Utility';
//import AuthService from "../Authentication/AuthService";

import { useMemo } from "react";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useLocation } from "react-router-dom";
import AuthService from "../Authentication/AuthService";
import { useNavigate } from "react-router-dom";
import 'react-tooltip/dist/react-tooltip.css'
import { Tooltip } from 'react-tooltip'
import { MdArrowDropUp, MdArrowDropDown } from "react-icons/md";
import Select from "react-select";
import { FaLongArrowAltLeft } from "react-icons/fa";
import ScoreBoardTableData from "./Tables/ScoreboardTable";
import Pagination from "./Tables/Pagination";
function Scoreboard() {

  const [open, setOpen] = useState(true);
  const location = useLocation()
  const token = useMemo(() => localStorage.getItem('Token'), []);
  const navigate = useNavigate()
  const [events, setEvents] = useState([])
  const [currentEventData, setCurrentEvent] = useState({})
  const [currentEventLoaded, setCurrentEventLoaded] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(location.state?.eventId || "")
  const [selectedEventData, setSelectedEventData] = useState([])
  const [scoreData, setScoreData] = useState([])

  const [serverTime, setServerTime] = useState()
  const [startTimeLeft, setStartTimeLeft] = useState(0)
  const [endTimeLeft, setEndTimeLeft] = useState(0)

  {/*pagination sorting,searching*/ }
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
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

  const fetchRegisteredEvents = async () => {
    try {
      const response = await axiosInstance.get('/user/event/registered');
      setEvents(response.data);
    } catch (error) {

    }
  };

  const fetchCurrentEventDetails = async () => {
    try {
      const res = await axiosInstance.get(`/user/event/current`);
      setCurrentEvent(res.data);
    } catch (error) {

    } finally {
      setCurrentEventLoaded(true)
    }
  };
  useEffect(() => {
    fetchCurrentEventDetails()
  }, [])

  useEffect(() => {
    if (currentEventLoaded && Object.keys(currentEventData).length === 0) {
      fetchRegisteredEvents()
    }
  }, [currentEventLoaded, currentEventData]);

  const fetchScoreData = async () => {
    try {
      setTableLoading(true)
      const res = await axiosInstance.get(`/user/event/current/score`, {
        params: {
          page: currentPage - 1 === -1 ? 0 : currentPage - 1,
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

  const fetchScoreDataByEventId = async (eventId) => {
    try {
      setTableLoading(true)
      const res = await axiosInstance.get(`/user/event/${eventId}/score`, {
        params: {
          page: currentPage - 1 === -1 ? 0 : currentPage - 1,
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

  useEffect(() => {
    if (selectedEvent) {
      fetchScoreDataByEventId(selectedEvent);
    }
  }, [selectedEvent, currentPage, rowsPerPage, sortBy, sortDirection, searchKey]);

  useEffect(() => {
    if (currentEventData.id) {
      fetchScoreData();
    }
  }, [currentEventData, currentPage, rowsPerPage, sortBy, sortDirection, searchKey]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchKey]);

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

  const getEventById = (id) => {
    const data = events.find((event) => String(event.id) === String(id)) || null;
    setSelectedEventData(data);
  };

  useEffect(() => {
    if (selectedEvent && events.length > 0) {
      getEventById(selectedEvent)
    }
   
  }, [selectedEvent, events]);

  const handleSort = (columnIndex) => {
    setCurrentPage(1)
    if (sortBy === columnIndex) {
      setSortDirection(prev => (prev === 'ASC' ? 'DESC' : 'ASC'));
    } else {
      setSortBy(columnIndex);
      setSortDirection('ASC');
    }
  };

  const eventSelectOptions = events.map(event => ({
    value: event.id,
    label: event.name,
    color: event.live ? "#10B981" : event.teamSubmissions || event.userSubmissions ? "#374151" : "#9CA3AF",
  }));

  return (
    <div className="overflow-hidden ">
      <Sidebar open={open} value={open} setValue={setOpen} />

      <div className="flex flex-col w-full overflow-hidden text-sm ">
        <Navbar value={open} setValue={setOpen} />
        <ToastContainer />
        <div className={`text-gray-900 min-h-[600px] overflow-auto  w-full ${open ? 'pl-0 lg:pl-72' : ''} `} >
          {currentEventData?.name && (
            <div className="px-4 pt-4 bg-white rounded-md font-Lexend_Regular">
              <div className="flex flex-col items-center justify-between sm:flex-row ">
                <div>
                  {currentEventData.participationAllowed ? (
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
                  {currentEventData?.name || "Event Score"}
                </h1>
                <span className="hidden w-20 border-t-2 border-gray-300 sm:block"></span>
              </div>
            </div>
          )}

          <div className="flex items-center justify-center p-3 py-2 m-4 bg-gray-100 rounded">
            <p className="px-8 py-1 text-2xl text-gray-800 rounded font-Lexend_Bold"> Scoreboard </p>
          </div>
          <div className="p-3 m-4 border rounded-lg">
            <div className={`flex flex-col md:flex-row ${currentEventData.id ? "justify-end" : "justify-between"} items-center gap-4 mt-4 font-Lexend_Regular mb-2`}>
              {/* Event Selection */}
              {!currentEventData?.id && <div className="flex flex-col items-center gap-2 sm:flex-row">
               
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
            <>
              <ScoreBoardTableData
                selectedEventData={currentEventData.id ? currentEventData : selectedEventData}
                scoreData={scoreData}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                rowsPerPage={rowsPerPage}
                sortBy={sortBy}
                setSortBy={setSortBy}
                setSortDirection={setSortDirection}
                sortDirection={sortDirection}
                handleSort={handleSort}
                isLoading={tableLoading}
              />

            </>
            {scoreData.totalPages > 0 && (
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

export default Scoreboard
