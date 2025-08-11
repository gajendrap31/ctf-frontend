import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { url } from "../Authentication/Utility";
import { FaSignOutAlt, FaInfoCircle, FaPlay, FaUsers, FaArrowLeft, FaTrophy } from "react-icons/fa";
import AuthService from "../Authentication/AuthService";
function Instruction() {
  const [openSidebar, setOpenSidebar] = useState(true);
  const [serverTime,setServerTime]=useState()
  const [startTimeLeft, setStartTimeLeft] = useState(0);
  const [endTimeLeft, setEndTimeLeft] = useState(0);
  const [eventData, setEventData] = useState(null);
  const [eventInstruction, setEventInstruction] = useState()
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
      setOpenSidebar(window.innerWidth >= 1280);
    };

	handleResize(); // Initialize on mount
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


  // Fetch Event Details
  const fetchEventDetails = async () => {
    try {
      const res = await axiosInstance.get(`/user/event/current`);
      setEventData(res.data);
    } catch (error) {
      toast.error(error.response?.data ||"Failed to fetch event details");
    }
  };
  const fetchEventInstruction = async (eventId) => {
    try {
      const res = await axiosInstance.get(`/user/event/${eventId}/instructions`);
      setEventInstruction(res.data);
    } catch (error) {
      toast.error(error.response?.data ||"Failed to fetch event details");
    }
  };

  useEffect(() => {
    fetchEventDetails();
  }, []);

  useEffect(() => {
    if (eventData) {
      fetchEventInstruction(eventData.id)
    }
  }, [eventData]);
  // Calculate Time Remaining
  useEffect(() => {
    if (eventData?.startDateTime) {
      const serverTimestamp = new Date(serverTime).getTime();
      const eventStartTime = new Date(eventData.startDateTime).getTime();
      const timeRemaining = Math.max(0, Math.floor((eventStartTime - serverTimestamp) / 1000));
      setStartTimeLeft(timeRemaining);
    }
    if (eventData?.endDateTime) {
      const serverTimestamp = new Date(serverTime).getTime();
      const eventEndTime = new Date(eventData.endDateTime).getTime();
      const timeRemaining = Math.max(0, Math.floor((eventEndTime - serverTimestamp) / 1000));
      setEndTimeLeft(timeRemaining);
    }
  }, [eventData,serverTime]);

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

  const handleStartEvent = async () => {
    try {
      const response = await axiosInstance.get(`/user/event/${eventData.id}/status`);
      navigate("/EventChallenges", { state: { event: eventData } });
      toast.success(response.data);
    } catch (error) {
      toast.error(error.response?.data || "Failed to start the event");
    }
  };

  const handleExit = async () => {
    try {
      const response = await axiosInstance.post(`/user/event/${eventData.id}/leave`);
      navigate("/Dashboard");
      toast.success(response.data);
    } catch (error) {
      toast.error(error.response?.data || "Failed to leave the event.");
    }
  };

  const formatDate = (dateTimeString) => {
    const options = { dateStyle: "medium", timeStyle: "short" };
    return new Intl.DateTimeFormat("en-US", options).format(new Date(dateTimeString));
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <Sidebar value={openSidebar} setValue={setOpenSidebar} />

      <div className={`transition-all ${openSidebar ? 'xl:ml-72' : ''}`}>
        <Navbar value={openSidebar} setValue={setOpenSidebar} />
        <ToastContainer />

        <main className="p-4 md:p-8">
          <div className="flex justify-end mb-4">
            {eventData && (
              <button
                onClick={handleExit}
                className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 text-sm font-semibold rounded transition"
              >
                <FaSignOutAlt className="inline mr-2" />
                Leave Event
              </button>
            )}
          </div>

          <div className="bg-white border rounded-lg p-6 shadow-sm">
            {eventData ? (
              <>
                <h1 className="text-3xl font-bold text-center mb-4 text-gray-900">
                  {eventData.name}
                </h1>

                <div className="bg-gray-100 rounded-lg p-4 text-center mb-6">
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    {startTimeLeft > 0 ? "Event starts in" : "Event is live"}
                  </p>
                  <p className="text-xl font-mono font-semibold text-red-600">
                    {startTimeLeft > 0 ? formatTime(startTimeLeft) : formatTime(endTimeLeft)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Time remaining</p>
                </div>

                <div className="mb-6">
                  <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-2">
                    <FaInfoCircle className="text-blue-500" />
                    Instructions
                  </h2>
                  <div className="border-t border-gray-200 mb-3"></div>

                <div
                className="prose prose-sm max-w-none text-gray-800"
                dangerouslySetInnerHTML={{
                  __html: eventInstruction?.instructions || "<p>No instructions available for this event.</p>",
                }}
              />

                </div>

                <div className="flex justify-center gap-4 mt-4 flex-wrap">
                  <button
                    onClick={handleStartEvent}
                    disabled={startTimeLeft > 0}
                    className={`px-5 py-2 rounded text-sm font-medium transition ${startTimeLeft > 0
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                  >
                    <FaPlay className="inline mr-2" />
                    <span className="text-md font-semibold">Start Event</span>
                  </button>

                  {eventData.teamCreationAllowed && (
                    <button
                      onClick={() => navigate("/Teams")}
                      className="px-5 py-2 rounded text-sm font-medium bg-green-600 text-white hover:bg-green-700 transition"
                    >
                      <FaUsers className="inline mr-2 text-xl" />
                      <span className="text-md font-semibold">Teams</span>
                    </button>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center">
                <button
                  onClick={() => navigate("/Dashboard")}
                  className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4 text-sm"
                >
                  <FaArrowLeft className="mr-2" />
                  Back to Dashboard
                </button>

                <FaTrophy className="text-5xl text-yellow-400 mb-4 mx-auto" />
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                  The event has concluded.
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                  Thank you for participating! Stay tuned for upcoming activities.
                </p>

                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded">
                  <p className="text-sm text-yellow-800 font-medium">🎉 Results will be announced soon!</p>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default Instruction;