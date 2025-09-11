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
import { FaLongArrowAltLeft } from "react-icons/fa";
import Pagination from './Pagination';
import AuthService from '../../Authentication/AuthService';
import ChallengeCategoryTable from '../Tables/ChallengeCategoryTable';
import { IoCloseSharp } from 'react-icons/io5';
const nameRegex = /^[A-Za-z0-9 .,'&()\-]{3,100}$/;
const descriptionRegex = /^[A-Za-z0-9 .,!?'\"@()&:/\n\r\-]{10,1000}$/;
function ChallengeCategory({ userDetails }) {

    const [open, setOpen] = useState(true);
    const navigate = useNavigate()
    const [categoryName, setCategoryName] = useState("");
    const [validCategoryName, setValidCategoryName] = useState(false)
    const [categoryNameFocus, setCategoryNameFocus] = useState(false);
    const [categoryDescription, setCategoryDescription] = useState("");
    const [validCategoryDescription, setValidCategoryDescription] = useState("");
    const [categoryDescriptionFocus, setCategoryDescriptionFocus] = useState("");
    const [wantAddChallengeCategory,setWantAddChallengeCategory]=useState(false)
    const [challengesCategory, setChallengesCategory] = useState([])
    const [showCategoryDeleteModal, setShowCategoryDeleteModal] = useState(false);
    const [selectedForDeleteCategoryId, setSelectedForDeleteCategoryId] = useState(null);
    const [showCategoryUpdateModal, setShowCategoryUpdateModal] = useState(false)

    const [updateId, setUpdateId] = useState()
    const [updateName, setUpdateName] = useState("")
    const [updateDescription, setUpdateDescription] = useState("")

    {/*pagination sorting,searching*/ }
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchKey, setSearchKey] = useState("");
    const [sortBy, setSortBy] = useState(0);
    const [sortDirection, setSortDirection] = useState('ASC');

    const [tableLoading, setTableLoading] = useState(false)
    const token = useMemo(() => AuthService.getToken(), []);

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

    useEffect(() => {
        setValidCategoryName(nameRegex.test(categoryName));
    }, [categoryName])

    useEffect(() => {
        setValidCategoryDescription(descriptionRegex.test(categoryDescription));
    }, [categoryDescription])

    const fetchChallengeCategories = async () => {

        try {
            setTableLoading(true)
            const res = await axiosInstance.get(`/admin/challengeCategory`, {
                params: {
                    page: currentPage - 1,
                    size: rowsPerPage,
                    sortBy,
                    direction: sortDirection,
                    searchTerm: searchKey,
                },
            });
         
            setChallengesCategory(res.data);
        } catch (error) {
           
        }finally{
            setTableLoading(false)
        }
    };
    useEffect(() => {
        fetchChallengeCategories()
    }, [currentPage, rowsPerPage, sortBy, sortDirection, searchKey])

    useEffect(() => {
        setCurrentPage(1);
    }, [searchKey]);

    const handleCategorySubmit = async (event) => {
        event.preventDefault();
        const token = localStorage.getItem('Token')
        try {
            
            const response = await axios.post(`${url}/admin/challengeCategory`,
                { name: categoryName, description: categoryDescription },
                {

                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    withCredentials: true
                }
            );
            toast.success(response.data)
           
            setCategoryName("")
            setCategoryDescription("")
            fetchChallengeCategories()
        } catch (error) {
            toast.error(error.response?.data || 'Error adding category');
           
        }
    }

    const handleDeleteCategory = async () => {
        try {
            const id = parseInt(selectedForDeleteCategoryId)
            const token = localStorage.getItem('Token')
            const res = await axios.delete(`${url}/admin/challengeCategory/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": 'application/json'
                    },
                    withCredentials: true
                }
            )
           
            toast.success(res.data)
            fetchChallengeCategories()
        } catch (error) {
            toast.error(error.response?.data || 'Error deleting category');
          
        } finally {
            setShowCategoryDeleteModal(false);
            setSelectedForDeleteCategoryId(null);
        }
    }
    const handleUpdateCategory = async () => {
        try {
            const token = localStorage.getItem("Token")
            
            const res = await axios.put(`${url}/admin/challengeCategory/${updateId}`,
                { name: updateName, description: updateDescription },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": 'application/json'
                    },
                    withCredentials: true
                }
            )
            setUpdateId()
            setUpdateName("")
            setUpdateDescription("")

            toast.success("Update sucessfully")
            fetchChallengeCategories()
            setShowCategoryUpdateModal(false)
        } catch (error) {
            toast.error(error.response?.data || 'Error while updating category');
            
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

            <div className="flex flex-col w-full overflow-hidden text-sm ">
                <Navbar name={userDetails.name} value={open} setValue={setOpen} />
                <ToastContainer />
                <div className={`text-gray-900 min-h-[90vh]  w-full ${open ? 'pl-0 lg:pl-72' : ''} `} >
                                       
                    <div className="flex items-center justify-center p-3 py-2 m-4 bg-gray-100 rounded">
                        <p className="px-8 py-1 text-2xl text-gray-800 rounded font-Lexend_Bold"> Challenge Category </p>
                    </div>
                    <div className='w-full h-full px-4 space-y-4 '>
                        {wantAddChallengeCategory ?
                            <div className='w-full p-3 bg-gray-100 rounded font-Lexend_Medium motion-preset-slide-down-sm'>
                                <p className='flex justify-end pb-2'><IoCloseSharp size={20} className='text-gray-800 hover:text-gray-900' onClick={() => setWantAddChallengeCategory(false)} /></p>
                                <div className='flex flex-col items-center justify-between sm:flex-row'>
                                    <p className='text-lg font-Lexend_SemiBold'>Add Category</p>
                                    {/* <p
                                    className='flex items-center p-2 mt-2 text-base text-blue-500 rounded cursor-pointer sm:mt-0'
                                    onClick={() => navigate('/admin/challenges')}
                                >
                                    <FaLongArrowAltLeft className='mr-1' /> Back
                                </p> */}
                                </div>
                                

                                <form className='grid grid-cols-1 gap-4 pt-2 ' onSubmit={handleCategorySubmit}>
                                    <div className='flex flex-col'>
                                        <label>Category Name</label>
                                        <input
                                            className='w-full p-2 text-gray-600 border rounded h-9 sm:w-2/3 md:w-1/2 font-Lexend_Regular focus:border-gray-500 focus:ring-1 focus:ring-gray-300 focus:outline-none'
                                            placeholder='Enter category name'
                                            value={categoryName}
                                            onChange={(e) => setCategoryName(e.target.value)}
                                            onFocus={() => setCategoryNameFocus(true)}
                                            onBlur={() => setCategoryNameFocus(false)}
                                            min={3}
                                            max={100}
                                        />
                                        {categoryNameFocus && categoryName && !validCategoryName && (
                                            <p className="mt-1 text-sm text-red-500 font-Lexend_Light">
                                                Only letters, numbers, spaces, and .,'&()- are allowed.
                                            </p>
                                        )}
                                    </div>
                                    <div className='flex flex-col'>
                                        <label>Category Description</label>
                                        <textarea
                                            className='w-full p-2 text-gray-600 border rounded sm:w-2/3 md:w-1/2 font-Lexend_Regular focus:border-gray-500 focus:ring-1 focus:ring-gray-300 focus:outline-none'
                                            placeholder='Enter description'
                                            value={categoryDescription}
                                            rows={4}
                                            onChange={(e) => setCategoryDescription(e.target.value)}
                                            onFocus={() => setCategoryDescriptionFocus(true)}
                                            onBlur={() => setCategoryDescriptionFocus(false)}
                                        />
                                        {categoryDescriptionFocus && categoryDescription && !validCategoryDescription && (
                                            <p className="mt-1 text-sm text-red-500 font-Lexend_Light">
                                                Only letters, numbers, spaces, and . , ! ? ' " @ ( ) & : / - are allowed.
                                            </p>
                                        )}
                                    </div>
                                    <button className='p-1 text-white bg-gray-600 rounded w-28 h-9' type='submit'>
                                        Add
                                    </button>
                                </form>
                            </div>
                            : <div>
                                <div className={`flex items-center justify-center md:justify-end w-full `}>
                                    <button className='flex items-center justify-center px-2 py-1 text-sm text-white rounded cursor-pointer font-Lexend_Medium bg-slate-800'
                                        onClick={() => {
                                            setWantAddChallengeCategory(true)
                                            fetchChallengeCategories()
                                        }}
                                    >
                                        <FaPlusCircle className='mr-1' size={18} /> <p> Add New Challenge Category</p>
                                    </button>
                                </div>

                            </div>
                        }

                    </div>

                    <div className='p-3 m-4 overflow-x-auto border rounded-lg'>
                        <div className="flex items-center justify-end pb-3 font-Lexend_Regular">
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

                        <ChallengeCategoryTable
                            challengesCategory={challengesCategory}
                            sortBy={sortBy}
                            sortDirection={sortDirection}
                            setSortBy={setSortBy}
                            setSortDirection={setSortDirection}
                            currentPage={currentPage}
                            setCurrentPage={setCurrentPage}
                            rowsPerPage={rowsPerPage}
                            handleSort={handleSort}
                            setUpdateId={setUpdateId}
                            setUpdateName={setUpdateName}
                            setUpdateDescription={setUpdateDescription}
                            setShowCategoryUpdateModal={setShowCategoryUpdateModal}
                            setSelectedForDeleteCategoryId={setSelectedForDeleteCategoryId}
                            setShowCategoryDeleteModal={setShowCategoryDeleteModal}
                            isLoading={tableLoading}
                        />
                        {challengesCategory.totalPages > 0 && (
                            <Pagination
                                totalItems={challengesCategory.totalElements}
                                totalPages={challengesCategory.totalPages}
                                currentPage={currentPage}
                                itemsPerPage={rowsPerPage}
                                setCurrentPage={setCurrentPage}
                            />
                        )}
                    </div>
                </div>
                {showCategoryDeleteModal && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 font-Lexend_Regular">
                        <div className="p-6 text-center bg-white rounded shadow-lg">
                            <h2 className="mb-4 text-lg font-semibold">Are you sure?</h2>
                            <p>Do you really want to delete this category?</p>
                            <div className="flex justify-center mt-6 space-x-4">
                                <button
                                    className="px-4 py-2 text-white bg-red-600 rounded"
                                    onClick={() => handleDeleteCategory()}
                                >
                                    Yes, Delete
                                </button>
                                <button
                                    className="px-4 py-2 text-gray-700 bg-gray-300 rounded"
                                    onClick={() => setShowCategoryDeleteModal(false)}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {showCategoryUpdateModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                        <div className="bg-gray-100 font-Lexend_Regular w-[90%] max-w-md rounded shadow-lg p-6 overflow-y-auto">
                            <h2 className="mb-4 text-lg font-semibold text-center">Update Category</h2>
                            <form className="space-y-4">
                                <div className="flex flex-col">
                                    <label className="mb-1 text-sm text-gray-700">Name</label>
                                    <input
                                        className="p-2 text-gray-600 border border-gray-300 rounded h-9"
                                        placeholder="Enter category name"
                                        value={updateName}
                                        onChange={(e) => setUpdateName(e.target.value)}
                                    />
                                </div>

                                <div className="flex flex-col">
                                    <label className="mb-1 text-sm text-gray-700">Description</label>
                                    <textarea
                                        rows={4}
                                        className="p-2 text-gray-600 border border-gray-300 rounded"
                                        placeholder="Enter description"
                                        value={updateDescription}
                                        onChange={(e) => setUpdateDescription(e.target.value)}
                                    />
                                </div>
                            </form>

                            <div className="flex justify-center gap-3 mt-6">
                                <button
                                    className="px-4 py-2 text-white transition bg-blue-600 rounded hover:bg-blue-700"
                                    onClick={() => handleUpdateCategory()}
                                >
                                    Update
                                </button>
                                <button
                                    className="px-4 py-2 text-gray-700 transition bg-gray-300 rounded hover:bg-gray-400"
                                    onClick={() => setShowCategoryUpdateModal(false)}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>


    )
}



export default ChallengeCategory
