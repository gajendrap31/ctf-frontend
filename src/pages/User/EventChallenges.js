import Sidebar from "./Sidebar"
import Navbar from "./Navbar"
import { useState, useEffect, useMemo, useRef, useContext, forwardRef, useImperativeHandle, } from "react";
import axios from "axios";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { url } from "../Authentication/Utility";
import { useNavigate } from "react-router-dom";
import Modal from "react-modal";
import { IoCloseOutline } from "react-icons/io5";
import AuthService from "../Authentication/AuthService";
import { EventSourcePolyfill } from 'event-source-polyfill';
import { ProfileContext } from "../Context API/ProfileContext";
import { faCircleCheck, faCircleXmark, faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Tooltip } from 'react-tooltip'
import { PulseLoader } from "react-spinners";
function EventChallenges() {
    Modal.setAppElement("#root");
    const [openSidebar, setOpenSidebar] = useState(true);
    const { userDetails } = useContext(ProfileContext)
    const [currentEventData, setCurrentEventData] = useState([])

    const [challengesCategory, setChallengesCategory] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);

    const [selectedChallenge, setSelectedChallenge] = useState([])

    const [serverTime, setServerTime] = useState()
    const [startTimeLeft, setStartTimeLeft] = useState(0)
    const [endTimeLeft, setEndTimeLeft] = useState(0)

    // ChallengeHint modal
    const [hint, setHint] = useState("")
    const [showHint, setShowHint] = useState(false);
    const [isHintModalOpen, setIsHintModalOpen] = useState(false);

    //Challenge modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentChallengeIndex, setCurrentChallengeIndex] = useState(0);
    const [challengeSolution, setChallengeSolution] = useState("");

    const navigate = useNavigate();

    const token = useMemo(() => localStorage.getItem("Token"), []);
    useEffect(() => {
        const handleResize = () => {
            setOpenSidebar(window.innerWidth >= 1280);
        };

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

    const axiosInstance = axios.create({
        baseURL: url,
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": 'application/json',
        },
        withCredentials: true,
    });

    const fetchAllChallenges = async () => {
        if (!currentEventData.id) return;

        try {
            const res = await axiosInstance.get(`/user/event/${currentEventData.id}/challengeCategory`);
            const updatedCategories = await Promise.all(
                res.data.map(async (category) => {
                    const resChal = await axiosInstance.get(`/user/challengeCategory/${category.id}/challenge/assigned`);
                    return {
                        ...category,
                        challenges: resChal.data || [],
                    };
                })
            );
            setChallengesCategory(updatedCategories);
        } catch (err) {
            //console.error("Failed to reload challenges", err);
        }
    };

    useEffect(() => {
        if (!userDetails?.id || !token) return;

        let isCancelled = false;
        let eventSource = null;

        const connectSSE = () => {
            try {
                const userId = Number(userDetails.id);
                eventSource = new EventSourcePolyfill(`${url}/submission/update/user/${userId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                    heartbeatTimeout: 60000,
                    withCredentials: true,
                });

                eventSource.onopen = () => {
                    // console.info("✅ SSE connected");
                };

                eventSource.onmessage = async (event) => {
                    if (isCancelled) return;
                    try {
                        const data = JSON.parse(event.data);
                        if (data.update && data.challengeCategoryId) {
                            const ref = categoryRefs.current[data.challengeCategoryId];
                            if (ref?.refetchChallenges) await ref.refetchChallenges();
                        }
                        if (data.message) toast.info(data.message);
                    } catch (err) {
                        // console.warn("Invalid SSE message:", err);
                    }
                };

                eventSource.onerror = (err) => {
                    //  console.warn("❌ SSE disconnected. Retrying in 5s...", err);
                    eventSource?.close();
                    if (!isCancelled) {
                        setTimeout(connectSSE, 5000);
                    }
                };
            } catch (err) {
                //  console.error("❌ SSE connection failed:", err);
            }
        };

        connectSSE();

        return () => {
            isCancelled = true;
            eventSource?.close();
        };
    }, [userDetails?.id, token]);



    // Fetch Event Details
    const fetchCurrentEventDetails = async () => {
        try {
            const res = await axiosInstance.get(`/user/event/current`);
            setCurrentEventData(res.data);
        } catch (error) {
        }
    };
    useEffect(() => {
        fetchCurrentEventDetails();
    }, []);

    //fetch challenge categories data
    const fetchChallengeCategories = async () => {
        try {
            const res = await axiosInstance.get(`/user/event/${currentEventData.id}/challengeCategory`);
            setChallengesCategory(res.data);
        } catch (error) {
        }
    };


    useEffect(() => {
        if (currentEventData?.id) {
            fetchAllChallenges();
        }
    }, [currentEventData]);

    //for event time formatting
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
            const res = await axiosInstance.get(`user/server/time`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setServerTime(res.data);
        } catch (error) {
           // console.error('Failed to fetch server time:', error);
        }
    };
    useEffect(() => {
        const interval = setInterval(() => {
            fetchServerTime();
        }, 10000); // fetch every 10 seconds

        // initial fetch
        fetchServerTime();

        return () => clearInterval(interval);
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
        if (endTimeLeft <= 0 && startTimeLeft <= 0) {
            const timeout = setTimeout(() => {
                navigate("/Dashboard");
            }, 1000);
            return () => clearTimeout(timeout);
        }
    }, [endTimeLeft, startTimeLeft, navigate]);


    // Leave Event
    const handleLeaveEvent = async () => {
        try {
            const res = await axiosInstance.post(`${url}/user/event/${currentEventData.id}/leave`, {});
            toast.success(res.data)
            navigate("/Dashboard");
        } catch (error) {
            toast.error(error.response?.data)
        }
    };

    const handleChallengeClick = (category, challenge, index) => {
        setSelectedCategory(category);
        setCurrentChallengeIndex(index);
        setSelectedChallenge(challenge)
        setIsModalOpen(true);
    };
    const closeModal = () => {
        setIsModalOpen(false);
        setChallengeSolution("");
    };

    const [openWarningSubmitModal, setOpenWarningSubmitModal] = useState(false);
    const [openWarningSubmitMessage, setOpenWarningSubmitMessage] = useState("");
    const [pendingChallengeId, setPendingChallengeId] = useState(null);
    const [submitLoading, setSubmitLoading] = useState(false)
    const [showCorrectSubmissionModal, setShowCorrectSubmissionModal] = useState(false)
    const [showInCorrectSubmissionModal, setShowInCorrectSubmissionModal] = useState(false)
    const handleChallengeSubmit = async (id, force = false) => {
        try {
            setSubmitLoading(true)
            const res = await axiosInstance.post(`/user/event/${currentEventData.id}/challenge/${id}/submission`,
                { solution: challengeSolution, ...(force && { forceSubmit: true }) },
            );

            //setChallengeSolution("");
            const categoryId = selectedCategory.id;
            const categoryRef = categoryRefs.current[categoryId];

            if (categoryRef?.refetchChallenges) {
                const updatedChallenges = await categoryRef.refetchChallenges();
                const updatedChallenge = updatedChallenges.find(c => c.id === id);
                if (updatedChallenge) {
                    setSelectedChallenge(updatedChallenge);
                    if (updatedChallenge.status) {
                        setShowCorrectSubmissionModal(true)

                    } else {
                        setShowInCorrectSubmissionModal(true)
                    }
                }
            }
            setChallengeSolution("")

        } catch (error) {
            if (error.response?.data?.warning) {
                setOpenWarningSubmitMessage(error.response.data.message);
                setOpenWarningSubmitModal(true);
                setPendingChallengeId(id); // store challenge ID for later use
            } else {
                toast.error(error.response?.data || "Error submitting challenge.");
            }
        } finally {
            setSubmitLoading(false)
        }
    };

    const fetchHintFromServer = async () => {
        try {
            const res = await axiosInstance.post(`/user/challenge/${selectedChallenge.id}/hint/view`);
            return res.data;
        } catch (error) {
            return "Error fetching hint.";
        }
    };
    const handleViewHint = async () => {
        if (selectedChallenge.hintViewed) {
            const fetched = await fetchHintFromServer();
            setHint(fetched);
            setShowHint(true);
        } else {
            setIsHintModalOpen(true);
        }
    };
    const confirmViewHint = async () => {
        const fetched = await fetchHintFromServer();
        setHint(fetched);
        setShowHint(true);

        setIsHintModalOpen(false);
        const categoryId = selectedCategory.id;
        const categoryRef = categoryRefs.current[categoryId];
        if (categoryRef?.refetchChallenges) {
            categoryRef.refetchChallenges();
        }
    };
    const cancelViewHint = () => setIsHintModalOpen(false);
    useEffect(() => {
        const autoFetchHint = async () => {
            if (selectedChallenge?.hintViewed) {
                const fetched = await fetchHintFromServer();
                setHint(fetched);
                setShowHint(true);
            } else {
                setHint("");      // reset hint if not yet viewed
                setShowHint(false);
            }
        };

        if (selectedChallenge?.id) {
            autoFetchHint();
        }
    }, [selectedChallenge]);

    const categoryRefs = useRef({});

    const handleDownloadFile = async () => {
        try {
            const token = localStorage.getItem("Token");
            const res = await axios.get(
                `${url}/user/challenge/${selectedChallenge.id}/file`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    responseType: "blob", // important for binary file download
                }
            );

            // Create a temporary URL and anchor to trigger the download
            const fileBlob = new Blob([res.data]);
            const downloadUrl = window.URL.createObjectURL(fileBlob);

            const link = document.createElement("a");
            link.href = downloadUrl;

            // Use filename from content-disposition header if available
            const disposition = res.headers["content-disposition"];
            let filename = "challenge_file";
            if (disposition && disposition.includes("filename=")) {
                filename = disposition.split("filename=")[1].replace(/['"]/g, "");
            }

            link.download = filename;
            document.body.appendChild(link);
            link.click();

            // Clean up
            link.remove();
            window.URL.revokeObjectURL(downloadUrl);

        } catch (error) {
            toast.error("Failed to download file. Please try again.");
        }
    };


    return (
        <div className="overflow-hidden ">
            <Sidebar value={openSidebar} setValue={setOpenSidebar} />

            <div className="flex flex-col w-full overflow-hidden ">
                <Navbar value={openSidebar} setValue={setOpenSidebar} />
                <ToastContainer />
                <div className={`text-gray-900 overflow-auto     w-full ${openSidebar ? 'pl-0 lg:pl-72' : ''} `}  >
                    <div className="flex items-center justify-between p-6">
                        <p className="text-red-600 font-Lexend_SemiBold">
                            {endTimeLeft > 0 ? formatTime(endTimeLeft) : "Redirecting..."}
                        </p>
                        <div className="flex items-center space-x-2">
                            <span className="w-20 h-0 border-2 rounded-full"></span>
                            <h1 className="text-4xl text-center font-Lexend_Bold">
                                {currentEventData?.name || "Event Challenges"}
                            </h1>
                            <span className="w-20 h-0 border-2 rounded-full"></span>
                        </div>
                        <button
                            className="px-2 py-1 text-white bg-red-600 rounded font-Lexend_SemiBold hover:bg-red-500"
                            onClick={() => handleLeaveEvent()}
                        >
                            Leave
                        </button>
                    </div>
                    {challengesCategory.map((category) => (
                        <CategoryChallenges
                            key={category.id}
                            ref={(el) => {
                                if (el) categoryRefs.current[category.id] = el;
                            }}
                            category={category}
                            eventData={currentEventData}
                            handleChallengeClick={handleChallengeClick}
                        />
                    ))}

                    {/* Modal for Challenge Details */}
                    <Modal
                        isOpen={isModalOpen}
                        onRequestClose={closeModal}
                        contentLabel="Challenge Details"
                        className="w-full max-w-xl p-1 mx-4 bg-white rounded-lg shadow-lg outline-none motion-preset-slide-down-sm"
                        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center outline-none"
                    >
                        <div className="flex items-center justify-end">
                            <button
                                onClick={closeModal}
                                className="text-xl font-bold rounded-full hover:text-slate-900 text-slate-600"
                            >
                                <IoCloseOutline size={25} />
                            </button>
                        </div>
                        {selectedCategory && selectedChallenge && (
                            <div className="relative w-full overflow-hidden">
                                <h2 className="text-center text-gray-800 font-Lexend_SemiBold">
                                    {selectedCategory.name}
                                    <p className="mx-4 mt-1 mb-3 border border-gray-700"></p>
                                </h2>
                                {/* Challenge Info Header */}
                                <div className="flex flex-col justify-between px-4 text-sm text-gray-600 sm:flex-row font-Lexend_Regular">
                                    <div className="flex items-center space-x-2">
                                        <p>Challenge</p>
                                        <p className="text-gray-900">
                                            {/* {selectedChallenge} of {selectedChallenges.length} */}
                                        </p>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <p>Attempts</p>
                                        <p className="text-gray-900" title="Attempts">
                                            {selectedChallenge?.attempt || 0}/{currentEventData.maxAttempt}
                                        </p>
                                    </div>
                                    <p>
                                        Status{" "}
                                        {selectedChallenge?.attempt > 0 ? (
                                            <span
                                                className={`font-semibold ${selectedChallenge?.status ? "text-green-500" : "text-red-500"
                                                    }`}
                                            >
                                                {selectedChallenge?.status ? "Correct" : "Incorrect"}
                                            </span>
                                        ) : (
                                            <span className="font-semibold text-violet-600">Unattempted</span>
                                        )}
                                    </p>
                                </div>
                                {/* Challenge Details */}
                                <div className="px-4 py-2 space-y-2 text-base">
                                    <div>
                                        <p className="text-center font-Lexend_Regular">{selectedChallenge.name}</p>
                                        <p className="my-2 text-base text-center font-Lexend_Regular"> {selectedChallenge.questionDescription}</p>
                                    </div>
                                    {selectedChallenge.hint && (
                                        <>
                                            <div className="flex items-center justify-center text-gray-700 font-Lexend_Regular">
                                                {selectedChallenge.hintViewed || showHint ? (
                                                    <div className="flex flex-col items-center justify-center ">
                                                        <p className="text-gray-700 whitespace-pre-line font-Lexend_Regular">
                                                            {hint || "No hint available."}
                                                        </p>
                                                        <p className="mt-2 text-sm font-medium text-center text-yellow-600">
                                                            ⚠️ You have viewed the hint. 20% of the points will be deducted from this challenge's score upon submission.
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <button
                                                        className="px-2 text-base text-white bg-gray-900 rounded bg-gradient-to-b from-gray-800 to-gray-900"
                                                        onClick={handleViewHint}
                                                    >
                                                        View Hint
                                                    </button>
                                                )}
                                            </div>
                                            <HintConfirmationModal
                                                isOpen={isHintModalOpen}
                                                onConfirm={confirmViewHint}
                                                onCancel={cancelViewHint}
                                            />
                                        </>
                                    )}
                                    {selectedChallenge.challengeFilePresent && (
                                        <div className="flex justify-center w-full text-gray-700 font-Lexend_Regular">
                                            <button
                                                className="px-2 text-white rounded shadow bg-gradient-to-b from-blue-600 to-blue-700"
                                                onClick={handleDownloadFile}
                                            >
                                                Download File
                                            </button>
                                        </div>
                                    )}
                                    {/* Answer Input */}
                                    <div className="flex flex-col py-2">
                                        {/* <label className="font-Lexend_SemiBold">Enter your flag</label> */}
                                        <textarea
                                            className="p-2 text-gray-700 border rounded shadow-inner bg-gray-50 font-Lexend_Light outline-gray-400"
                                            rows={1}
                                            placeholder="Enter your flag"
                                            value={challengeSolution}
                                            onChange={(e) => setChallengeSolution(e.target.value)}
                                        />
                                    </div>
                                    {/* Buttons */}
                                    <div className="flex items-center justify-end font-Lexend_Medium">
                                        <button
                                            className="px-2 py-1 text-white bg-gray-900 rounded bg-gradient-to-b from-gray-800 to-gray-900"
                                            onClick={() => handleChallengeSubmit(selectedChallenge.id)}
                                            disabled={submitLoading}
                                        >
                                            {submitLoading ? <PulseLoader size={15} color="#fff" /> : "Submit"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </Modal>
                    {openWarningSubmitModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                            <div className="p-5 bg-white rounded-lg shadow-lg w-96 font-Lexend_Regular motion-preset-slide-down-sm">
                                <h2 className="mb-4 text-lg font-semibold">Warning</h2>
                                <p className="mb-6 text-sm text-gray-700">{openWarningSubmitMessage}</p>
                                <div className="flex justify-end space-x-3 text-sm">
                                    <button
                                        className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                                        onClick={() => {
                                            setOpenWarningSubmitModal(false);
                                            setOpenWarningSubmitMessage("");
                                            setPendingChallengeId(null);
                                        }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        className="px-4 py-2 text-white bg-red-600 rounded hover:bg-red-500"
                                        onClick={() => {
                                            if (pendingChallengeId) {
                                                handleChallengeSubmit(pendingChallengeId, true); // Force submit
                                                setOpenWarningSubmitModal(false);
                                                setOpenWarningSubmitMessage("");
                                                setPendingChallengeId(null);
                                            }
                                        }}
                                    >
                                        Submit Anyway
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                    {showCorrectSubmissionModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black bg-opacity-50">
                            <div className="w-full max-w-xs p-6 text-center bg-white rounded-lg shadow-lg sm:max-w-sm font-Lexend_Regular motion-preset-slide-down-sm">
                                <FontAwesomeIcon
                                    icon={faCircleCheck}
                                    className="w-10 h-10 mx-auto text-green-500"
                                />
                                <h2 className="text-xl text-green-600 font-Lexend_SemiBold ">
                                    Congratulation
                                </h2>
                                <p className="text-sm text-gray-600">
                                    Great job! Your answer is correct.
                                </p>
                                <p className="text-sm text-gray-700">
                                    {currentEventData?.teamCreationAllowed ? "Your team" : "You"} earned {selectedChallenge?.maxMarks} {selectedChallenge?.maxMarks === 1 ? "point" : "points"}!
                                </p>
                                <p className="text-sm text-gray-600">
                                    Keep it up and aim for the top!
                                </p>

                                <button
                                    onClick={() => {
                                        setShowCorrectSubmissionModal(false)
                                        closeModal()
                                    }}
                                    className="px-6 py-2 mt-4 text-sm text-white transition bg-green-600 rounded hover:bg-green-700"
                                >
                                    Continue
                                </button>
                            </div>
                        </div>
                    )}
                    {showInCorrectSubmissionModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black bg-opacity-50">
                            <div className="w-full max-w-xs p-6 text-center bg-white rounded-lg shadow-lg sm:max-w-sm font-Lexend_Regular motion-preset-slide-down-sm" >
                                <FontAwesomeIcon
                                    icon={faCircleXmark}
                                    className="w-10 h-10 mx-auto text-red-500"
                                    onClick={() => setShowInCorrectSubmissionModal(false)}
                                />
                                <h2 className="text-xl text-red-600 font-Lexend_SemiBold">
                                    {selectedChallenge?.attempt < currentEventData.maxAttempt
                                        ? "Incorrect Submission"
                                        : "Attempt Limit Reached"}
                                </h2>
                                <p className="text-sm text-gray-600">
                                    {selectedChallenge?.attempt < currentEventData.maxAttempt
                                        ? "Oops! Your answer was incorrect. Don't give up — review the challenge and try again!"
                                        : "Oops! You’ve used all your attempts for this challenge."}
                                </p>
                                {selectedChallenge?.attempt < currentEventData.maxAttempt ? <button
                                    onClick={() => {
                                        setShowInCorrectSubmissionModal(false)
                                    }}
                                    className={`px-6 py-2 mt-4 text-sm text-white transition rounded bg-red-600 hover:bg-red-700`}
                                >
                                    Try Again
                                </button> :
                                    <button
                                        onClick={() => {
                                            setShowInCorrectSubmissionModal(false)
                                            closeModal()
                                        }}
                                        className={`px-6 py-2 mt-4 text-sm text-white transition rounded bg-gray-600 hover:bg-gray-700`}
                                    >
                                        Close
                                    </button>}
                            </div>
                        </div>
                    )}


                </div>
            </div>
        </div>
    );

}

const CategoryChallenges = forwardRef(({ category, eventData, handleChallengeClick, index }, ref) => {
    const [showDescription, setShowDescription] = useState(false);
    const iconRef = useRef();
    const [challenges, setChallenges] = useState([]);
    const [hasMore, setHasMore] = useState(true);
    const loaderRef = useRef();

    const token = localStorage.getItem("Token");

    const fetchChallenges = async () => {
        try {
            const res = await axios.get(
                `${url}/user/challengeCategory/${category.id}/challenge/assigned`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            const newChallenges = res.data || [];

            // Create unique list
            const uniqueChallenges = Array.from(
                new Map(
                    [...challenges, ...newChallenges].map(ch => [ch.id, ch])
                ).values()
            );

            setChallenges(uniqueChallenges);
            setHasMore(newChallenges.length > 0);

            return uniqueChallenges; // ✅ important

        } catch (error) {
            return [];
        }
    };

    useImperativeHandle(ref, () => ({
        refetchChallenges: fetchChallenges,
    }));

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries, obs) => {
                if (entries[0].isIntersecting && hasMore && challenges.length === 0) {
                    fetchChallenges();
                    obs.unobserve(entries[0].target);
                }
            },
            { threshold: 1.0 }
        );

        const currentRef = loaderRef.current;
        if (currentRef) observer.observe(currentRef);

        return () => {
            if (currentRef) observer.unobserve(currentRef);
        };
    }, [hasMore, challenges.length]);

    return (
        <div className="p-6">
            <div className="relative pb-3">
                <div className="flex items-center space-x-1">
                    <p className="pr-1 font-Lexend_Bold">{category.name.toUpperCase()}</p>

                    <FontAwesomeIcon
                        icon={faInfoCircle}
                        size="lg"
                        id={`info-icon-${category.id}`}
                        className="outline-none cursor-pointer"
                        onMouseEnter={() => setShowDescription(true)}
                        onMouseLeave={() => setShowDescription(false)}
                    />

                    <span className="w-full h-0 border-2 rounded-full"></span>
                </div>

                <Tooltip
                    anchorId={`info-icon-${category.id}`}
                    place="bottom-start"
                    isOpen={showDescription}
                    classNameArrow=" !border-gray-400 border-r border-b"
                    className="!w-1/2 !max-w-lg !bg-white !text-gray-800 !shadow-md !rounded-md !px-4 !py-2 !text-sm !font-medium !border !border-gray-400 !opacity-100 z-50"
                >
                    {category.description}
                </Tooltip>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                {challenges?.length > 0 ? (
                    challenges.map((challenge, idx) => {
                        return (
                            <div
                                key={idx}
                                className="shadow-md rounded-md px-3 pb-5 pt-2 bg-gray-900 bg-gradient-to-b from-gray-800 to-gray-900 cursor-pointer text-white font-Lexend_Regular text-center flex flex-col justify-between hover:shadow-lg transition-transform transform hover:-translate-y-0.5"
                                onClick={() => handleChallengeClick(category, challenge, idx)}
                            >

                                <div>
                                    <p className="text-xs text-end font-Lexend_Light" title="Attempts">
                                        {challenge.attempt}/{eventData.maxAttempt}
                                    </p>
                                </div>


                                <p className="text-sm text-gray-600">

                                    {challenge.attempt > 0 ? (
                                        <span
                                            className={`font-semibold ${challenge.status ? "text-green-500" : "text-red-500"}`}
                                        >
                                            {challenge.status ? "Correct" : "Incorrect"}
                                        </span>
                                    ) : (
                                        <span
                                            className={`font-regular text-violet-400`}
                                        >
                                            Unattempted
                                        </span>
                                    )}

                                </p>


                                <p className="py-1 text-lg font-medium text-white rounded">
                                    {challenge.name}
                                </p>
                                <p className="pb-1 text-gray-400">{challenge.difficulty}</p>

                                <p className="mt-2 text-sm">
                                    <span className="p-2 font-semibold text-white bg-gray-800 rounded">
                                        {challenge.maxMarks} pts
                                    </span>
                                </p>
                            </div>
                        );
                    })
                ) : (
                    <p className="text-gray-500 col-span-full">No challenges available.</p>
                )}


                <div className="mt-4 text-center col-span-full" ref={loaderRef}>
                    {hasMore && <p className="text-gray-400"></p>}
                </div>
            </div>
        </div>
    );
});

const HintConfirmationModal = ({ isOpen, onConfirm, onCancel }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="w-full max-w-xs p-6 bg-white rounded-lg shadow-md motion-preset-slide-down-sm">
                <h2 className="mb-2 text-lg text-gray-800 font-Lexend_Bold">View Hint?</h2>
                <p className="text-sm text-gray-700 font-Lexend_Regular">
                    Viewing the hint will result in a 20% point deduction for this challenge. Are you sure you want to continue?
                </p>
                <div className="flex justify-end mt-4 space-x-3 font-Lexend_Regular">
                    <button
                        className="px-4 py-1 text-gray-800 bg-gray-200 rounded hover:bg-gray-300"
                        onClick={onCancel}
                    >
                        Cancel
                    </button>
                    <button
                        className="px-4 py-1 text-white bg-red-600 rounded hover:bg-red-700"
                        onClick={onConfirm}
                    >
                        Yes, Show Hint
                    </button>
                </div>
            </div>
        </div>
    );
};
export default EventChallenges