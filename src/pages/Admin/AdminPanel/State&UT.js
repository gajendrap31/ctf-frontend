import React from 'react'
import Sidebar from '../Sidebar';
import { useState, useEffect, useMemo } from 'react';
import Navbar from '../Navbar';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaPlusCircle } from "react-icons/fa";
import axios from 'axios';
import { url } from '../../Authentication/Utility';
import { useNavigate } from 'react-router-dom';
import Pagination from './Pagination';
import AuthService from '../../Authentication/AuthService';
import { MdOutlineClose } from "react-icons/md";
import StateTable from '../Tables/State&UTTable';
function AdminState_UT({ userDetails }) {

    const [open, setOpen] = useState(true);
    const navigate = useNavigate()
    const token = useMemo(() => AuthService.getToken(), []);
    const [stateUTData, setStateUTData] = useState([])

    const [tableLoading, setTableLoading] = useState(false);
    const [stateUTName, setStateUTName] = useState("")
    const [stateUTType, setStateUTType] = useState("")

    const [showStateUTDeleteModal, setShowStateUTDeleteModal] = useState(false);
    const [selectedForDeleteStateUTId, setSelectedForDeleteStateUTId] = useState(null);

    const [wantAddStateUT, setWantAddStateUT] = useState(false)

    const [showStateUTUpdateModal, setShowStateUTUpdateModal] = useState(false)
    const [updateStateUTId, setUpdateStateUTId] = useState()
    const [updateStateUTName, setUpdateStateUTName] = useState("")
    const [updateStateUTType, setUpdateStateUTType] = useState("")

    {/*pagination sorting,searching*/ }
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchKey, setSearchKey] = useState("");
    const [sortBy, setSortBy] = useState(0);
    const [sortDirection, setSortDirection] = useState('ASC');
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

    const axiosInstance = useMemo(() => axios.create({
        baseURL: url,
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        withCredentials: true,
    }), [token]);

    const fetchStateUT = async () => {

        try {
            setTableLoading(true)
            const res = await axiosInstance.get(`/admin/statesAndUT`, {
                params: {
                    page: currentPage - 1,
                    size: rowsPerPage,
                    sortBy,
                    direction: sortDirection,
                    searchTerm: searchKey,
                },
            });
            setStateUTData(res.data);
        } catch (error) {
       
        } finally {
            setTableLoading(false)
        }
    };
    useEffect(() => {
        fetchStateUT()
    }, [currentPage, rowsPerPage, sortBy, sortDirection, searchKey])

    useEffect(() => {
        setCurrentPage(1);
    }, [searchKey]);


    const handleStateUTSubmit = async (event) => {
        event.preventDefault()
        try {
            
            const response = await axiosInstance.post(`/admin/statesAndUT`,
                { name: stateUTName, type: stateUTType }
            );
            toast.success(response.data)
           
            setStateUTName("")
            setStateUTType("")
            fetchStateUT()
        } catch (error) {
            toast.error(error.response?.data || 'Error adding State & UT');
           
        }
    }
    const handleDeleteStateUT = async (id) => {
        try {
            const res = await axiosInstance.delete(`/admin/stateAndUT/${selectedForDeleteStateUTId}`)
           
            toast.success(res.data)
            fetchStateUT()
        } catch (error) {
            toast.error(error.response?.data || 'Error deleting State & UT');
            
        } finally {
            setShowStateUTDeleteModal(false);
            setSelectedForDeleteStateUTId(null);
        }
    }

    const handleUpdateStateUT = async () => {
        try {
           
            const res = await axiosInstance.put(`/admin/stateAndUT/${updateStateUTId}`,
                { name: updateStateUTName, type: updateStateUTType }
            )
            toast.success(res.data)
            fetchStateUT()
            setUpdateStateUTId()
            setUpdateStateUTName()
            setUpdateStateUTType()
            setShowStateUTUpdateModal(false);
        } catch (error) {
            toast.error(error.response?.data || 'error while updating State & UT')
        } finally {


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
    return (
        <div className="overflow-hidden ">
            <Sidebar open={open} name={userDetails.username} value={open} setValue={setOpen} />

            <div className="flex flex-col w-full overflow-hidden text-sm">
                <Navbar name={userDetails.name} value={open} setValue={setOpen} />
                <ToastContainer />
                <div className={`text-gray-900 min-h-[90vh]  w-full ${open ? 'pl-0 lg:pl-72' : ''} `} >

                    <div className="flex items-center justify-center p-3 py-2 m-4 bg-gray-100 rounded">
                        <p className="px-8 py-1 text-xl text-gray-800 rounded sm:text-2xl font-Lexend_Bold"> State & Union Territory</p>
                    </div>
                    <div className='flex items-center justify-center'>
                        {wantAddStateUT ? <div className='w-full p-3 m-4 bg-gray-100 rounded font-Lexend_Medium motion-preset-slide-down-sm'>
                            <div className='flex items-center justify-between text-2xl'>

                                <p className='flex items-center '>Add New  </p>
                                <MdOutlineClose onClick={() => { setWantAddStateUT(false) }} title='Close ' className='cursor-pointer' size={20} />
                            </div>

                            <div >
                                <form className="grid w-1/3 grid-cols-1 gap-4 mt-5" onSubmit={handleStateUTSubmit}>
                                    <div className="flex flex-col ">
                                        <label>Name</label>
                                        <input
                                            className="p-2 text-gray-600 rounded h-9 "
                                            placeholder="Enter State or Union Territory Name "
                                            value={stateUTName}
                                            onChange={(e) => setStateUTName(e.target.value)}
                                        />
                                    </div>

                                    <div className="flex flex-col ">
                                        <label>Type</label>
                                        <select
                                            className="p-2 text-gray-600 rounded h-9"
                                            placeholder="Enter State or Union Territory Type"
                                            value={stateUTType}
                                            onChange={(e) => setStateUTType(e.target.value)}
                                        >
                                            <option value="" disabled selected>Select Type</option>
                                            <option value="State">State</option>
                                            <option value="Union Territory" >Union Territory</option>
                                        </select>
                                    </div>

                                    <button className="p-1 text-white bg-gray-600 rounded w-28 h-9" type="submit">Add</button>
                                </form>
                            </div>
                        </div> :
                            <div className={`flex items-center justify-center md:justify-end w-full px-4`}>
                                <button className='flex items-center justify-center px-2 py-1 text-sm text-white rounded cursor-pointer font-Lexend_Medium bg-slate-800' onClick={() => { setWantAddStateUT(true) }}>
                                    <FaPlusCircle className='mr-1' size={18} /><p>Add New </p>
                                </button>
                            </div>

                        }

                    </div>
                    <div className="p-3 m-4 border rounded-lg font-Lexend_Regular">
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
                                    className="p-2 border border-gray-300 rounded"
                                >
                                    {[10, 20, 50, 100].map((num, index) => (
                                        <option key={index} value={num}>{num}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <StateTable
                            stateUTData={stateUTData}
                            currentPage={currentPage}
                            setCurrentPage={setCurrentPage}
                            rowsPerPage={rowsPerPage}
                            isLoading={tableLoading}
                            sortBy={sortBy}
                            sortDirection={sortDirection}
                            setSortBy={setSortBy}
                            setSortDirection={setSortDirection}
                            handleSort={handleSort}
                            setUpdateStateUTId={setUpdateStateUTId}
                            setUpdateStateUTName={setUpdateStateUTName}
                            setUpdateStateUTType={setUpdateStateUTType}
                            setShowStateUTUpdateModal={setShowStateUTUpdateModal}
                            setSelectedForDeleteStateUTId={setSelectedForDeleteStateUTId}
                            setShowStateUTDeleteModal={setShowStateUTDeleteModal}
                        />
                        {stateUTData.totalPages > 0 && (
                            <Pagination
                                totalItems={stateUTData.totalElements}
                                totalPages={stateUTData.totalPages}
                                currentPage={currentPage}
                                itemsPerPage={rowsPerPage}
                                setCurrentPage={setCurrentPage}
                            />
                        )}
                    </div>
                    {showStateUTDeleteModal && (
                        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 ">
                            <div className="p-6 text-center bg-white rounded shadow-lg motion-preset-slide-down-sm font-Lexend_Regular">
                                <h2 className="mb-4 text-lg font-semibold">Are you sure?</h2>
                                <p>Do you really want to delete this organisation?</p>
                                <div className="flex justify-center mt-6 space-x-4">
                                    <button
                                        className="px-4 py-2 text-white bg-red-600 rounded"
                                        onClick={() => handleDeleteStateUT()}
                                    >
                                        Yes, Delete
                                    </button>
                                    <button
                                        className="px-4 py-2 text-gray-700 bg-gray-300 rounded"
                                        onClick={() => setShowStateUTDeleteModal(false)}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                    {showStateUTUpdateModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
                            <div className="w-full max-w-md p-4 bg-white border rounded shadow-lg md:w-1/3 sm:p-6 font-Lexend_Regular motion-preset-slide-down-sm">
                                <h2 className="mb-4 text-lg font-semibold text-center">Update</h2>
                                <form className="space-y-4">
                                    <div className="flex flex-col">
                                        <label className="mb-1">Name</label>
                                        <input
                                            className="p-2 text-gray-600 border rounded h-9"
                                            placeholder="Enter State UT name"
                                            value={updateStateUTName}
                                            onChange={(e) => setUpdateStateUTName(e.target.value)}
                                        />
                                    </div>

                                    <div className="flex flex-col">
                                        <label className="mb-1">Type</label>
                                        <select
                                            className="p-2 text-gray-600 border rounded h-9"
                                            value={updateStateUTType}
                                            onChange={(e) => setUpdateStateUTType(e.target.value)}
                                        >
                                            <option value="" disabled>
                                                Select state ut type
                                            </option>
                                            <option value="State">State</option>
                                            <option value="Union Territory">Union Territory</option>
                                        </select>
                                    </div>
                                </form>

                                <div className="flex justify-center mt-6 space-x-4">
                                    <button
                                        className="px-4 py-2 text-white bg-blue-600 rounded"
                                        onClick={() => handleUpdateStateUT()}
                                    >
                                        Update
                                    </button>
                                    <button
                                        className="px-4 py-2 text-gray-700 bg-gray-300 rounded"
                                        onClick={() => setShowStateUTUpdateModal(false)}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    )
}

export default AdminState_UT
