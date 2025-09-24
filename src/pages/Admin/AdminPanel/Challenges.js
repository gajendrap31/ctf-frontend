import React from 'react'
import Sidebar from '../Sidebar';
import { useState, useEffect, useMemo, useRef } from 'react';
import Navbar from '../Navbar';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaPlusCircle } from "react-icons/fa";
import axios from 'axios';
import { url } from '../../Authentication/Utility';
import { useNavigate } from 'react-router-dom';
import Pagination from './Pagination';
import AuthService from '../../Authentication/AuthService';
import { MdArrowDropUp, MdArrowDropDown } from "react-icons/md";
import Select from "react-select";
import { FaPlus, FaTrash, FaPen, FaFileUpload } from "react-icons/fa";

import { IoClose, IoCloseSharp } from "react-icons/io5";

import { PulseLoader } from "react-spinners";
import ChallengeTable from '../Tables/ChallengeTable'
import { motion, AnimatePresence } from "framer-motion";
function AdminChallenges({ userDetails }) {

    const [open, setOpen] = useState(true);
    const navigate = useNavigate()
    const [challengesCategory, setChallengesCategory] = useState([])
    const [challenge, setChallenge] = useState([])
    const [challengeName, setChallengeName] = useState("")
    const [questionDescription, setQuestionDescription] = useState("")
    const [maxMarks, setMaxMarks] = useState("")
    const [challengeDificulty, setChallengeDificulty] = useState("")
    const [hint, setHint] = useState("")
    const [file, setFile] = useState()
    const [flags, setFlags] = useState([""]);
    const [categoryId, setCategoryId] = useState("")
    const [showChallengeDeleteModal, setShowChallengeDeleteModal] = useState(false);
    const [selectedForDeleteChallengeId, setSelectedForDeleteChallengeId] = useState(null);

    const [wantAddChallenge, setChalllengeAdd] = useState(false)
    //Update Challenge
    const [showChallengeUpdateModal, setShowChallengeUpdateModal] = useState(false)
    const [updateChallengeId, setUpdateChallengeId] = useState()
    const [updateChallengeDifficulty, setUpdateChallengeDifficulty] = useState()
    const [updateChallengeName, setUpdateChallengeName] = useState("")
    const [updateQuestionDescription, setUpdateQuestionDescription] = useState("")
    const [updateMaxMarks, setUpdateMaxMarks] = useState("")
    const [updateHint, setUpdateHint] = useState()
    const [updateCategoryId, setUpdateCategoryId] = useState("")

    //Update Flag
    const [isFlagModalOpen, setIsFlagModalOpen] = useState(false);
    const [updateFlagChallengeId, setUpdateFlagChallengeId] = useState("")
    const [updateFlags, setUpdateFlags] = useState([]);

    //Update File
    const [isFileModalOpen, setIsFileModalOpen] = useState(false);
    const [updateFile, setUpdateFile] = useState(null);
    const [existingFileUrl, setExistingFileUrl] = useState("");
    const [existingFileName, setExistingFileName] = useState("");
    const [updateFileChallengeId, setUpdateFileChallengeId] = useState(null);
    const [newFile, setNewFile] = useState(null);

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

    const fetchChallengeCategories = async () => {
        try {
            const res = await axiosInstance.get(`/admin/challengeCategory/list`);
          
            setChallengesCategory(res.data);
        } catch (error) {
           
        }
    };
    useEffect(() => {
        fetchChallengeCategories()
    }, [])

    const fetchChallenge = async () => {
        try {
            setTableLoading(true)
            const res = await axiosInstance.get(`/admin/challenge`, {
                params: {
                    page: currentPage - 1,
                    size: rowsPerPage,
                    sortBy,
                    direction: sortDirection,
                    searchTerm: searchKey,
                },
            });
         
            setChallenge(res.data);
        } catch (error) {
           
        } finally {
            setTableLoading(false)
        }
    };
    useEffect(() => {
        fetchChallenge()
    }, [currentPage, rowsPerPage, sortBy, sortDirection, searchKey])

    useEffect(() => {
        setCurrentPage(1);
    }, [searchKey]);

    const handleChallengeSubmit = async (event) => {
        event.preventDefault();
        try {
            const formData = new FormData();
            const challengeRequest = {
                name: challengeName,
                questionDescription,
                maxMarks,
                flags,
                difficulty: challengeDificulty,
                hint,
                challengeCategoryId: categoryId,
            };

            formData.append(
                "challengeRequest",
                new Blob([JSON.stringify(challengeRequest)], { type: "application/json" })
            );

            if (file) {
                formData.append("challengeFile", file);
            }
            const response = await axiosInstance.post(`/admin/challenge`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            });
            toast.success(response.data)
            setChallengeName("")
            setQuestionDescription("")
            setMaxMarks("")
            setFlags([""])
            setFile()
            setHint("")
            setCategoryId(null)
            fetchChallenge()
        } catch (error) {
            toast.error(error.response?.data || 'Error adding challenge');
          
        }
    }

    const handleDeleteChallenge = async (id) => {
        try {
            const res = await axiosInstance.delete(`/admin/challenge/${selectedForDeleteChallengeId}`)
            toast.success(res.data)
            fetchChallenge()
        } catch (error) {
            toast.error(error.response?.data || 'Error deleting challenge');
        } finally {
            setShowChallengeDeleteModal(false);
            setSelectedForDeleteChallengeId(null);
        }
    }
    const handleUpdateChallenge = async () => {
        try {

            const res = await axiosInstance.put(`/admin/challenge/${updateChallengeId}`,
                {
                    name: updateChallengeName,
                    questionDescription: updateQuestionDescription,
                    maxMarks: updateMaxMarks,
                    difficulty: updateChallengeDifficulty,
                    hint: updateHint,
                    challengeCategoryId: updateCategoryId,

                }
            )

            toast.success(res.data)
            fetchChallenge()
        } catch (error) {
            toast.error(error.response?.data || 'error while updating challenges')
        } finally {
            setUpdateChallengeId()
            setUpdateCategoryId()
            setUpdateChallengeName()
            setUpdateQuestionDescription()
            setUpdateMaxMarks()
            setShowChallengeUpdateModal(false);
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
    const options = challengesCategory.map((category) => ({
        value: category.id,
        label: category.name,
    }));

    const handleUpdateFlag = async () => {
        try {
            const res = await axiosInstance.put(`/admin/challenge/${updateFlagChallengeId}/flag`,
                { flags: updateFlags }
            )
            toast.success(res.data)
            fetchChallenge()
            setIsFlagModalOpen(false)
        } catch (error) {
            toast.error(error.response?.data || 'error while updating challenges')
          
        } finally {
           
        }
    };
    const handleDeleteFlag = async (flag, index) => {
        try {

            if (flag.id !== 0) {
                const res = await axiosInstance.delete(`/admin/challenge/flag/${flag.id}`)
                toast.success(res.data)
            }
            setUpdateFlags(updateFlags.filter((_, ind) => ind !== index))
            fetchChallenge()
        } catch (error) {
            toast.error(error.response.data)
        }
    }


    const handleUpdateFileSubmit = async () => {
        if (!newFile || !updateFileChallengeId) return;

        const formData = new FormData();
        formData.append("challengeFile", newFile);

        try {
            const res = await axiosInstance.put(`/admin/challenge/${updateFileChallengeId}/file`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            toast.success(res.data || "File updated successfully!");
            setIsFileModalOpen(false);
            setUpdateFile(null);

            fetchChallenge()
        } catch (err) {
            toast.error(err.response.data || "Failed to update file");
        }
    };

    const handleDeleteFile = async () => {
        try {
            const res = await axiosInstance.delete(`/admin/challenge/${updateFileChallengeId}/file`);
            toast.success(res.data || "File deleted successfully!");
            setUpdateFile(null);
            setExistingFileUrl()
            setExistingFileName()

            fetchChallenge()
        } catch (err) {
            toast.error(err.response.data || "Failed to delete file");
        }
    };
    const getChallengeFileById = async (challengeId) => {
        try {
            const response = await axiosInstance.get(`admin/challenge/${challengeId}/file`, {
                responseType: "blob",
            });

            const contentDisposition = response.headers['content-disposition'];
            let fileName = "downloaded_file";
            if (contentDisposition) {
                const fileNameMatch = contentDisposition.match(/filename\*?=(?:UTF-8''|")(.*?)(?="|;|$)/);
                if (fileNameMatch && fileNameMatch[1]) {
                    fileName = decodeURIComponent(fileNameMatch[1]);
                }
            }

            const fileUrl = URL.createObjectURL(response.data);

            return { fileUrl, fileName };  // return both
        } catch (error) {
           
            return null;
        }
    };
    const [modalOpen, setModalOpen] = useState(false);
    return (
        <div className="overflow-hidden ">
            <Sidebar open={open} name={userDetails.username} value={open} setValue={setOpen} />

            <div className="flex flex-col w-full overflow-hidden text-sm">
                <Navbar name={userDetails.name} value={open} setValue={setOpen} />
                <ToastContainer />
                <div className={`text-gray-900 min-h-lvh    w-full ${open ? 'pl-0 lg:pl-72' : ''} `} >
                   
                    <div className="flex items-center justify-center p-3 py-2 m-4 bg-gray-100 rounded">
                        <p className="px-8 py-1 text-2xl text-gray-800 rounded font-Lexend_Bold"> Challenges </p>
                    </div>
                    <div className='relative flex items-center justify-center w-full'>
                            {wantAddChallenge ? (
                                    <div className='w-full p-3 m-4 bg-gray-100 rounded font-Lexend_Medium motion-preset-slide-down-sm '>
                                        <p className='flex justify-end pb-2'><IoCloseSharp size={20} className='text-gray-800 hover:text-gray-900' onClick={() => setChalllengeAdd(false)} /></p>
                                        <div className='flex flex-col items-center justify-between text-2xl sm:flex-row'>

                                            <p className='flex items-center'>Add Challenges</p>
                                            <div className='flex space-x-2'>
                                                <button onClick={() => setModalOpen(true)} className='flex items-center px-2 py-1 mt-2 text-sm text-white rounded cursor-pointer bg-slate-700 sm:mt-0'>
                                                    Import from Excel
                                                </button>
                                                <p
                                                    className='flex items-center px-2 mt-2 text-sm text-white rounded cursor-pointer bg-slate-700 sm:mt-0'
                                                    onClick={() => navigate('/admin/challenge-category')}
                                                >
                                                    <FaPlusCircle className='mr-1' size={18} /> New Category
                                                </p>
                                            </div>
                                            <ExcelUploadModal
                                                isOpen={modalOpen}
                                                onClose={() => setModalOpen(false)}
                                                fetchChallenge={fetchChallenge}
                                                axiosInstance={axiosInstance}
                                            />
                                        </div>

                                        <form className="grid grid-cols-1 gap-4 mt-5" onSubmit={handleChallengeSubmit}>
                                            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                                                <div className="flex flex-col">
                                                    <label>Challenge Category<span className='ml-1 text-xl text-red-500'>*</span></label>
                                                    <Select
                                                        className="text-gray-600 border rounded focus:border-gray-500 focus:ring-1 focus:ring-gray-300 focus:outline-none"
                                                        classNamePrefix="select"
                                                        value={options.find(option => option.value === categoryId) || null}
                                                        onChange={(selectedOption) => setCategoryId(selectedOption?.value || null)}
                                                        options={options}
                                                        placeholder="Select challenge category"
                                                        isClearable
                                                        required
                                                        styles={{
                                                            control: (provided, state) => ({
                                                                ...provided,
                                                                borderColor: state.isFocused ? "#6b7280" : "#d1d5db",
                                                                boxShadow: state.isFocused ? "0 0 0 2px rgba(107, 114, 128, 0.3)" : "none",
                                                                "&:hover": {
                                                                    borderColor: "#6b7280",
                                                                },
                                                            }),
                                                        }}
                                                    />
                                                </div>
                                                <div className="flex flex-col">
                                                    <label htmlFor="OrganizationType" className="">Difficulty<span className='ml-1 text-xl text-red-500'>*</span> </label>
                                                    <select
                                                        id="dropdown"
                                                        value={challengeDificulty}
                                                        onChange={(e) => {
                                                            e.preventDefault();
                                                            setChallengeDificulty(e.target.value)
                                                        }}
                                                        required
                                                        className={`rounded  placeholder:text-gray-400 p-2 border text-gray-600 focus:border-gray-500 focus:ring-1 focus:ring-gray-300 focus:outline-none `}
                                                    >
                                                        <option value="" disabled>Select difficulty</option>
                                                        <option value="Easy" >Easy</option>
                                                        <option value="Medium" >Medium</option>
                                                        <option value="Hard" >Hard</option>
                                                    </select>
                                                </div>
                                                <div className="grid grid-cols-1 gap-4">
                                                    <div className="flex flex-col">
                                                        <label>Name<span className='ml-1 text-xl text-red-500'>*</span></label>
                                                        <input
                                                            className="p-2 text-gray-600 border rounded focus:border-gray-500 focus:ring-1 focus:ring-gray-300 focus:outline-none"
                                                            placeholder="Enter challenge name"
                                                            value={challengeName}
                                                            required
                                                            onChange={(e) => setChallengeName(e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <label>Max Marks<span className='ml-1 text-xl text-red-500'>*</span></label>
                                                        <input
                                                            className="p-2 text-gray-600 border rounded focus:border-gray-500 focus:ring-1 focus:ring-gray-300 focus:outline-none"
                                                            placeholder="Enter max marks"
                                                            value={maxMarks}
                                                            type="number"
                                                            min={1}
                                                            required
                                                            onChange={(e) => setMaxMarks(e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex flex-col">
                                                    <label>Question Description<span className='ml-1 text-xl text-red-500'>*</span></label>
                                                    <textarea
                                                        className="p-2 text-gray-600 border rounded focus:border-gray-500 focus:ring-1 focus:ring-gray-300 focus:outline-none"
                                                        rows={5}
                                                        placeholder="Enter question description"
                                                        value={questionDescription}
                                                        required
                                                        onChange={(e) => setQuestionDescription(e.target.value)}
                                                    />
                                                </div>
                                                <div className="flex flex-col">
                                                    <label>Hint</label>
                                                    <input
                                                        className="p-2 text-gray-600 border rounded focus:border-gray-500 focus:ring-1 focus:ring-gray-300 focus:outline-none"
                                                        placeholder="Enter hint"
                                                        value={hint}
                                                        type='text'
                                                        onChange={(e) => setHint(e.target.value)}
                                                    />
                                                </div>
                                                <div className="flex flex-col">
                                                    <label>File</label>
                                                    <input
                                                        className="p-2 text-gray-600 border rounded focus:border-gray-500 focus:ring-1 focus:ring-gray-300 focus:outline-none"
                                                        type="file"
                                                        accept=".pdf,.png,.jpg,.jpeg,.txt"
                                                        onChange={(e) => {
                                                            const file = e.target.files[0];

                                                            setFile(file);

                                                        }}
                                                    />

                                                </div>

                                                <div className="grid col-span-1 sm:col-span-2">
                                                    <label className="">Flags<span className='ml-1 text-xl text-red-500'>*</span></label>
                                                    <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                                                        {flags.map((flag, index) => (
                                                            <div key={index} className="flex items-center space-x-2">
                                                                <input
                                                                    className="flex-grow h-10 p-2 text-gray-600 border border-gray-300 rounded focus:border-gray-500 focus:ring-1 focus:ring-gray-300 focus:outline-none"
                                                                    placeholder={`Enter flag ${index + 1}`}
                                                                    value={flag}
                                                                    required
                                                                    onChange={(e) => {
                                                                        const updated = [...flags];
                                                                        updated[index] = e.target.value;
                                                                        setFlags(updated);
                                                                    }}// handleFlagChange(index, e.target.value)}removeFlag(index)
                                                                />
                                                                {flags.length > 1 && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            setFlags(flags.filter((_, ind) => ind !== index))
                                                                        }}
                                                                        className="text-red-500 hover:text-red-700"
                                                                    >
                                                                        <FaTrash />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setFlags([...flags, ""]);
                                                        }}
                                                        className="flex items-center mt-2 space-x-1 text-sm text-gray-600 hover:text-gray-800 w-fit"
                                                    >
                                                        <FaPlus />
                                                        <span>Add more flag</span>
                                                    </button>
                                                </div>
                                            </div>
                                            <button className="p-1 text-white bg-gray-600 rounded w-28 h-9" type="submit">
                                                Add
                                            </button>
                                        </form>

                                    </div>): <>
                                <div className={`flex items-center justify-center md:justify-end w-full px-4`}>
                                    <button className='flex items-center justify-center px-2 py-1 text-sm text-white rounded cursor-pointer font-Lexend_Medium bg-slate-800'
                                        onClick={() => {
                                            setChalllengeAdd(true)
                                            fetchChallengeCategories()
                                        }}
                                    >
                                        <FaPlusCircle className='mr-1' size={18} /> <p> Add New Challenge </p>
                                    </button>
                                </div>

                            </>}
                      
                    </div>

                    <div className="p-3 m-4 border rounded-lg">
                        <div className="flex items-center justify-end font-Lexend_Regular">
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
                        <ChallengeTable
                            challenges={challenge}
                            sortBy={sortBy}
                            sortDirection={sortDirection}
                            setSortBy={setSortBy}
                            setSortDirection={setSortDirection}
                            handleSort={handleSort}
                            currentPage={currentPage}
                            rowsPerPage={rowsPerPage}
                            setCurrentPage={setCurrentPage}
                            setUpdateChallengeId={setUpdateChallengeId}
                            setUpdateCategoryId={setUpdateCategoryId}
                            setUpdateChallengeDifficulty={setUpdateChallengeDifficulty}
                            setUpdateChallengeName={setUpdateChallengeName}
                            setUpdateQuestionDescription={setUpdateQuestionDescription}
                            setUpdateHint={setUpdateHint}
                            setUpdateMaxMarks={setUpdateMaxMarks}
                            setShowChallengeUpdateModal={setShowChallengeUpdateModal}
                            setSelectedForDeleteChallengeId={setSelectedForDeleteChallengeId}
                            setShowChallengeDeleteModal={setShowChallengeDeleteModal}
                            setIsFileModalOpen={setIsFileModalOpen}
                            setUpdateFileChallengeId={setUpdateFileChallengeId}
                            getChallengeFileById={getChallengeFileById}
                            setUpdateFile={setUpdateFile}
                            setExistingFileName={setExistingFileName}
                            setExistingFileUrl={setExistingFileUrl}
                            setNewFile={setNewFile}
                            setUpdateFlagChallengeId={setUpdateFlagChallengeId}
                            setUpdateFlags={setUpdateFlags}
                            setIsFlagModalOpen={setIsFlagModalOpen}
                            isLoading={tableLoading}
                        />
                        {challenge.totalPages > 0 && (
                            <Pagination
                                totalItems={challenge.totalElements}
                                totalPages={challenge.totalPages}
                                currentPage={currentPage}
                                itemsPerPage={rowsPerPage}
                                setCurrentPage={setCurrentPage}
                            />
                        )}
                    </div>
                    {showChallengeDeleteModal && (
                        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 font-Lexend_Regular">
                            <div className="p-6 text-center bg-white rounded shadow-lg">
                                <h2 className="mb-4 text-lg font-semibold">Are you sure?</h2>
                                <p>Do you really want to delete this challenge?</p>
                                <div className="flex justify-center mt-6 space-x-4">
                                    <button
                                        className="px-4 py-2 text-white bg-red-600 rounded"
                                        onClick={() => handleDeleteChallenge()}
                                    >
                                        Yes, Delete
                                    </button>
                                    <button
                                        className="px-4 py-2 text-gray-700 bg-gray-300 rounded"
                                        onClick={() => setShowChallengeDeleteModal(false)}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                    {showChallengeUpdateModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 bg-black bg-opacity-50">
                            <div className="bg-gray-100 rounded shadow-lg w-11/12 sm:w-2/3 md:w-1/2 lg:w-1/3 max-h-[90vh] overflow-y-auto p-4 sm:p-6 font-Lexend_Regular motion-preset-slide-down-sm">
                               <div className='flex items-center justify-end '><IoClose size={18} onClick={() => setShowChallengeUpdateModal(false)} /></div>
                                <h2 className="mb-4 text-lg font-semibold text-center">Update</h2>
                                <form className="space-y-4">
                                    {/* Category Select */}
                                    <div className="flex flex-col">
                                        <label>Category</label>
                                        <Select
                                            classNamePrefix="select"
                                            value={options.find(option => option.value === updateCategoryId) || null}
                                            onChange={(selectedOption) => setUpdateCategoryId(selectedOption?.value || null)}
                                            options={options}
                                            placeholder="Select challenge category"
                                            isClearable
                                            required
                                            styles={{
                                                control: (provided, state) => ({
                                                    ...provided,
                                                    borderColor: state.isFocused ? "#6b7280" : "#d1d5db",
                                                    boxShadow: state.isFocused ? "0 0 0 2px rgba(107, 114, 128, 0.3)" : "none",
                                                    "&:hover": {
                                                        borderColor: "#6b7280",
                                                    },
                                                }),
                                            }}
                                        />
                                    </div>

                                    {/* Difficulty */}
                                    <div className="flex flex-col">
                                        <label htmlFor="OrganizationType">Challenge Difficulty</label>
                                        <select
                                            id="dropdown"
                                            value={updateChallengeDifficulty}
                                            onChange={(e) => setUpdateChallengeDifficulty(e.target.value)}
                                            required
                                            className="p-2 text-gray-600 border rounded focus:border-gray-500 focus:ring-1 focus:ring-gray-300 focus:outline-none"
                                        >
                                            <option value="" disabled>Select difficulty</option>
                                            <option value="Easy">Easy</option>
                                            <option value="Medium">Medium</option>
                                            <option value="Hard">Hard</option>
                                        </select>
                                    </div>

                                    {/* Name */}
                                    <div className="flex flex-col">
                                        <label>Name</label>
                                        <input
                                            className="p-2 text-gray-600 rounded h-9"
                                            placeholder="Enter challenge name"
                                            value={updateChallengeName}
                                            onChange={(e) => setUpdateChallengeName(e.target.value)}
                                        />
                                    </div>

                                    {/* Description */}
                                    <div className="flex flex-col">
                                        <label>Description</label>
                                        <textarea
                                            className="p-2 rounded "
                                            rows={4}
                                            placeholder="Enter description"
                                            value={updateQuestionDescription}
                                            onChange={(e) => setUpdateQuestionDescription(e.target.value)}
                                        />
                                    </div>

                                    {/* Hint */}
                                    <div className="flex flex-col">
                                        <label>Hint</label>
                                        <input
                                            className="p-2 text-gray-600 rounded h-9"
                                            placeholder="Enter hint"
                                            value={updateHint}
                                            onChange={(e) => setUpdateHint(e.target.value)}
                                        />
                                    </div>

                                    {/* Max Marks */}
                                    <div className="flex flex-col">
                                        <label>Max Marks</label>
                                        <input
                                            className="p-2 text-gray-600 rounded h-9"
                                            placeholder="Enter max marks"
                                            value={updateMaxMarks}
                                            onChange={(e) => setUpdateMaxMarks(e.target.value)}
                                        />
                                    </div>
                                </form>

                                {/* Buttons */}
                                <div className="flex justify-center mt-6 space-x-4">
                                    <button
                                        className="px-4 py-2 text-white bg-blue-600 rounded"
                                        onClick={() => handleUpdateChallenge()}
                                    >
                                        Update
                                    </button>
                                    <button
                                        className="px-4 py-2 text-gray-700 bg-gray-300 rounded"
                                        onClick={() => setShowChallengeUpdateModal(false)}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {isFlagModalOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 font-Lexend_Regular ">
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    handleUpdateFlag(); // perform flag update only if form is valid
                                }}
                                className="bg-white pb-6  rounded-lg shadow-md w-[500px] space-y-4 motion-preset-slide-down-sm"
                            >
                                <div className='flex items-center justify-end p-2'><IoClose size={18} onClick={() => setIsFlagModalOpen(false)} /> </div>
                                <h2 className="text-lg text-center font-Lexend_SemiBold">Update Flags</h2>
                                <div className="grid grid-cols-1 gap-4 px-6">
                                    {updateFlags.map((flag, index) => (
                                        <div key={index} className="flex items-center space-x-2">
                                            <input
                                                className="flex-grow h-10 p-2 text-gray-600 border border-gray-300 rounded focus:border-gray-500 focus:ring-1 focus:ring-gray-300 focus:outline-none"
                                                placeholder={`Enter flag ${index + 1}`}
                                                value={flag.flag}
                                                required
                                                onChange={(e) => {
                                                    const updated = [...updateFlags];
                                                    updated[index] = { ...updated[index], flag: e.target.value };
                                                    setUpdateFlags(updated);
                                                }}
                                            />
                                            {updateFlags.length > 1 && (flag.id !== 0 ?
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteFlag(flag, index)
                                                        // setUpdateFlags(updateFlags.filter((_, ind) => ind !== index))
                                                    }
                                                    className="text-gray-600 hover:text-gray-800"
                                                >
                                                    <FaTrash className='mx-1' />
                                                </button> : <button
                                                    type="button"
                                                    onClick={() =>
                                                        setUpdateFlags(updateFlags.filter((_, ind) => ind !== index))
                                                    }
                                                    className="text-gray-600 hover:text-gray-800"
                                                >
                                                    <IoClose size={24} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setUpdateFlags([...updateFlags, { id: 0, flag: "" }])}
                                    className="flex items-center px-6 mt-2 space-x-1 text-sm text-gray-600 hover:text-gray-800 w-fit"
                                >
                                    <FaPlus />
                                    <span>Add more flag</span>
                                </button>
                                <div className="flex justify-end px-6 pt-2 space-x-2">
                                    <button
                                        type="button"
                                        className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                                        onClick={() => setIsFlagModalOpen(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-3 py-1 text-white bg-blue-600 rounded hover:bg-blue-700"
                                    >
                                        Update
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                    {isFileModalOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 font-Lexend_Regular">
                            <div className="w-full max-w-lg pb-6 mx-3 space-y-4 bg-white rounded-lg shadow-md motion-preset-slide-down-sm">
                                <div className='flex items-center justify-end p-2'><IoClose size={18} onClick={() => setIsFileModalOpen(false)} /></div>
                                <h2 className="px-6 text-lg text-center font-Lexend_SemiBold">Manage Challenge File</h2>

                                {/* View / Download current file */}
                                {existingFileUrl ? (
                                    <div className="px-6 space-y-2">
                                        <p className="text-sm text-gray-700">Current File:</p>
                                        <div className="flex flex-col items-center p-2 space-y-2 border rounded">
                                            <p
                                                // href={existingFileUrl}
                                                // target="_blank"
                                                // rel="noopener noreferrer"
                                                className="text-sm text-gray-600 break-all"
                                            >
                                                {existingFileName}
                                            </p>
                                            <div className='flex space-x-2'>
                                                <a
                                                    href={existingFileUrl}
                                                    download={existingFileName}
                                                    className="px-3 py-1 text-sm text-white bg-gray-700 rounded hover:bg-gray-800 w-fit"
                                                >
                                                    Download
                                                </a>
                                                <button
                                                    className="px-3 py-1 text-sm text-white bg-gray-700 rounded hover:bg-gray-800 w-fit "
                                                    onClick={handleDeleteFile}
                                                // disabled={!updateFile}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="px-6 text-sm text-gray-500">No file uploaded yet.</p>
                                )}


                                {/* Upload new file */}
                                <div className="px-6 space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">Upload New File</label>
                                    <input
                                        type="file"
                                        accept=".pdf,.png,.jpg,.jpeg,.txt"
                                        onChange={(e) => setNewFile(e.target.files?.[0] || null)}
                                        className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                                    />
                                    {newFile && (
                                        <p className="mt-1 text-sm text-gray-500 break-all">Selected: {newFile.name}</p>
                                    )}

                                </div>

                                {/* Action Buttons */}
                                <div className="flex justify-end px-6 pt-2 space-x-2">
                                    <button
                                        className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                                        onClick={() => {
                                            setIsFileModalOpen(false);
                                            setUpdateFile(null);
                                        }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
                                        onClick={handleUpdateFileSubmit}
                                    // disabled={!updateFile}
                                    >
                                        {existingFileUrl ? "Update" : "Upload"}
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

const ExcelUploadModal = ({ isOpen, onClose, axiosInstance, fetchChallenge }) => {
    const fileInputRef = useRef(null);
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false)
    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async () => {
        try {
            setLoading(true);

            const formData = new FormData();
            formData.append("file", file);

            const res = await axiosInstance.post(`/admin/challenges/import`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            toast.success(res.data || "Uploaded successfully.");
            fetchChallenge();
            onClose();

            setFile(null);
            if (fileInputRef.current) fileInputRef.current.value = null;
        } catch (error) {
            toast.error(error.response?.data || "Failed to import challenges from Excel.");

            setFile(null);
            if (fileInputRef.current) fileInputRef.current.value = null;
        } finally {
            setLoading(false);
        }
    };


    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-20">


            <div className="pb-6 mx-3 text-base bg-white rounded-lg shadow-lg sm:w-3/4 md:w-2/3 lg:w-1/2 2xl:w-1/3 sm:mx-0 motion-preset-slide-down-sm">
                <div className='flex items-center justify-end p-2'><IoClose size={18} onClick={onClose} /></div>
                <div className='px-6'>
                    <h2 className="mb-4 text-xl font-semibold">Upload Excel File</h2>

                    <input
                        type="file"
                        accept=".xlsx,.xls"
                        required
                        onChange={handleFileChange}
                        ref={fileInputRef}
                        className="mb-4 text-"
                    />
                </div>

                <div className="flex justify-end px-6 space-x-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading || !file}
                        className="flex items-center justify-center px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 disabled:cursor-not-allowed"
                    >
                        {loading ? <PulseLoader size={16} color={"#fff"} className="py-1" /> : "Submit"}
                    </button>
                </div>
                <div className='px-6 font-Lexend_Regular'>
                    <p className="mb-2 font-semibold">Instructions:</p>
                    <ul className="space-y-1 text-sm leading-relaxed list-disc list-inside">
                        <li>Ensure the Excel file is in <strong>.xlsx</strong> format.</li>

                        <li>
                            Required Columns (in exact order):
                            <ul className="ml-4 space-y-1 list-decimal list-inside">
                                <li><strong>Challenge Category</strong> – Must match an existing category name.</li>
                                <li><strong>Difficulty</strong> – One of: Easy, Medium, Hard.</li>
                                <li><strong>Name</strong> – Challenge name.</li>
                                <li><strong>Question Description</strong> – The question/problem statement.</li>
                                <li><strong>Max Marks</strong> – Numeric value (e.g., 10, 20).</li>
                                <li><strong>Hint</strong> – Optional.</li>
                                <li><strong>Flags</strong> – Comma-separated (e.g., <code>flag1,flag2</code>).</li>
                            </ul>
                        </li>

                        <li>
                            A challenge will <strong>not</strong> be saved if:
                            <ul className="ml-4 space-y-1 list-decimal list-inside">
                                <li>A challenge with the same name and description, or</li>
                                <li>A challenge with the same name and category already exists.</li>
                            </ul>
                        </li>

                        <li>Go to the <strong>Import Challenges</strong> section and click on <strong>“Choose File”</strong>.</li>
                        <li>Select your Excel file and click <strong>“Upload”</strong> or <strong>“Import”</strong>.</li>

                        <li>
                            After successful upload, challenges will be added to the system.<br />
                            Errors (if any) will be displayed with details.
                        </li>

                        <li>
                            ⚠️ <strong>Note:</strong> Do not change column headers. Avoid empty rows or unsupported characters in the data.
                        </li>
                    </ul>
                </div>

            </div>

        </div>
    );
};
export default AdminChallenges