
import Sidebar from "../Sidebar"
import Navbar from "../Navbar"
import React, { useReducer } from "react";
import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { url } from "../../Authentication/Utility";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Pagination from "./Pagination";
import { useNavigate } from "react-router-dom";
import AuthService from "../../Authentication/AuthService";
import { MdArrowDropUp, MdArrowDropDown } from "react-icons/md";
import { UserTable, MobileUserCards } from '../Tables/UsersTable'

function Users({ userDetails }) {

    const [open, setOpen] = useState(true);
    const [users, setUsers] = useState([])
    const navigate = useNavigate()
    const [showUserDeleteModal, setShowUserDeleteModal] = useState(false)
    const [selectedForDeleteUserId, setSelectedForDeleteUserId] = useState(null)
    const [selectedForDeleteUserEmail, setSelectedForDeleteUserEmail] = useState("")

    {/*pagination sorting,searching*/ }
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchKey, setSearchKey] = useState("");
    const [sortBy, setSortBy] = useState(0);
    const [sortDirection, setSortDirection] = useState('ASC');

    const [tableLoading, setTableLoading] = useState(false)
    const token = useMemo(() => AuthService.getToken(), []);
    useEffect(() => {
        const handleResize = () => setOpen(window.innerWidth >= 1280);
		handleResize();
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

    const fetchUsers = async () => {
        try {
            setTableLoading(true)
            const res = await axiosInstance.get(`/admin/users`, {
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

        } finally {
            setTableLoading(false)
        }
    };
    useEffect(() => {
        fetchUsers()
    }, [currentPage, rowsPerPage, sortBy, sortDirection, searchKey])

    useEffect(() => {
        setCurrentPage(1);
    }, [searchKey]);

    const handleDeleteUser = async () => {
        try {
            const res = await axiosInstance.delete(`/admin/user/${selectedForDeleteUserId}`)
            toast.success(res.data)
            setShowUserDeleteModal(false)
            fetchUsers()
        } catch (error) {

        }
    }
    const handleDeactivateUser = async (id) => {
        try {
            const res = await axiosInstance.put(`/admin/user/${id}/deactivate`)

            toast.success(res.data)
            fetchUsers()
        } catch (error) {

        }
    }
    const handleActivateUser = async (id) => {
        try {
            const res = await axiosInstance.put(`/admin/user/${id}/activate`)

            toast.success(res.data)
            fetchUsers()
        } catch (error) {

        }
    }

    const handleSort = (columnIndex) => {
        setCurrentPage(1)
        if (sortBy === columnIndex) {
            setSortDirection(prev => (prev === 'ASC' ? 'DESC' : 'ASC'));
        } else {
            setSortBy(columnIndex);
            setSortDirection('ASC');
        }
    };

    const handleEnableUser = async (id) => {
        try {
            const res = await axiosInstance.put(`/admin/user/${id}/enable`)

            toast.success(res.data)
            fetchUsers()
        } catch (error) {

        }
    }
    const handleDisableUser = async (id) => {
        try {
            const res = await axiosInstance.put(`/admin/user/${id}/disable`)

            toast.success(res.data)
            fetchUsers()
        } catch (error) {

        }
    }
    const [idData, setIdData] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleViewId = async (id) => {
        try {
            const res = await axiosInstance.get(`admin/user/${id}/identification`, {
                responseType: "blob",
            });
            const idCardUrl = URL.createObjectURL(res.data);
            setIdData(idCardUrl);
            setIsModalOpen(true);
        } catch (error) {

        }
    };
    return (
        <div className="overflow-hidden ">
            <Sidebar open={open} name={userDetails.username} value={open} setValue={setOpen} />

            <div className="flex flex-col w-full overflow-hidden text-sm ">
                <Navbar name={userDetails.name} value={open} setValue={setOpen} />
                <ToastContainer />
                <div className={`text-gray-900 min-h-lvh pb-4 w-full ${open ? 'pl-0 lg:pl-72' : ''} `} >

                    <div className="flex items-center justify-center p-3 py-2 m-4 bg-gray-100 rounded">
                        <p className="px-8 py-1 text-2xl text-gray-800 rounded font-Lexend_Bold"> Manage Users </p>
                    </div>
                    <div className="p-3 mx-4 border rounded-lg font-Lexend_Regular">
                        <div className="flex items-center justify-end py-3 font-Lexend_Regular">
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
                        
                        <div className="">
                            <>
                                <UserTable
                                    users={users}
                                    currentPage={currentPage}
                                    rowsPerPage={rowsPerPage}
                                    sortBy={sortBy}
                                    sortDirection={sortDirection}
                                    handleSort={handleSort}
                                    handleDeactivateUser={handleDeactivateUser}
                                    handleActivateUser={handleActivateUser}
                                    setSelectedForDeleteUserId={setSelectedForDeleteUserId}
                                    setSelectedForDeleteUserEmail={setSelectedForDeleteUserEmail}
                                    setShowUserDeleteModal={setShowUserDeleteModal}
                                    handleEnableUser={handleEnableUser}
                                    handleDisableUser={handleDisableUser}
                                    handleViewId={handleViewId}
                                    isLoading={tableLoading}
                                />
                                <MobileUserCards
                                    users={users}
                                    currentPage={currentPage}
                                    setCurrentPage={setCurrentPage}
                                    rowsPerPage={rowsPerPage}
                                    sortBy={sortBy}
                                    sortDirection={sortDirection}
                                    setSortBy={setSortBy}
                                    setSortDirection={setSortDirection}
                                    isLoading={tableLoading}
                                    handleDeactivateUser={handleDeactivateUser}
                                    handleActivateUser={handleActivateUser}
                                    setSelectedForDeleteUserId={setSelectedForDeleteUserId}
                                    setSelectedForDeleteUserEmail={setSelectedForDeleteUserEmail}
                                    setShowUserDeleteModal={setShowUserDeleteModal}
                                    handleEnableUser={handleEnableUser}
                                    handleDisableUser={handleDisableUser}
                                    handleViewId={handleViewId}
                                />
                            </>
                            {users.totalPages > 0 &&
                                <Pagination
                                    totalItems={users.totalElements}
                                    totalPages={users.totalPages}
                                    currentPage={currentPage}
                                    itemsPerPage={rowsPerPage}
                                    setCurrentPage={setCurrentPage}
                                />
                            }
                        </div>


                    </div>
                </div>
                {showUserDeleteModal && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 font-Lexend_Regular">
                        <div className="p-6 text-center bg-white rounded shadow-lg motion-preset-slide-down-sm">
                            <h2 className="mb-4 text-lg font-semibold">Are you sure?</h2>
                            <p>Do you really want to delete this User?</p>
                            <strong className="">{selectedForDeleteUserEmail}</strong>
                            <div className="flex justify-center mt-4 space-x-4">
                                <button
                                    className="px-4 py-2 text-white bg-red-600 rounded"
                                    onClick={() => handleDeleteUser()}
                                >
                                    Yes, Delete
                                </button>
                                <button
                                    className="px-4 py-2 text-gray-700 bg-gray-300 rounded"
                                    onClick={() => setShowUserDeleteModal(false)}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                {isModalOpen && idData && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
                        <div className="relative w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
                            <button
                                className="absolute text-2xl gray-600 top-2 right-2 hover:text-gray-900"
                                onClick={() => setIsModalOpen(false)}
                            >
                                &times;
                            </button>

                            <h2 className="mb-4 text-lg font-semibold">User Identity Card</h2>



                            {/* // <img src={idData} alt="ID Photo" className="w-full mt-4 rounded" /> */}
                            <img
                                src={idData ? idData : "/UserAssets/identityCard.png"}
                                alt="Identity card"
                                className="rounded-lg object-contain max-h-[50vh] w-full"
                            />

                        </div>
                    </div>
                )}

            </div>
        </div>
    )
}

export default Users




