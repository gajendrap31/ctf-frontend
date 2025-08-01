import Sidebar from "../Sidebar"
import Navbar from "../Navbar"
import React from "react";
import { useState, useEffect } from "react";
//import AuthService from "../Authentication/AuthService";

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from "axios";
import { url } from "../../Authentication/Utility";
import { useMemo } from "react";
import AuthService from "../../Authentication/AuthService";
import { useNavigate } from "react-router-dom";
import Pagination from "./Pagination";
import { GiCaptainHatProfile } from "react-icons/gi";
import { MdArrowDropUp, MdArrowDropDown } from "react-icons/md";
import Select from "react-select";
import { TeamTableData } from "../Tables/TeamTable";
import EventSelector from "./EventSelector";

function Teams({ userDetails }) {

    const [open, setOpen] = useState(true);
    const token = useMemo(() => localStorage.getItem('Token'), []);
    const [selectedEvent, setSelectedEvent] = useState("")
    const [selectedEventData, setSelectedEventData] = useState()
    const [teamData, setTeamData] = useState([])
    const navigate = useNavigate()

    const [teamMemberData, setTeamMemberData] = useState([])
    const [isModalOpen, setIsModalOpen] = useState(false);

    {/*pagination sorting,searching*/ }
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(0);
    const [searchKey, setSearchKey] = useState("");
    const [sortBy, setSortBy] = useState(0);
    const [sortDirection, setSortDirection] = useState('ASC');

    const [tableLoading, setTableLoading]=useState(false)
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

    
    const fetchTeamsByEventId = async () => {
        try {
            setTableLoading(true)
            const response = await axiosInstance.get(`/admin/event/${selectedEvent}/teams`, {
                params: {
                    page: currentPage - 1,
                    size: rowsPerPage,
                    sortBy,
                    direction: sortDirection,
                    searchTerm: searchKey,
                },
            });
            setTeamData(response.data);
           
        } catch (error) {
           
        }finally{
            setTableLoading(false)
        }
    }
  

    useEffect(() => {
        if (selectedEventData?.teamCreationAllowed) {
            fetchTeamsByEventId(selectedEvent, currentPage - 1, rowsPerPage, searchKey);
        }
    }, [selectedEventData, currentPage, rowsPerPage, sortBy, sortDirection, searchKey]);

    const fetchEventDataById = async (eventId) => {
        try {
            const res = await axiosInstance.get(`admin/event/${eventId}`);
         
            setSelectedEventData(res.data);
        } catch (error) {
          
        }
    };

    useEffect(() => {
        if (selectedEvent) {
            fetchEventDataById(selectedEvent)
            setTeamData([])
        }
    }, [selectedEvent]);


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

    const handleMembersClick = (members) => {
        setTeamMemberData(members)
        setIsModalOpen(true);
    };
    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    return (
        <div className="overflow-hidden ">
            <Sidebar open={open} name={userDetails.username} value={open} setValue={setOpen} />

            <div className="flex flex-col w-full overflow-hidden text-sm">
                <Navbar name={userDetails.name} value={open} setValue={setOpen} />
                <ToastContainer />
                <div className={`text-gray-900 min-h-lvh overflow-auto   w-full ${open ? 'pl-0 lg:pl-72' : ''} `} >
                    
                    
                    <div className="flex items-center justify-center p-3 py-2 m-4 bg-gray-100 rounded">
                        <p className="px-8 py-1 text-2xl text-gray-800 rounded font-Lexend_Bold"> Teams</p>
                    </div>
                    <div className="p-3 mx-4 border rounded-lg">

                        <div className="flex flex-col font-Lexend_Regular">

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

                            <TeamTableData
                                teams={teamData}
                                currentPage={currentPage}
                                setCurrentPage={setCurrentPage}
                                rowsPerPage={rowsPerPage}
                                sortBy={sortBy}
                                sortDirection={sortDirection}
                                setSortBy={setSortBy}
                                setSortDirection={setSortDirection}
                                handleSort={handleSort}
                                handleMembersClick={handleMembersClick}
                                selectedEvent={selectedEvent}
                                selectedEventData={selectedEventData}
                                isLoading={tableLoading}
                            />
                            {selectedEvent && teamData.totalPages > 0 && (
                                <Pagination
                                    totalItems={teamData.totalElements}
                                    totalPages={teamData.totalPages}
                                    currentPage={currentPage}
                                    itemsPerPage={rowsPerPage}
                                    setCurrentPage={setCurrentPage}
                                />
                            )}
                            <TeamMembersModal
                                isOpen={isModalOpen}
                                onClose={handleCloseModal}
                                teamId={teamData.id}
                                teamMemberData={teamMemberData}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}


const TeamMembersModal = ({ isOpen, onClose, teamMemberData }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-modal-fade-in mx-3">
                <h2 className="mb-4 text-xl font-semibold">Team Member Details</h2>

                {teamMemberData.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {teamMemberData.map((member, index) => (
                            <div
                                key={index}
                                className={`border rounded-lg p-4 bg-white shadow-sm space-y-1 ${member.captain ? 'border-gray-500' : 'border-gray-300'}`}

                            >
                                <div className="flex items-center justify-between gap-2">
                                    <span className="font-semibold"># {index + 1}</span>

                                    {member.captain && (
                                        <>
                                            <p className="px-2 text-white bg-gray-500 rounded font-Lexend_SemiBold">Captain</p>
                                            {/* <GiCaptainHatProfile title="Captain" className="text-xl" /> */}
                                        </>
                                    )}
                                </div>
                                <div title="Name">
                                    {member.user.fullName}
                                </div>
                                <div title="Email">
                                    {member.user.email}
                                </div>

                                <div title={member.user.level}>
                                    {member.user.levelInfo}
                                </div>
                                <div title="Organisation">
                                    {member.user.organisation.name}, {member.user.organisation.place}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-gray-500">No users available.</p>
                )}

                <div className="flex justify-end mt-4">
                    <button
                        type="button"
                        className="px-4 py-2 bg-gray-300 rounded text-gray-950 hover:text-gray-700 hover:bg-gray-200"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

// const TeamMembersModal = ({ isOpen, onClose, teamMemberData }) => {
//     if (!isOpen) return null;

//     return (
//         <div className="fixed inset-0 z-50 flex items-center justify-center px-2 bg-black bg-opacity-50 ">
//             <div className="bg-white p-4 sm:p-8 rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto motion-preset-slide-down-sm">
//                 <h2 className="mb-4 text-xl font-semibold">Team Member Details</h2>

//                 {/* 🖥️ Desktop Table View */}
//                 <div className="hidden p-2 overflow-x-auto border sm:block">
//                     <table className="w-full text-sm bg-white rounded-lg">
//                         <thead>
//                             <tr className="h-10 border-b-2 bg-slate-100">
//                                 <th className="text-start ps-3">S.No.</th>
//                                 <th className="text-start ps-3">Name</th>
//                                 <th className="text-start ps-3">Email</th>
//                                 <th className="text-start ps-3">Level</th>
//                                 <th className="text-start ps-3">Level Info</th>
//                             </tr>
//                         </thead>
//                         <tbody>
//                             {teamMemberData.length > 0 ? (
//                                 teamMemberData.map((member, index) => (
//                                     <tr key={index} className="border-b-2 h-9">
//                                         <td className="flex items-center gap-1 ps-3">
//                                             {member.captain && <GiCaptainHatProfile title="Captain" />}
//                                             {index + 1}
//                                         </td>
//                                         <td className="ps-3">{member.user.fullName}</td>
//                                         <td className="ps-3">{member.user.email}</td>
//                                         <td className="ps-3">{member.user.level}</td>
//                                         <td className="ps-3">
//                                             {member.user.levelInfo} (
//                                             {member.user.organisation.name},{" "}
//                                             {member.user.organisation.place})
//                                         </td>
//                                     </tr>
//                                 ))
//                             ) : (
//                                 <tr>
//                                     <td colSpan="5" className="text-center text-gray-500">
//                                         No users available.
//                                     </td>
//                                 </tr>
//                             )}
//                         </tbody>
//                     </table>
//                 </div>

//                 {/* 📱 Mobile Card View */}
//                 <div className="space-y-3 sm:hidden">
//                     {teamMemberData.length > 0 ? (
//                         teamMemberData.map((member, index) => (
//                             <div
//                                 key={index}
//                                 className="p-3 border rounded-lg shadow-sm bg-slate-50"
//                             >
//                                 <div className="flex items-center justify-between mb-1">
//                                     <span className="text-sm font-medium">
//                                         #{index + 1}{" "}
//                                         {member.captain && (
//                                             <GiCaptainHatProfile
//                                                 className="inline-block text-blue-500"
//                                                 title="Captain"
//                                             />
//                                         )}
//                                     </span>
//                                     {/* <span className="text-xs text-gray-500">
//                     {member.user.level}
//                   </span> */}
//                                 </div>
//                                 <div className="text-base font-semibold">
//                                     {member.user.fullName}
//                                 </div>
//                                 <div className="text-sm text-gray-600">{member.user.email}</div>
//                                 <div className="mt-1 text-sm text-gray-700">
//                                     {member.user.levelInfo}
//                                 </div>
//                                 <div className="text-sm text-gray-500">
//                                     {member.user.organisation.name}, {member.user.organisation.place}
//                                 </div>
//                             </div>
//                         ))
//                     ) : (
//                         <div className="text-center text-gray-500">No users available.</div>
//                     )}
//                 </div>

//                 {/* Close Button */}
//                 <div className="flex justify-end pt-4">
//                     <button
//                         type="button"
//                         className="px-4 py-2 text-gray-700 bg-gray-300 rounded"
//                         onClick={onClose}
//                     >
//                         Close
//                     </button>
//                 </div>
//             </div>
//         </div>
//     );
// };


export default Teams