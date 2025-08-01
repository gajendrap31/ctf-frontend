
import Sidebar from "../Sidebar"
import Navbar from "../Navbar"
import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { url } from "../../Authentication/Utility";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AsyncPaginate } from "react-select-async-paginate";
import { useRef } from "react";

import 'react-toastify/dist/ReactToastify.css';
import Pagination from "./Pagination";
import { useNavigate } from "react-router-dom";
import AuthService from "../../Authentication/AuthService";
import { RegisteredUserTable, MobileRegisteredUserCards } from "../Tables/Report/RegisteredUserByEventTable";
import { MobileOrganisationCards, OrganisationTable } from "../Tables/Report/OrganisationTable";
import { MobileState_UTCards, State_UTTable } from "../Tables/Report/State_UTTable";
import { IoCloseSharp } from "react-icons/io5";
import { MobileOrganisationUsersCards, OrganisationUsersTable } from "../Tables/Report/OrganisationUsersTable";
import { MobileState_UTUsersCards, State_UTUsersTable } from "../Tables/Report/StateUsersTable";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

function Report({ userDetails }) {

    const [open, setOpen] = useState(true);
    const navigate = useNavigate()
    const [registeredUsers, setRegisteredUsers] = useState([])
    const [participatedUsers, setParticipatedUsers] = useState([])
    const [userByOrganisation, setUserByOrganisation] = useState([])
    const [stateByUsers, setStateByUsers] = useState([])

    const token = useMemo(() => AuthService.getToken(), []);
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

    const fetchRegisteredUserByEvent = async () => {
        try {
            const res = await axiosInstance.get(`admin/report/user`)
            setRegisteredUsers(res.data)
        } catch (error) {

        }
    }

    const fetchParticipatedUserByEvent = async (participated) => {
        try {
            const res = await axiosInstance.get(`admin/report/user`, {
                params: {
                    participated: participated
                },
            })
            setParticipatedUsers(res.data)
        } catch (error) {

        }
    }
    const fetchUserByOrganisation = async (eventId) => {
        try {
            const res = await axiosInstance.get(`admin/report/organisation`, {
                params: {
                    eventId: eventId,
                },
            });
            setUserByOrganisation(res.data)
        } catch (error) {

        }
    }

    const fetchStateUT = async (eventId) => {
        try {
            const res = await axiosInstance.get(`admin/report/stateAndUT`, {
                params: {
                    eventId: eventId,
                },
            });
            setStateByUsers(res.data)
        } catch (error) {

        }
    }

    useEffect(() => {
        fetchRegisteredUserByEvent();
        fetchParticipatedUserByEvent(true)
        fetchUserByOrganisation();
        fetchStateUT()
    }, []);

    return (
        <div className="overflow-hidden ">
            <Sidebar open={open} name={userDetails.username} value={open} setValue={setOpen} />

            <div className="flex flex-col w-full overflow-hidden text-sm ">
                <Navbar name={userDetails.name} value={open} setValue={setOpen} />
                <ToastContainer />
                <div className={`text-gray-900 min-h-lvh  w-full ${open ? 'pl-0 lg:pl-72' : ''} `} >
                    <div className="flex items-center justify-center p-3 py-2 m-4 bg-gray-100 rounded">
                        <p className="px-8 py-1 text-2xl text-gray-800 rounded font-Lexend_Bold"> CTF Event Reports </p>
                    </div>
                    <div className="mx-4 rounded ">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <div className="p-6 transition-shadow bg-white border border-blue-100 shadow-lg rounded-2xl hover:shadow-xl ">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-slate-600">Total Registered Users</p>
                                        <p className="mt-2 text-3xl font-bold text-blue-900">{registeredUsers?.totalElements || 0}</p>

                                    </div>
                                    <div className="p-3 bg-blue-100 rounded-xl">
                                        <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 transition-shadow bg-white border border-purple-100 shadow-lg rounded-2xl hover:shadow-xl">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-slate-600">Participated Users</p>
                                        <p className="mt-2 text-3xl font-bold text-purple-900">{participatedUsers?.totalElements || 0}</p>

                                    </div>
                                    <div className="p-3 bg-purple-100 rounded-xl">
                                        <svg className="w-8 h-8 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 transition-shadow bg-white border border-indigo-100 shadow-lg rounded-2xl hover:shadow-xl">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-slate-600">Total Organizations</p>
                                        <p className="mt-2 text-3xl font-bold text-indigo-900">{userByOrganisation?.totalElements || 0}</p>

                                    </div>
                                    <div className="p-3 bg-indigo-100 rounded-xl">
                                        <svg className="w-8 h-8 text-indigo-600" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 transition-shadow bg-white border shadow-lg rounded-2xl border-cyan-100 hover:shadow-xl">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-slate-600">States/UTs Represented</p>
                                        <p className="mt-2 text-3xl font-bold text-cyan-900">{stateByUsers?.totalElements || 0}</p>

                                    </div>
                                    <div className="p-3 bg-cyan-100 rounded-xl">
                                        <svg className="w-8 h-8 text-cyan-600" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="py-4">
                            <PerformanceActivate
                                axiosInstance={axiosInstance}
                            />
                        </div>

                    </div>
                </div>

            </div>
        </div>
    )
}


