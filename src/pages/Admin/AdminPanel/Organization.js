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
import OrganizationTable from '../Tables/OrganizationTable';
function AdminOrganizations({ userDetails }) {

    const [open, setOpen] = useState(true);
    const navigate = useNavigate()
    const token = useMemo(() => AuthService.getToken(), []);
    const [organizationData, setOrganizationData] = useState([])

    const [organizationTypeData, setOrganizationTypeData] = useState([])
    const [organisationStateData, setOrganisationStateData] = useState([])
    const [tableLoading, setTableLoading] = useState(false);
    const [organizationName, setOrganizationName] = useState("")
    const [place, setPlace] = useState("")
    const [organizationType, setOrganizationType] = useState("")
    const [organisationState, setOrganisationState] = useState("")

    const [showOrganizationDeleteModal, setShowOrganizationDeleteModal] = useState(false);
    const [selectedForDeleteOrganizationId, setSelectedForDeleteOrganizationId] = useState(null);

    const [wantAddOrganization, setOrganizationAdd] = useState(false)

    const [showOrganizationUpdateModal, setShowOrganizationUpdateModal] = useState(false)
    const [updateOrganizationId, setUpdateOrganizationId] = useState()
    const [updateOrganizationName, setUpdateOrganizationName] = useState("")
    const [updateOrganizationPlace, setUpdateOrganizationPlace] = useState("")
    const [updateOrganizationType, setUpdateOrganizationType] = useState("")
    const [updateOrganizationState, setUpdateOrganizationState] = useState("")

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

    const fetchOrganization = async () => {

        try {
            setTableLoading(true)
            const res = await axiosInstance.get(`/admin/organisation`, {
                params: {
                    page: currentPage - 1,
                    size: rowsPerPage,
                    sortBy,
                    direction: sortDirection,
                    searchTerm: searchKey,
                },
            });
            
            setOrganizationData(res.data);

        } catch (error) {
           
        } finally {
            setTableLoading(false)
        }
    };
    useEffect(() => {
        fetchOrganization()
    }, [currentPage, rowsPerPage, sortBy, sortDirection, searchKey])

    useEffect(() => {
        setCurrentPage(1);
    }, [searchKey]);
    const fetchOrganizationType = async () => {
        try {

            const response = await axiosInstance.get(`/organisation-type`);
            setOrganizationTypeData(response.data);
          
        } catch (error) {
            
        }
    };
    const fetchOrganizationState = async () => {
        try {
            const res = await axios.get(`${url}/statesAndUT`)
         
            setOrganisationStateData(res.data)
        } catch (error) {
           
        }
    }
    useEffect(() => {
        fetchOrganizationType()
        fetchOrganizationState()
    }, [])

    const handleOrganizationSubmit = async (event) => {
        event.preventDefault()
        try {
        
            const response = await axiosInstance.post(`/admin/organisation`,
                { name: organizationName, place, organisationType: organizationType, stateAndUT: organisationState }
            );
            toast.success(response.data)
           
            setOrganizationName("")
            setPlace("")
            setOrganizationType("")
            setOrganisationState('')
            fetchOrganization()
        } catch (error) {
            toast.error(error.response?.data || 'Error adding organization');
          
        }
    }
    const handleDeleteOrganization = async (id) => {
        try {
            const res = await axiosInstance.delete(`/admin/organisation/${selectedForDeleteOrganizationId}`)
          
            toast.success(res.data)
            fetchOrganization()
        } catch (error) {
            toast.error(error.response?.data || 'Error deleting Organization');
          
        } finally {
            setShowOrganizationDeleteModal(false);
            setSelectedForDeleteOrganizationId(null);
        }
    }
    const handleUpdateOrganization = async () => {
        try {
           
            const res = await axiosInstance.put(`/admin/organisation/${updateOrganizationId}`,
                { name: updateOrganizationName, place: updateOrganizationPlace, organisationType: updateOrganizationType, stateAndUT: updateOrganizationState }
            )
            toast.success(res.data)
            fetchOrganization()
            setUpdateOrganizationId()
            setUpdateOrganizationName()
            setUpdateOrganizationPlace()
            setOrganisationState()
            setUpdateOrganizationType()
            setShowOrganizationUpdateModal(false);
        } catch (error) {
            toast.error(error.response?.data || 'error while updating organization')
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
                        <p className="px-8 py-1 text-2xl text-gray-800 rounded font-Lexend_Bold"> Organisations </p>
                    </div>
                    <div className='flex items-center justify-center'>
                        {wantAddOrganization ? <div className='w-full p-3 m-4 bg-gray-100 rounded font-Lexend_Medium motion-preset-slide-down-sm'>
                            <div className='flex items-center justify-between text-2xl'>

                                <p className='flex items-center '>Add New Organisation </p>
                                <MdOutlineClose onClick={() => { setOrganizationAdd(false) }} title='Close ' className='cursor-pointer' size={20} />
                            </div>

                            <div >
                                <form className="grid w-full grid-cols-1 gap-4 mt-5 sm:grid-cols-2" onSubmit={handleOrganizationSubmit}>
                                    <div className="flex flex-col ">
                                        <label>Name</label>
                                        <input
                                            className="p-2 text-gray-600 rounded h-9 "
                                            placeholder="Enter organisation name "
                                            value={organizationName}
                                            onChange={(e) => setOrganizationName(e.target.value)}
                                        />
                                    </div>
                                    <div className="flex flex-col ">
                                        <label>Place</label>
                                        <input
                                            className="p-2 text-gray-600 rounded h-9"
                                            placeholder="Enter organisation place "
                                            value={place}
                                            onChange={(e) => setPlace(e.target.value)}
                                        />
                                    </div>
                                    <div className="flex flex-col ">
                                        <label>State or Territory</label>
                                        <select
                                            className="p-2 text-gray-600 rounded h-9"
                                            placeholder="select organisation state"
                                            value={organisationState}
                                            onChange={(e) => setOrganisationState(e.target.value)}
                                        >
                                            <option value="" disabled selected>Select state or territory</option>
                                            {organisationStateData.length > 0 &&
                                                organisationStateData.map((data) => (
                                                    <option key={data.id} value={parseInt(data.id, 10)} className="break-words ">
                                                        {data.name}
                                                    </option>
                                                ))
                                            }
                                        </select>
                                    </div>
                                    <div className="flex flex-col ">
                                        <label>Type</label>
                                        <select
                                            className="p-2 text-gray-600 rounded h-9"
                                            placeholder="Enter organisation type"
                                            value={organizationType}
                                            onChange={(e) => setOrganizationType(e.target.value)}
                                        >
                                            <option value="" disabled selected>Select organisation type</option>
                                            {organizationTypeData.length > 0 &&
                                                organizationTypeData.map((organization, index) => (
                                                    <option key={index} value={organization}>
                                                        {organization}
                                                    </option>
                                                ))
                                            }
                                        </select>
                                    </div>

                                    <button className="p-1 text-white bg-gray-600 rounded w-28 h-9" type="submit">Add</button>
                                </form>
                            </div>
                        </div> :
                            <div className={`flex items-center justify-center md:justify-end w-full px-4`}>
                                <button className='flex items-center justify-center px-2 py-1 text-sm text-white rounded cursor-pointer font-Lexend_Medium bg-slate-800' onClick={() => { setOrganizationAdd(true) }}>
                                    <FaPlusCircle className='mr-1' size={18} /><p>Add New Organisation </p>
                                </button>
                            </div>

                        }

                    </div>
                    <div className="p-3 m-4 bg-white border rounded-lg font-Lexend_Regular">
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
                        <OrganizationTable
                            organizationData={organizationData}
                            rowsPerPage={rowsPerPage}
                            currentPage={currentPage}
                            setCurrentPage={setCurrentPage}
                            isLoading={tableLoading}
                            sortBy={sortBy}
                            sortDirection={sortDirection}
                            setSortBy={setSortBy}
                            setSortDirection={setSortDirection}
                            handleSort={handleSort}
                            setUpdateOrganizationId={setUpdateOrganizationId}
                            setUpdateOrganizationName={setUpdateOrganizationName}
                            setUpdateOrganizationPlace={setUpdateOrganizationPlace}
                            setUpdateOrganizationType={setUpdateOrganizationType}
                            setUpdateOrganizationState={setUpdateOrganizationState}
                            setShowOrganizationUpdateModal={setShowOrganizationUpdateModal}
                            setSelectedForDeleteOrganizationId={setSelectedForDeleteOrganizationId}
                            setShowOrganizationDeleteModal={setShowOrganizationDeleteModal}
                        />
                        {organizationData.totalPages > 0 && (
                            <Pagination
                                totalItems={organizationData.totalElements}
                                totalPages={organizationData.totalPages}
                                currentPage={currentPage}
                                itemsPerPage={rowsPerPage}
                                setCurrentPage={setCurrentPage}
                            />
                        )}
                    </div>
                    {showOrganizationDeleteModal && (
                        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 font-Lexend_Regular">
                            <div className="p-6 text-center bg-white rounded shadow-lg motion-preset-slide-down-sm">
                                <h2 className="mb-4 text-lg font-semibold">Are you sure?</h2>
                                <p>Do you really want to delete this organisation?</p>
                                <div className="flex justify-center mt-6 space-x-4">
                                    <button
                                        className="px-4 py-2 text-white bg-red-600 rounded"
                                        onClick={() => handleDeleteOrganization()}
                                    >
                                        Yes, Delete
                                    </button>
                                    <button
                                        className="px-4 py-2 text-gray-700 bg-gray-300 rounded"
                                        onClick={() => setShowOrganizationDeleteModal(false)}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                    {showOrganizationUpdateModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
                            <div className="w-full max-w-md p-4 bg-gray-100 rounded shadow-lg md:w-1/2 sm:p-6 font-Lexend_Regular motion-preset-slide-down-sm">
                                <h2 className="mb-4 text-lg font-semibold text-center">Update</h2>
                                <form className="mt-5 space-y-4">
                                    <div className="flex flex-col">
                                        <label className="mb-1">Name</label>
                                        <input
                                            className="p-2 text-gray-600 rounded h-9"
                                            placeholder="Enter Organization name"
                                            value={updateOrganizationName}
                                            onChange={(e) => setUpdateOrganizationName(e.target.value)}
                                        />
                                    </div>

                                    <div className="flex flex-col">
                                        <label className="mb-1">Place</label>
                                        <input
                                            className="p-2 rounded h-9"
                                            placeholder="Enter Organization Place"
                                            value={updateOrganizationPlace}
                                            onChange={(e) => setUpdateOrganizationPlace(e.target.value)}
                                        />
                                    </div>

                                    <div className="flex flex-col">
                                        <label className="mb-1">State or Territory</label>
                                        <select
                                            className="p-2 text-gray-600 rounded h-9"
                                            value={updateOrganizationState}
                                            onChange={(e) => setUpdateOrganizationState(e.target.value)}
                                        >
                                            <option value="" disabled>
                                                Select state or territory
                                            </option>
                                            {organisationStateData.length > 0 &&
                                                organisationStateData.map((data) => (
                                                    <option key={data.id} value={parseInt(data.id, 10)} className="break-words">
                                                        {data.name}
                                                    </option>
                                                ))}
                                        </select>
                                    </div>

                                    <div className="flex flex-col">
                                        <label className="mb-1">Type</label>
                                        <select
                                            className="p-2 text-gray-600 rounded h-9"
                                            value={updateOrganizationType}
                                            onChange={(e) => setUpdateOrganizationType(e.target.value)}
                                        >
                                            <option value="" disabled>
                                                Select Organization type
                                            </option>
                                            {organizationTypeData.length > 0 &&
                                                organizationTypeData.map((organization, index) => (
                                                    <option key={index} value={organization}>
                                                        {organization}
                                                    </option>
                                                ))}
                                        </select>
                                    </div>
                                </form>

                                <div className="flex justify-center mt-6 space-x-4">
                                    <button
                                        className="px-4 py-2 text-white bg-blue-600 rounded"
                                        onClick={() => handleUpdateOrganization()}
                                    >
                                        Update
                                    </button>
                                    <button
                                        className="px-4 py-2 text-gray-700 bg-gray-300 rounded"
                                        onClick={() => setShowOrganizationUpdateModal(false)}
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

export default AdminOrganizations
