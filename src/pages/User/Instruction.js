import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { url } from "../Authentication/Utility";
import { Tooltip as ReactTooltip } from 'react-tooltip'
import { FaLongArrowAltLeft } from "react-icons/fa";
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

    window.addEventListener("resize", handleResize);
    handleResize(); // Initialize on mount

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
      console.log("eve:", res.data)
      setEventData(res.data);
    } catch (error) {
      console.error("Failed to fetch event details:", error);
      toast.error(error.response?.data ||"Failed to fetch event details");
    }
  };
  const fetchEventInstruction = async (eventId) => {
    try {
      const res = await axiosInstance.get(`/user/event/${eventId}/instructions`);
      console.log("eve ins:", res.data)
      setEventInstruction(res.data);
    } catch (error) {
      console.error("Failed to fetch event details:", error);
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
      console.log("Server time:", res.data)
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
      console.error(error);
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
    <div className=" overflow-hidden">
      <Sidebar value={openSidebar} setValue={setOpenSidebar} />

      <div className="w-full flex flex-col  overflow-hidden  text-sm">
        <Navbar value={openSidebar} setValue={setOpenSidebar} />
        <ToastContainer />
        <div className={`text-gray-900 overflow-auto     w-full ${openSidebar ? 'pl-0 lg:pl-72' : ''} `} >
          <div className="flex justify-end px-4 pt-4 ">
            {eventData && (
              <button
                className="bg-red-800 px-2 py-1 rounded font-Lexend_SemiBold text-white"
                onClick={handleExit}
              >
                Leave Event
              </button>
            )}
          </div>

          <div className="bg-white p-10 rounded-lg shadow-md  m-8 ">
            {eventData ? (
              <>
                <h2 className="text-2xl font-semibold mb-4 text-center">
                  {/* Welcome to */}
                  <span className="text-blue-600">{eventData.name}</span>
                </h2>
               

                <p className="text-xl font-bold text-center text-red-500 mb-3">
                  {startTimeLeft > 0 ? (
                    <>
                      Time Remaining to Start Event<br />
                      {formatTime(startTimeLeft)}
                    </>
                  ) : (
                    <>
                      Event has started <br/> Ends In
                      <p></p> 
                      {formatTime(endTimeLeft)}
                    </>
                  )}
                </p>



                {/* <p className="border border-gray-100"></p> */}
                <h1 className="text-2xl font-bold text-center">Instructions</h1>
                <p className="border border-gray-100 mb-3"></p>
                <div
                  dangerouslySetInnerHTML={{
                    __html: eventInstruction?.instructions || "<p>No instructions available for this event.</p>",
                  }}
                ></div>
                <p className="border border-gray-100 mb-3"></p>
                {/* <ul className="list-disc list-inside space-y-4 text-gray-700">
                  <li>Ensure you have a stable internet connection throughout the exam.</li>
                  <li>Do not refresh or close the browser during the exam.</li>
                  <li>Once the exam starts, the timer cannot be paused or reset.</li>
                  <li>Do not use any unfair means during the exam; your activity will be monitored.</li>
                  <li>Read each question carefully before submitting your answer.</li>
                  <li>
                    The exam will start on:{" "}
                    <strong className="text-blue-600">{formatDate(eventData.startDateTime)}</strong>
                  </li>
                </ul> */}

                <div className="mt-6 text-center space-x-2">
                  <button
                    onClick={handleStartEvent}
                    className={`px-6 py-2 font-bold rounded-lg focus:ring focus:ring-blue-300 ${startTimeLeft > 0
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-blue-500 text-white hover:bg-blue-600"
                      }`}
                    disabled={startTimeLeft > 0}
                  >
                    Start Event
                  </button>
                  {eventData.teamCreationAllowed &&

                    <button
                      className={`px-6 py-2 font-bold rounded-lg focus:ring focus:ring-blue-300 bg-blue-500 text-white hover:bg-blue-600 `}
                      data-tooltip-id="Teams-button"

                      onClick={() => navigate("/Teams")}
                    >
                      Teams
                    </button>
                  }
                  <ReactTooltip
                    id="Teams-button"
                    place="top"
                    content="Create or Join Team"
                    className="bg-green-500"
                  />

                </div>
              </>
            ) : (
              <div className="text-center">
                <div className="mb-4">
                  <p
                    className="rounded p-2 text-blue-500 flex items-center justify-center cursor-pointer"
                    onClick={() => {
                      navigate("/Dashboard");
                    }}
                  >
                    <FaLongArrowAltLeft className="mr-2" /> Back to Dashboard
                  </p>
                </div>
                <div>
                  <p className="text-xl font-semibold text-gray-700 mb-2">The event has now concluded.</p>
                  <p className="text-gray-500"> Thank you for your participation! Stay tuned for upcoming activities and updates.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Instruction;