const PerformanceActivate = ({
    axiosInstance
}) => {
    const [activeTab, setActiveTab] = useState(0);
    return (
        <div className="flex w-full px-2 sm:px-0">
            <div className="w-full p-2 bg-white border rounded-lg min-h-[400px]">
                <div className="mb-2 border-b">
                    <div className="flex">
                        {["Registered Users", "Organisation", "State & Union Territory"].map((label, i) => (
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
                <div className="overflow-x-auto">
                    {activeTab === 0 && (
                        <RegisteredUsers axiosInstance={axiosInstance} />
                    )}
                    {activeTab === 1 && (
                        <Organisations axiosInstance={axiosInstance} />
                    )}
                    {activeTab === 2 && (
                        <State_UT axiosInstance={axiosInstance} />
                    )}
                </div>
            </div>
        </div>

    );
};


const RegisteredUsers = ({ axiosInstance }) => {
    const [registeredUsers, setRegisteredUsers] = useState([])
    const [selectedEvent, setSelectedEvent] = useState()
    const [selectedEventName, setSelectedEventName] = useState()
    const [isParticipated, setIsParticipated] = useState(true)
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchKey, setSearchKey] = useState("");
    const [sortBy, setSortBy] = useState(0);
    const [sortDirection, setSortDirection] = useState('ASC');
    const [tableLoading, setTableLoading] = useState(false)

    const handleSort = (columnIndex) => {
        setCurrentPage(1)
        if (sortBy === columnIndex) {
            setSortDirection(prev => (prev === 'ASC' ? 'DESC' : 'ASC'));
        } else {
            setSortBy(columnIndex);
            setSortDirection('ASC');
        }
    };
    const fetchRegisteredUserByEvent = async () => {
        try {
            setTableLoading(true)
            const res = await axiosInstance.get(`admin/report/user`, {
                params: {
                    eventId: selectedEvent,
                    participated: isParticipated,
                    page: currentPage - 1,
                    size: rowsPerPage,
                    sortBy,
                    direction: sortDirection,
                    searchTerm: searchKey,
                }
            })
            setRegisteredUsers(res.data)
        } catch (error) {

        } finally {
            setTableLoading(false)
        }
    }

    useEffect(() => {
        fetchRegisteredUserByEvent(selectedEvent);
    }, [selectedEvent, currentPage, rowsPerPage, sortBy, sortDirection, searchKey, isParticipated]);

    const handleDownloadExcel = async () => {

        try {
            let allUsers = [];
            let page = 0;
            const size = 100;
            let totalPages = 1;

            do {
                const res = await axiosInstance.get(`admin/report/user`, {
                    params: {
                        eventId: selectedEvent,
                        participated: isParticipated,
                        page,
                        size,
                        sortBy,
                        direction: sortDirection,
                        searchTerm: searchKey,
                    }
                });

                const { content, totalPages: tp } = res.data;
                allUsers = [...allUsers, ...content];
                totalPages = tp;
                page++;
            } while (page < totalPages);

            if (allUsers.length === 0) {
                toast.warn("Registered Users is not available");
                return;
            }

            const dataToExport = allUsers.map(user => ({
                Name: user.fullName,
                Email: user.email,
                Phone: user.mobile,
                Organization: user.organisation?.name || "N/A",
                State: user.organisation?.stateAndUT?.name || "N/A",
                Participated: user.participated ? "Yes" : "No",
            }));

            const worksheet = XLSX.utils.json_to_sheet(dataToExport);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Registered Users");

            const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
            const fileData = new Blob([excelBuffer], { type: "application/octet-stream" });
            saveAs(fileData, `RegisteredUsers_${selectedEventName || 'AllEvents'}.xlsx`);
        } catch (error) {
            toast.error("Failed to download. Please try again.");
        }
    };


    return (
        <div className="w-full px-2 rounded-lg min-h-[400px] sm:px-0 font-Lexend_Regular">
            <div className="grid grid-cols-1 ">
                <div className="flex justify-end">
                    <button
                        onClick={handleDownloadExcel}
                        className="px-4 py-2 text-white transition bg-blue-600 rounded w-fit hover:bg-blue-700"
                    >
                        Download Excel
                    </button>
                </div>
                <div className="flex flex-col items-center justify-between gap-4 mt-4 mb-2 lg:flex-row font-Lexend_Regular">
                    <div className="flex flex-col items-center gap-2 sm:flex-row ">
                        <EventSelector
                            selectedEvent={selectedEvent}
                            setSelectedEvent={setSelectedEvent}
                            setSelectedEventName={setSelectedEventName}
                        />
                    </div>
                    <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                        <div className="flex items-center gap-3">
                            <p>Has Participated</p>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={isParticipated}
                                    onChange={() => setIsParticipated(!isParticipated)}
                                />
                                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-gray-500 rounded-full peer dark:bg-gray-600 peer-checked:bg-gray-700 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
                            </label>
                        </div>
                        <div className="flex space-x-2">
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
                                className="p-2 bg-white border border-gray-300 rounded"
                            >
                                {[10, 20, 50, 100].map((num, index) => (
                                    <option key={index} value={num}>{num}</option>
                                ))}
                            </select>
                        </div>

                    </div>
                </div>
                <div>
                    <>
                        <RegisteredUserTable
                            users={registeredUsers}
                            currentPage={currentPage}
                            rowsPerPage={rowsPerPage}
                            sortBy={sortBy}
                            sortDirection={sortDirection}
                            setSortBy={setSortBy}
                            setSortDirection={setSortDirection}
                            handleSort={handleSort}
                            isLoading={tableLoading}
                        />
                        <MobileRegisteredUserCards
                            users={registeredUsers}
                            currentPage={currentPage}
                            setCurrentPage={setCurrentPage}
                            rowsPerPage={rowsPerPage}
                            sortBy={sortBy}
                            sortDirection={sortDirection}
                            setSortBy={setSortBy}
                            setSortDirection={setSortDirection}
                            isLoading={tableLoading}
                        />
                    </>
                    {registeredUsers.totalPages > 0 &&
                        <Pagination
                            totalItems={registeredUsers.totalElements}
                            totalPages={registeredUsers.totalPages}
                            currentPage={currentPage}
                            itemsPerPage={rowsPerPage}
                            setCurrentPage={setCurrentPage}
                        />
                    }
                </div>

            </div>
        </div>

    );
};

const Organisations = ({ axiosInstance }) => {
    const [organisations, setOrganisations] = useState([])
    const [modalViewUsers, setModalViewUsers] = useState(false)
    const [selectedOrganisation, setSelectedOrganisation] = useState(0)
    const [selectedOrganisationName, setSelectedOrganisationName] = useState(0)
    const [selectedEvent, setSelectedEvent] = useState()
    const [selectedEventName, setSelectedEventName] = useState()
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchKey, setSearchKey] = useState("");
    const [sortBy, setSortBy] = useState(0);
    const [sortDirection, setSortDirection] = useState('ASC');
    const [tableLoading, setTableLoading] = useState(false)

    const handleSort = (columnIndex) => {
        setCurrentPage(1)
        if (sortBy === columnIndex) {
            setSortDirection(prev => (prev === 'ASC' ? 'DESC' : 'ASC'));
        } else {
            setSortBy(columnIndex);
            setSortDirection('ASC');
        }
    };
    const fetchOrganisation = async () => {
        try {
            setTableLoading(true)
            const res = await axiosInstance.get(`admin/report/organisation`, {
                params: {
                    eventId: selectedEvent,
                    page: currentPage - 1,
                    size: rowsPerPage,
                    sortBy,
                    direction: sortDirection,
                    searchTerm: searchKey,
                }
            })
            setOrganisations(res.data)
        } catch (error) {

        } finally {
            setTableLoading(false)
        }
    }
    useEffect(() => {
        fetchOrganisation(selectedEvent);
    }, [selectedEvent, currentPage, rowsPerPage, sortBy, sortDirection, searchKey]);

    const handleDownloadExcel = async () => {

        try {
            let allOrganisatons = [];
            let page = 0;
            const size = 100;
            let totalPages = 1;

            do {
                const res = await axiosInstance.get(`admin/report/organisation`, {
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
                allOrganisatons = [...allOrganisatons, ...content];
                totalPages = tp;
                page++;
            } while (page < totalPages);

            if (allOrganisatons.length === 0) {
                toast.warn("Organisations is not available to export");
                return;
            }

            const dataToExport = allOrganisatons.map(org => ({
                Name: org.name,
                Place: org.place,
                State: org.stateAndUT.name,
                Type: org.organisationType,
            }));

            const worksheet = XLSX.utils.json_to_sheet(dataToExport);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Organisations");

            const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
            const fileData = new Blob([excelBuffer], { type: "application/octet-stream" });
            saveAs(fileData, `Organisations_${selectedEventName || 'AllEvents'}.xlsx`);
        } catch (error) {
            toast.error("Failed to download. Please try again.");
        }
    };
    return (
        <div className="w-full px-2 rounded-lg sm:px-0 font-Lexend_Regular min-h-[400px]">
            <div className="grid grid-cols-1 ">
                <div className="flex justify-end">
                    <button
                        onClick={handleDownloadExcel}
                        className="px-4 py-2 text-white transition bg-blue-600 rounded w-fit hover:bg-blue-700"
                    >
                        Download Excel
                    </button>
                </div>
                <div className="flex flex-col items-center justify-between gap-4 mt-4 mb-2 md:flex-row font-Lexend_Regular">
                    <div className="flex flex-col items-center gap-2 sm:flex-row ">
                        <EventSelector
                            selectedEvent={selectedEvent}
                            setSelectedEvent={setSelectedEvent}
                            setSelectedEventName={setSelectedEventName}
                        />
                    </div>
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
                            className="p-2 bg-white border border-gray-300 rounded"
                        >
                            {[10, 20, 50, 100].map((num, index) => (
                                <option key={index} value={num}>{num}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <div>
                    <>
                        <OrganisationTable
                            organisation={organisations}
                            currentPage={currentPage}
                            rowsPerPage={rowsPerPage}
                            sortBy={sortBy}
                            sortDirection={sortDirection}
                            handleSort={handleSort}
                            setModalViewUsers={setModalViewUsers}
                            setSelectedOrganisation={setSelectedOrganisation}
                            setSelectedOrganisationName={setSelectedOrganisationName}
                            isLoading={tableLoading}
                        />
                        <MobileOrganisationCards
                            organisation={organisations}
                            currentPage={currentPage}
                            setCurrentPage={setCurrentPage}
                            rowsPerPage={rowsPerPage}
                            sortBy={sortBy}
                            sortDirection={sortDirection}
                            setSortBy={setSortBy}
                            setSortDirection={setSortDirection}
                            isLoading={tableLoading}
                            setSelectedOrganisation={setSelectedOrganisation}
                            setSelectedOrganisationName={setSelectedOrganisationName}
                            setModalViewUsers={setModalViewUsers}
                        />
                    </>
                    {organisations.totalPages > 0 &&
                        <Pagination
                            totalItems={organisations.totalElements}
                            totalPages={organisations.totalPages}
                            currentPage={currentPage}
                            itemsPerPage={rowsPerPage}
                            setCurrentPage={setCurrentPage}
                        />
                    }
                </div>


            </div>
            {modalViewUsers && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 ">
                    <div className="bg-white  rounded-lg shadow-lg font-Lexend_Regular max-h-[90vh] w-full max-w-7xl overflow-hidden mx-4 p-2 motion-preset-slide-down-sm">
                        <div className="flex justify-end ">
                            <IoCloseSharp
                                size={24}
                                className="cursor-pointer hover:text-gray-600"
                                onClick={() => setModalViewUsers(false)}
                            />
                        </div>
                        <div className="px-2 pb-4 overflow-y-auto overflow-x-auto h-[80vh] ">
                            <div className="flex justify-center mt-4">
                                <OrganisationUsers
                                    axiosInstance={axiosInstance}
                                    selectedOrganisation={selectedOrganisation}
                                    selectedOrganisationName={selectedOrganisationName}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

const OrganisationUsers = ({ axiosInstance, selectedOrganisation, selectedOrganisationName }) => {
    const [organisationUsers, setOrganisationUsers] = useState([])
    const [selectedEvent, setSelectedEvent] = useState()
    const [selectedEventName, setSelectedEventName] = useState()
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchKey, setSearchKey] = useState("");
    const [sortBy, setSortBy] = useState(0);
    const [sortDirection, setSortDirection] = useState('ASC');
    const [tableLoading, setTableLoading] = useState(false)

    const handleSort = (columnIndex) => {
        setCurrentPage(1)
        if (sortBy === columnIndex) {
            setSortDirection(prev => (prev === 'ASC' ? 'DESC' : 'ASC'));
        } else {
            setSortBy(columnIndex);
            setSortDirection('ASC');
        }
    };

    const fetchUsersByOrganisation = async () => {
        try {
            setTableLoading(true)
            const res = await axiosInstance.get(`admin/report/organisation/${selectedOrganisation}/users`, {
                params: {
                    eventId: selectedEvent,
                    page: currentPage - 1,
                    size: rowsPerPage,
                    sortBy,
                    direction: sortDirection,
                    searchTerm: searchKey,
                }
            })
            setOrganisationUsers(res.data)
        } catch (error) {

        } finally {
            setTableLoading(false)
        }
    }

    useEffect(() => {

        fetchUsersByOrganisation(selectedEvent);

    }, [selectedEvent, currentPage, rowsPerPage, sortBy, sortDirection, searchKey]);

    const handleDownloadExcel = async () => {

        try {
            let allUsersByOrganisaton = [];
            let page = 0;
            const size = 100;
            let totalPages = 1;

            do {
                const res = await axiosInstance.get(`admin/report/organisation/${selectedOrganisation}/users`, {
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
                allUsersByOrganisaton = [...allUsersByOrganisaton, ...content];
                totalPages = tp;
                page++;
            } while (page < totalPages);

            if (allUsersByOrganisaton.length === 0) {
                toast.warn(`No users registered from ${selectedOrganisationName} ${selectedEventName ? (`for  ${selectedEventName}`) : ""}`);
                return;
            }

            const dataToExport = allUsersByOrganisaton.map(user => ({
                Name: user.fullName,
                Email: user.email,
                Mobile: user.mobile,
                User_Type: user.userType,
            }));

            const worksheet = XLSX.utils.json_to_sheet(dataToExport);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Organisation Users");

            const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
            const fileData = new Blob([excelBuffer], { type: "application/octet-stream" });
            saveAs(fileData, `Organisation_Users_${selectedOrganisationName}_${selectedEventName || 'AllEvents'}.xlsx`);
        } catch (error) {
            toast.error("Failed to download. Please try again.");
        }
    };
    return (
        <div className="w-full px-2 rounded-lg sm:px-0 font-Lexend_Regular min-h-[400px]">
            <div className="grid grid-cols-1 ">
                <div className="flex flex-col items-center justify-start space-y-3 sm:justify-between sm:flex-row sm:space-y-0">
                    <p className="text-base text-gray-500 font-Lexend_SemiBold">All Registered from <span className="text-gray-900">{selectedOrganisationName}</span></p>
                    <button
                        onClick={handleDownloadExcel}
                        className="px-4 py-2 text-white transition bg-blue-600 rounded w-fit hover:bg-blue-700"
                    >
                        Download Excel
                    </button>
                </div>
                <div className="flex flex-col items-center justify-between gap-4 mt-4 mb-2 md:flex-row font-Lexend_Regular">

                    <div className="flex flex-col items-center gap-2 sm:flex-row ">

                        <EventSelector
                            selectedEvent={selectedEvent}
                            setSelectedEvent={setSelectedEvent}
                            setSelectedEventName={setSelectedEventName}
                        />
                    </div>


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
                            className="p-2 bg-white border border-gray-300 rounded"
                        >
                            {[10, 20, 50, 100].map((num, index) => (
                                <option key={index} value={num}>{num}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <>
                    <OrganisationUsersTable
                        organisationUsers={organisationUsers}
                        currentPage={currentPage}
                        rowsPerPage={rowsPerPage}
                        sortBy={sortBy}
                        sortDirection={sortDirection}
                        handleSort={handleSort}
                        isLoading={tableLoading}
                    />
                    <MobileOrganisationUsersCards
                        organisationUsers={organisationUsers}
                        currentPage={currentPage}
                        setCurrentPage={setCurrentPage}
                        rowsPerPage={rowsPerPage}
                        sortBy={sortBy}
                        sortDirection={sortDirection}
                        setSortBy={setSortBy}
                        setSortDirection={setSortDirection}
                        isLoading={tableLoading}
                    />
                </>
                {organisationUsers.totalPages > 0 &&
                    <Pagination
                        totalItems={organisationUsers.totalElements}
                        totalPages={organisationUsers.totalPages}
                        currentPage={currentPage}
                        itemsPerPage={rowsPerPage}
                        setCurrentPage={setCurrentPage}
                    />
                }

            </div>
        </div>
    )
}

const State_UT = ({ axiosInstance }) => {
    const [states_UT, setStates_UT] = useState([])
    const [modalViewUsers, setModalViewUsers] = useState(false)
    const [selectedState_UT, setSelectedState_UT] = useState(0)
    const [selectedState_UTName, setSelectedState_UTName] = useState(0)
    const [selectedEvent, setSelectedEvent] = useState()
    const [selectedEventName, setSelectedEventName] = useState()
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchKey, setSearchKey] = useState("");
    const [sortBy, setSortBy] = useState(0);
    const [sortDirection, setSortDirection] = useState('ASC');
    const [tableLoading, setTableLoading] = useState(false)

    const handleSort = (columnIndex) => {
        setCurrentPage(1)
        if (sortBy === columnIndex) {
            setSortDirection(prev => (prev === 'ASC' ? 'DESC' : 'ASC'));
        } else {
            setSortBy(columnIndex);
            setSortDirection('ASC');
        }
    };
    const fetchState_UT = async () => {
        try {
            setTableLoading(true)
            const res = await axiosInstance.get(`admin/report/stateAndUT`, {
                params: {
                    eventId: selectedEvent,
                    page: currentPage - 1,
                    size: rowsPerPage,
                    sortBy,
                    direction: sortDirection,
                    searchTerm: searchKey,
                }
            })
            setStates_UT(res.data)
        } catch (error) {

        } finally {
            setTableLoading(false)
        }
    }
    useEffect(() => {

        fetchState_UT(selectedEvent);

    }, [selectedEvent, currentPage, rowsPerPage, sortBy, sortDirection, searchKey]);

    const handleDownloadExcel = async () => {

        try {
            let allState_UT = [];
            let page = 0;
            const size = 100;
            let totalPages = 1;

            do {
                const res = await axiosInstance.get(`admin/report/stateAndUT`, {
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
                allState_UT = [...allState_UT, ...content];
                totalPages = tp;
                page++;
            } while (page < totalPages);

            if (allState_UT.length === 0) {
                toast.warn("States or Union Territories is not available to export");
                return;
            }

            const dataToExport = allState_UT.map(state => ({
                Name: state.name,
                Type: state.type,
                Total_Registered_Users: state.totalRegisteredUsers,
            }));

            const worksheet = XLSX.utils.json_to_sheet(dataToExport);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "State_UT");

            const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
            const fileData = new Blob([excelBuffer], { type: "application/octet-stream" });
            saveAs(fileData, `State_UT_${selectedEventName || 'AllEvents'}.xlsx`);
        } catch (error) {
            toast.error("Failed to download. Please try again.");
        }
    };
    return (
        <div className="w-full px-2 rounded-lg sm:px-0 font-Lexend_Regular min-h-[400px]">
            <div className="grid grid-cols-1 ">
                <div className="flex justify-end">
                    <button
                        onClick={handleDownloadExcel}
                        className="px-4 py-2 text-white transition bg-blue-600 rounded w-fit hover:bg-blue-700"
                    >
                        Download Excel
                    </button>
                </div>
                <div className="flex flex-col items-center justify-between gap-4 mt-4 mb-2 md:flex-row font-Lexend_Regular">

                    <div className="flex flex-col items-center gap-2 sm:flex-row ">
                        <EventSelector
                            selectedEvent={selectedEvent}
                            setSelectedEvent={setSelectedEvent}
                            setSelectedEventName={setSelectedEventName}
                        />
                    </div>
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
                            className="p-2 bg-white border border-gray-300 rounded"
                        >
                            {[10, 20, 50, 100].map((num, index) => (
                                <option key={index} value={num}>{num}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <>
                    <State_UTTable
                        state={states_UT}
                        currentPage={currentPage}
                        rowsPerPage={rowsPerPage}
                        sortBy={sortBy}
                        sortDirection={sortDirection}
                        handleSort={handleSort}
                        isLoading={tableLoading}
                        setSelectedState_UT={setSelectedState_UT}
                        setSelectedState_UTName={setSelectedState_UTName}
                        setModalViewUsers={setModalViewUsers}
                    />
                    <MobileState_UTCards
                        state={states_UT}
                        currentPage={currentPage}
                        setCurrentPage={setCurrentPage}
                        rowsPerPage={rowsPerPage}
                        isLoading={tableLoading}
                        sortBy={sortBy}
                        sortDirection={sortDirection}
                        setSortBy={setSortBy}
                        setSortDirection={setSortDirection}
                        setSelectedState_UT={setSelectedState_UT}
                        setSelectedState_UTName={setSelectedState_UTName}
                        setModalViewUsers={setModalViewUsers}
                    />
                </>
                {states_UT.totalPages > 0 &&
                    <Pagination
                        totalItems={states_UT.totalElements}
                        totalPages={states_UT.totalPages}
                        currentPage={currentPage}
                        itemsPerPage={rowsPerPage}
                        setCurrentPage={setCurrentPage}
                    />
                }
                {modalViewUsers && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 ">
                        <div className="bg-white  rounded-lg shadow-lg font-Lexend_Regular max-h-[90vh] w-full max-w-7xl overflow-hidden mx-4 p-2 motion-preset-slide-down-sm">
                            <div className="flex justify-end ">
                                <IoCloseSharp
                                    size={24}
                                    className="cursor-pointer hover:text-gray-600"
                                    onClick={() => setModalViewUsers(false)}
                                />
                            </div>
                            <div className="px-2 pb-4 overflow-y-auto overflow-x-auto h-[80vh] ">
                                <div className="flex justify-center mt-4">
                                    <State_UTUsers
                                        axiosInstance={axiosInstance}
                                        selectedState_UT={selectedState_UT}
                                        selectedState_UTName={selectedState_UTName}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                )}
            </div>
        </div>

    );
};

const State_UTUsers = ({ axiosInstance, selectedState_UT, selectedState_UTName }) => {
    const [state_UTUsers, setState_UTUsers] = useState([])
    const [selectedEvent, setSelectedEvent] = useState()
    const [selectedEventName, setSelectedEventName] = useState()
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchKey, setSearchKey] = useState("");
    const [sortBy, setSortBy] = useState(0);
    const [sortDirection, setSortDirection] = useState('ASC');
    const [tableLoading, setTableLoading] = useState(false)

    const handleSort = (columnIndex) => {
        setCurrentPage(1)
        if (sortBy === columnIndex) {
            setSortDirection(prev => (prev === 'ASC' ? 'DESC' : 'ASC'));
        } else {
            setSortBy(columnIndex);
            setSortDirection('ASC');
        }
    };

    const fetchUsersByState_UT = async () => {
        try {
            setTableLoading(true)
            const res = await axiosInstance.get(`admin/report/stateAndUT/${selectedState_UT}/users`, {
                params: {
                    eventId: selectedEvent,
                    page: currentPage - 1,
                    size: rowsPerPage,
                    sortBy,
                    direction: sortDirection,
                    searchTerm: searchKey,
                }
            })

            setState_UTUsers(res.data)
        } catch (error) {

        } finally {
            setTableLoading(false)
        }
    }

    useEffect(() => {

        fetchUsersByState_UT(selectedEvent);

    }, [selectedEvent, currentPage, rowsPerPage, sortBy, sortDirection, searchKey]);

    const handleDownloadExcel = async () => {

        try {
            let allStateUsers = [];
            let page = 0;
            const size = 100;
            let totalPages = 1;

            do {
                const res = await axiosInstance.get(`admin/report/stateAndUT/${selectedState_UT}/users`, {
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
                allStateUsers = [...allStateUsers, ...content];
                totalPages = tp;
                page++;
            } while (page < totalPages);

            if (allStateUsers.length === 0) {
                toast.warn("No Users available to export");
                return;
            }

            const dataToExport = allStateUsers.map(user => ({
                Name: user.fullName,
                Email: user.email,
                Mobile: user.mobile,
                User_Type: user.userType,
            }));

            const worksheet = XLSX.utils.json_to_sheet(dataToExport);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "State_UT Users");

            const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
            const fileData = new Blob([excelBuffer], { type: "application/octet-stream" });
            saveAs(fileData, `State_UT_Users_${selectedState_UTName}_${selectedEventName || 'AllEvents'}.xlsx`);
        } catch (error) {

            alert("Failed to download. Please try again.");
        }
    };

    return (
        <div className="w-full px-2 rounded-lg sm:px-0 font-Lexend_Regular min-h-[400px]">
            <div className="grid grid-cols-1 ">
                <div className="flex flex-col items-center justify-start space-y-3 sm:justify-between sm:flex-row sm:space-y-0">
                    <p className="text-base text-gray-700 font-Lexend_SemiBold">All Registered from <span className="text-gray-900">{selectedState_UTName}</span></p>
                    <button
                        onClick={handleDownloadExcel}
                        className="px-4 py-2 text-white transition bg-blue-600 rounded w-fit hover:bg-blue-700"
                    >
                        Download Excel
                    </button>
                </div>
                <div className="flex flex-col items-center justify-between gap-4 mt-4 mb-2 md:flex-row font-Lexend_Regular">

                    <div className="flex flex-col items-center gap-2 sm:flex-row ">

                        <EventSelector
                            selectedEvent={selectedEvent}
                            setSelectedEvent={setSelectedEvent}
                            setSelectedEventName={setSelectedEventName}
                        />
                    </div>


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
                            className="p-2 bg-white border border-gray-300 rounded"
                        >
                            {[10, 20, 50, 100].map((num, index) => (
                                <option key={index} value={num}>{num}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <>
                    <State_UTUsersTable
                        stateUsers={state_UTUsers}
                        currentPage={currentPage}
                        rowsPerPage={rowsPerPage}
                        sortBy={sortBy}
                        sortDirection={sortDirection}
                        handleSort={handleSort}
                        isLoading={tableLoading}
                    />
                    <MobileState_UTUsersCards
                        stateUsers={state_UTUsers}
                        currentPage={currentPage}
                        setCurrentPage={setCurrentPage}
                        rowsPerPage={rowsPerPage}
                        sortBy={sortBy}
                        sortDirection={sortDirection}
                        setSortBy={setSortBy}
                        setSortDirection={setSortDirection}
                        isLoading={tableLoading}
                    />
                </>
                {state_UTUsers.totalPages > 0 &&
                    <Pagination
                        totalItems={state_UTUsers.totalElements}
                        totalPages={state_UTUsers.totalPages}
                        currentPage={currentPage}
                        itemsPerPage={rowsPerPage}
                        setCurrentPage={setCurrentPage}
                    />
                }

            </div>
        </div>
    )
}



const EventSelector = ({ selectedEvent, setSelectedEvent, setSelectedEventName }) => {

    const [isLoading, setIsLoading] = useState(false);
    const cachedOptions = useRef([]); // stores last MAX_OPTIONS only
    const lastSearchTerm = useRef("");
    const token = useMemo(() => localStorage.getItem('Token'), []);
    const axiosInstance = axios.create({
        baseURL: url,
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": 'application/json',
        },
        withCredentials: true,
    });

    const MAX_OPTIONS = 20

    const loadOptions = async (inputValue, _, { page }) => {
        try {
            setIsLoading(true);


            if (inputValue !== lastSearchTerm.current) {
                cachedOptions.current = [];
                lastSearchTerm.current = inputValue;
                page = 1;
            }

            const response = await axiosInstance.get("/admin/event/list", {
                params: {
                    page: page - 1,
                    size: 20,
                    searchTerm: inputValue,
                },
            });
            const newOptions = response.data?.content?.map((event) => ({
                value: event.id,
                label: event.name,
                color: event.live
                    ? "#10B981"
                    : event.teamSubmissions || event.userSubmissions
                        ? "oklch(64.6% 0.222 41.116)"
                        : event.upcoming ?
                            "oklch(54.6% 0.245 262.881)"
                            : "oklch(27.8% 0.033 256.848)"
                ,
            })) || [];



            const allOptions = [...cachedOptions.current, ...newOptions];
            const uniqueOptions = Array.from(new Map(allOptions.map(opt => [opt.value, opt])).values());
            cachedOptions.current = uniqueOptions.slice(-MAX_OPTIONS);
            return {
                options: cachedOptions.current,
                hasMore: !response.data.last,
                additional: { page: page + 1 },
            };
        } catch (error) {
            toast.error(`${error.response?.data || "Error fetching events"}`);
            return { options: [], hasMore: false };
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const fetchSelectedEvent = async () => {
            const exists = cachedOptions.current.find(opt => opt.value === selectedEvent);

            if (!exists && selectedEvent) {
                try {
                    const response = await axiosInstance.get(`/admin/event/${selectedEvent}`);
                    const event = response.data;
                    const selectedOpt = {
                        value: event.id,
                        label: event.name,
                        color: event.live
                            ? "#10B981"
                            : event.teamSubmissions || event.userSubmissions
                                ? "#374151"
                                : "#9CA3AF",
                    };
                    cachedOptions.current = [...cachedOptions.current, selectedOpt];
                } catch (error) {

                }
            }
        };

        if (selectedEvent) {
            fetchSelectedEvent();
        }
    }, [selectedEvent]);

    return (
        <AsyncPaginate
            className="text-gray-600 sm:min-w-96 min-w-72"
            classNamePrefix="event-select"
            value={
                selectedEvent
                    ? cachedOptions.current.find((opt) => opt.value === selectedEvent) || null
                    : null
            }
            loadOptions={loadOptions}
            onChange={(selectedOption) => {
                setSelectedEvent(selectedOption?.value || null);
                setSelectedEventName(selectedOption?.label || null)
            }}
            placeholder="Select Event"
            isClearable
            isLoading={isLoading}
            additional={{ page: 1 }}
            styles={{
                control: (provided, state) => ({
                    ...provided,
                    borderColor: state.isFocused ? "#6b7280" : "#d1d5db",
                    boxShadow: state.isFocused ? "0 0 0 2px rgba(107, 114, 128, 0.3)" : "none",
                    "&:hover": {
                        borderColor: "#6b7280",
                    },
                }),
                singleValue: (provided, { data }) => ({
                    ...provided,
                    color: data.color,
                }),
                option: (provided, { data, isSelected }) => ({
                    ...provided,
                    color: data.color,
                    backgroundColor: isSelected ? "#e5e7eb" : "transparent",
                    "&:hover": {
                        backgroundColor: "#f3f4f6",
                    },
                }),
            }}
        />
    );
};

export default Report;
