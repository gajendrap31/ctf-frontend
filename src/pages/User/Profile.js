import Sidebar from "./Sidebar"
import Navbar from "./Navbar"
import { useState, useEffect, useMemo, useRef, useContext } from "react";
import axios from "axios";
import { axiosInstance, url } from "../Authentication/Utility";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AuthService from "../Authentication/AuthService";
import { useNavigate } from "react-router-dom";
import CryptoJS from 'crypto-js'
import { ProfileContext } from "../Context API/ProfileContext";
import { BsPencil } from "react-icons/bs";
import { faEye, faEyeSlash, } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import CreatableSelect from 'react-select/creatable';
import { PulseLoader } from "react-spinners";
import ProfileStats from "./ProfileStats";

const NAME_REGEX = /^[A-Za-z]+([ '-][A-Za-z]+)*$/;
const EMAIL_REGEX = /^[a-zA-Z0-9][a-zA-Z0-9._%+-]*@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const USERNAME_REGEX = /^[a-zA-Z]([a-zA-Z0-9._-]*[a-zA-Z0-9])?$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%&*_+=])[a-zA-Z\d!@#$%&*_+=]+$/;
const ORG_NAME_REGEX = /^[A-Za-z0-9&.,'()\-\s]+$/;
const ORG_PLACE_REGEX = /^[A-Za-z.'\-() ]+$/;
const MOBILE_REGEX = /^[6-9]\d{9}$/
function UserProfile() {

    const [openSidebar, setOpenSidebar] = useState(true);

    const { userDetails, fetchUserDetails } = useContext(ProfileContext);
    const [organisationTypeData, setOrganisationTypeData] = useState([])
    const [organisationData, setOrganisationData] = useState([])
    const [courseData, setCourseData] = useState([])
    const [organisationStateData, setOrganisationStateData] = useState([])
    const [showModal, setShowModal] = useState(false);
    const [showImageModal, setShowImageModal] = useState(false);
    const [showIdentityCardModal, setShowIdentityCardModal] = useState(false);
    //const [profilePicture, setProfilePicture] = useState()
    const [isProfileChanges, setIsProfileChanges] = useState(false)
    const { profilePicture, setProfilePicture, fetchProfilePicture } = useContext(ProfileContext);

    const navigate = useNavigate()
    useEffect(() => {
        const handleResize = () => {
            setOpenSidebar(window.innerWidth >= 1280);
        };
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);
    useEffect(() => {
        const token = AuthService.getToken();
        if (!AuthService.isTokenValid(token)) {
            navigate('/');
        }
    }, [navigate]);
    const token = useMemo(() => localStorage.getItem("Token"), []);
    const axiosInstance = axios.create({
        baseURL: url,
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        withCredentials: true,
    });

    const [isEditing, setIsEditing] = useState(false);
    const [form, setForm] = useState({
        fullName: userDetails?.fullName || "",
        email: userDetails?.email || "",
        mobile: userDetails?.mobile || "",
        username: userDetails?.username || "",
        userType: userDetails?.userType || "",
        level: userDetails?.level || "",
        levelInfo: userDetails?.levelInfo || "",
        organisationType: userDetails?.organisation?.organisationType || "",
        organisationId: userDetails?.organisation?.id || "",
        organisation: userDetails.organisation || "",
        organisationName: userDetails?.organisation?.name || "",
        organisationPlace: userDetails?.organisation?.place || "",
        organisationState: userDetails?.organisation?.stateAndUT.name || "",
    });

    useEffect(() => {
        setForm({
            fullName: userDetails?.fullName || "",
            email: userDetails?.email || "",
            mobile: userDetails?.mobile || "",
            username: userDetails?.username || "",
            userType: userDetails?.userType || "",
            level: userDetails?.level || "",
            levelInfo: userDetails?.levelInfo || "",
            organisationType: userDetails?.organisationType || "",
            organisationId: userDetails?.organisation?.id || "",
            organisation: userDetails.organisation || "",
            organisationName: userDetails?.organisation?.name || "",
            organisationPlace: userDetails?.organisation?.place || "",
            organisationState: userDetails?.organisation?.stateAndUT.name || "",
        });
    }, [userDetails]);


    const handleSave = async () => {
        try {
            const organisationId =
                form.organisationId === "Other" ? null : parseInt(form.organisationId, 10);

            const organisation =
                organisationId === null
                    ? {
                        name: form.organisationName,
                        place: form.organisationPlace,
                        organisationType: form.organisationType,
                        stateAndUT: form.organisationState,
                    }
                    : null;

            const payload = {
                fullName: form.fullName,
                mobile: form.mobile,
                userType: form.userType,
                organisationType: form.organisationType,
                organisationId: organisationId,
                organisation: organisation,
                level: form.level,
                levelInfo: form.levelInfo,
            };

            const v1 = NAME_REGEX.test(form.fullName);
            const v2 = MOBILE_REGEX.test(form.mobile);
            const isCustomOrg = organisationId === null;
            const v3 = isCustomOrg ? ORG_NAME_REGEX.test(form.organisationName) : true;
            const v4 = isCustomOrg ? ORG_PLACE_REGEX.test(form.organisationPlace) : true;

            if (!v1 || !v2 || !v3 || !v4) {
                toast.error("Please check your details.");
                return;
            }

            const res = await axiosInstance.put(`/user/profile`, payload);
            toast.success(res.data);
            setIsEditing(false);
            fetchUserDetails();
        } catch (error) {
            toast.error(error.response?.data || "Failed to save profile");
        }
    };


    useEffect(() => {
        const fetchOrganizationType = async () => {
            try {
                const token = localStorage.getItem('Token');
                const response = await axios.get(`${url}/organisation-type`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                setOrganisationTypeData(response.data);
            } catch (error) {
            }
        };
        fetchOrganizationType();
    }, [])
    const fetchOrganisation = async (organisationType) => {
        try {
            const token = localStorage.getItem('Token');
            const response = await axios.get(
                `${url}/organisation/${organisationType}`,

                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );
            setOrganisationData(response.data);
        } catch (error) {
        }
    };
    const fetchCourseData = async () => {
        try {
            const token = localStorage.getItem('Token');

            const response = await axios.get(`${url}/degree`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setCourseData(response.data);
        } catch (error) {
        }
    };

    const fetchOrganisationState = async () => {
        try {
            const res = await axios.get(`${url}/statesAndUT`)
            setOrganisationStateData(res.data)
        } catch (error) {
        }
    }

    const options = courseData.map((data) => ({
        value: data.id,
        label: data.name || data, // adjust depending on your data shape
    }));

    const handleCancel = () => {
        setForm({
            fullName: userDetails?.fullName || "",
            email: userDetails?.email || "",
            mobile: userDetails?.mobile || "",
            username: userDetails?.username || "",
            userType: userDetails?.userType || "",
            level: userDetails?.level || "",
            levelInfo: userDetails?.levelInfo || "",
            organisationType: userDetails?.organisation?.organisationType || "",
            organisationId: userDetails?.organisation?.id || "",
            organisation: userDetails.organisation || "",
            organisationName: userDetails?.organisation?.name || "",
            organisationPlace: userDetails?.organisation?.place || "",
            organisationState: userDetails?.organisation?.stateAndUT.name || "",
        });
        setIsEditing(false);
    };

    return (
        <div className="overflow-hidden ">
            <Sidebar value={openSidebar} setValue={setOpenSidebar} />

            <div className="flex flex-col w-full overflow-hidden ">
                <Navbar value={openSidebar} setValue={setOpenSidebar} isProfileChanges={isProfileChanges} setProfilePicture={setProfilePicture} />
                <ToastContainer />
                <div className={`text-gray-900 overflow-auto min-h-[90vh]     w-full ${openSidebar ? 'pl-0 md:pl-72' : ''} `} >
                    <div className="relative grid grid-cols-1 text-sm border lg:grid-cols-12 font-Lexend_Regular">

                        {/*                         
                        <div className="absolute w-32 h-32 transform bg-gray-300 rounded-lg top-44 left-20 -translate-x-4/3 -translate-y-2/3 z-5">
                            <img src={"UserAssets/user.png"} alt="Loading.." />
                        </div> */}
                        <div className="grid grid-cols-1 col-span-4 gap-2 p-4 border md:grid-cols-1 md:gap-4">
                            {/* Profile Picture */}
                            <div className="flex items-center justify-center">
                                <div className="relative w-48 sm:w-64">
                                    <img
                                        src={profilePicture || "UserAssets/user.png"}
                                        alt="Profile picture"
                                        className="object-cover w-full h-auto p-1 border rounded-lg"
                                    />
                                    <div
                                        className="absolute p-2 bg-white border rounded-full shadow-md cursor-pointer bottom-1 -right-2"
                                        onClick={() => setShowImageModal(true)}
                                    >
                                        <BsPencil size={20} className="text-gray-600" />
                                    </div>
                                </div>
                            </div>

                            {/* Change Password Button */}
                            <div className="flex justify-center space-x-2 h-fit">
                                <button
                                    onClick={() => setShowModal(true)}
                                    className="px-4 py-2 text-sm border border-gray-300 rounded shadow-md hover:bg-gray-50 text-gray-950"
                                >
                                    Change Password
                                </button>
                                <button
                                    onClick={() => setShowIdentityCardModal(true)}
                                    className="px-4 py-2 text-sm border border-gray-300 rounded shadow-md hover:bg-gray-50 text-gray-950"
                                >
                                    Identity Card
                                </button>
                            </div>
                        </div>



                        <div className="col-span-8 p-4 border">
                            <div className="flex items-center justify-between px-4 py-2 border rounded-t-lg">
                                <h4 className="text-lg font-Lexend_SemiBold">Profile Information</h4>
                                {!isEditing ? (
                                    <button
                                        className="px-4 py-1 text-sm text-white bg-blue-600 border border-blue-600 rounded hover:bg-blue-700"
                                        title="Update profile information"
                                        onClick={() => {
                                            setIsEditing(true)
                                            fetchOrganisation(form.organisationType)
                                        }}
                                    >
                                        Update Profile
                                    </button>
                                ) : (
                                    <div className="space-x-2">
                                        <button
                                            className="px-4 py-1 text-sm text-white bg-blue-600 border border-blue-600 rounded hover:bg-blue-700"
                                            onClick={handleSave}
                                        >
                                            Save
                                        </button>
                                        <button
                                            className="px-4 py-1 text-sm text-blue-600 bg-white border border-blue-600 rounded hover:bg-gray-100"
                                            onClick={handleCancel}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                )}
                            </div>
                            <div className="grid grid-cols-1 border rounded-b-lg sm:grid-cols-2 font-Lexend_Regular">

                                <div className="px-4 py-2 ">
                                    <h2 className="">Name {isEditing && <span className="text-red-500">*</span>}</h2>
                                    <div className="">
                                        {isEditing ? (
                                            <input
                                                name="fullName"
                                                value={form.fullName}
                                                onChange={(e) => {
                                                    const { name, value } = e.target;
                                                    setForm((prev) => ({ ...prev, [name]: value }));
                                                }}
                                                className="w-full px-2 py-1 text-sm border border-gray-800 rounded"
                                                placeholder="Enter name"
                                            />
                                        ) : (
                                            <p className="w-full px-2 py-1 text-sm border rounded">{form.fullName || "N/A"}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Username */}
                                <div className="px-4 py-2 ">
                                    <h2 className="">Username</h2>
                                    <div className="">
                                        <p className="w-full px-2 py-1 text-sm border rounded">{form.username || "N/A"}</p>
                                        {/* {isEditing ? (
                                            <input
                                                name="username"
                                                value={form.username}
                                                onChange={(e) => {
                                                    const { name, value } = e.target;
                                                    console.log(name, value)
                                                    setForm((prev) => ({ ...prev, [name]: value }));
                                                }}
                                                className="w-full px-2 py-1 text-sm border border-gray-800 rounded"
                                                placeholder="Enter username"
                                            />
                                        ) : (
                                            <p className="w-full px-2 py-1 text-sm border rounded">{form.username || "N/A"}</p>
                                        )} */}
                                    </div>
                                </div>

                                {/* Email */}
                                <div className="px-4 py-2 ">
                                    <h2 className="">Email</h2>
                                    <div className="">
                                        <p className="w-full px-2 py-1 text-sm border rounded">{form.email || "N/A"}</p>
                                        {/* {isEditing ? (
                                            <input
                                                name="email"
                                                value={form.email}
                                                onChange={(e) => {
                                                    const { name, value } = e.target;
                                                    console.log(name, value)
                                                    setForm((prev) => ({ ...prev, [name]: value }));
                                                }}
                                                className="w-full px-2 py-1 text-sm border border-gray-800 rounded "
                                                placeholder="Enter email"
                                            />
                                        ) : (
                                            <p className="w-full px-2 py-1 text-sm border rounded">{form.email || "N/A"}</p>
                                        )} */}
                                    </div>
                                </div>

                                {/* Mobile Number */}
                                <div className="px-4 py-2 ">
                                    <h2 className="">Mobile Number {isEditing && <span className="text-red-500">*</span>}</h2>
                                    <div className="">
                                        {isEditing ? (
                                            <input
                                                name="mobile"
                                                value={form.mobile}
                                                onChange={(e) => {
                                                    const { name, value } = e.target;
                                                    setForm((prev) => ({ ...prev, [name]: value }));
                                                }}
                                                onKeyDown={(e) => {
                                                    if (
                                                        !/^[0-9]$/.test(e.key) &&
                                                        e.key !== "Backspace" &&
                                                        e.key !== "ArrowLeft" &&
                                                        e.key !== "ArrowRight" &&
                                                        e.key !== "Tab"
                                                    ) {
                                                        e.preventDefault();
                                                    }
                                                }}
                                                maxLength={10}
                                                pattern="[6-9]{1}[0-9]{9}"
                                                className="w-full px-2 py-1 text-sm border border-gray-800 rounded"
                                                placeholder="Enter mobile number"
                                            />
                                        ) : (
                                            <p className="w-full px-2 py-1 text-sm border rounded">{form.mobile || "N/A"}</p>
                                        )}
                                    </div>
                                </div>


                                {/* User Type */}
                                <div className="px-4 py-2 ">
                                    <h2 className="">User Type {isEditing && <span className="text-red-500">*</span>}</h2>
                                    <div className="">
                                        {isEditing ? (
                                            <select
                                                name="userType"
                                                value={form.userType}
                                                onChange={(e) => {
                                                    const { name, value } = e.target;
                                                    setForm((prev) => ({
                                                        ...prev,
                                                        [name]: value,
                                                        level: "",
                                                        levelInfo: "",
                                                        organisationType: "",
                                                        organisationId: "",
                                                        organisationName: "",
                                                        organisationPlace: "",
                                                    }));

                                                }}
                                                required
                                                className="w-full px-2 py-1 text-sm border border-gray-800 rounded cursor-pointer"
                                                aria-describedby="userType"
                                            >
                                                <option value="" className="text-gray-300" disabled>Select an option</option>
                                                <option value="Student" >Student</option>
                                                <option value="Employee" >Employee</option>
                                            </select>
                                        ) : (
                                            <p className="w-full px-2 py-1 text-sm border rounded">{form.userType || "N/A"}</p>
                                        )}
                                    </div>
                                </div>
                                {/* Organisation Type */}
                                <div className="px-4 py-2 ">
                                    <h2 className="">Organisation Type {isEditing && <span className="text-red-500">*</span>}</h2>
                                    <div className="">
                                        {isEditing ? (
                                            <select
                                                name="organisationType"
                                                value={form.organisationType}
                                                onChange={(e) => {
                                                    const { name, value } = e.target;
                                                    setForm((prev) => ({
                                                        ...prev,
                                                        [name]: value,
                                                        level: "",
                                                        levelInfo: "",
                                                        organisationId: "",
                                                        organisationName: "",
                                                        organisationPlace: "",
                                                    }));
                                                    fetchOrganisation(value)
                                                    if (value === "College") {
                                                        fetchCourseData()
                                                    }
                                                }}

                                                required
                                                className="w-full px-2 py-1 text-sm border border-gray-800 rounded cursor-pointer"
                                                aria-describedby="organisationType"
                                            >
                                                <option value="" className="text-gray-300" disabled>Select an option</option>
                                                {organisationTypeData && organisationTypeData
                                                    .filter(option => !(form.userType === "Student" && (option === "Government" || option === "Corporate")))
                                                    .map((data, i) => (
                                                        <option key={i} value={data} >{data}</option>

                                                    ))
                                                }
                                            </select>
                                        ) : (
                                            <p className="w-full px-2 py-1 text-sm border rounded">{form.organisationType || "N/A"}</p>
                                        )}
                                    </div>
                                </div>
                                {/*Organisation */}
                                <div className="px-4 py-2 ">
                                    <label htmlFor="organisation" className="">
                                        {form.organisationType === "College" ? " College" : form.organisationType === "School" ? "School" : form.organisationType === "Corporate" ? "Corporate Organisation" : "Goverment Organisation"} {isEditing && <span className="text-red-500">*</span>}
                                    </label>
                                    <div className="">
                                        {isEditing && form.organisationType !== "" ? (
                                            <select
                                                name="organisationId"
                                                value={form.organisationId}
                                                onChange={(e) => {
                                                    const { name, value } = e.target;
                                                    setForm((prev) => {
                                                        const updatedForm = {
                                                            ...prev,
                                                            [name]: value,
                                                        };
                                                        if (value === "Other") {
                                                            updatedForm.organisationName = "";
                                                            updatedForm.organisationPlace = ""
                                                            updatedForm.organisationState = ""
                                                            fetchOrganisationState()
                                                        }

                                                        return updatedForm;
                                                    });

                                                }}


                                                required
                                                className="w-full px-2 py-1 text-sm border border-gray-800 rounded cursor-pointer"
                                                aria-describedby="organisation"
                                            >
                                                <option value="" className="text-gray-300" disabled selected>Select an option</option>
                                                {organisationData && organisationData.map((data) => (
                                                    <option key={data.id} value={parseInt(data.id, 10)} className="break-words ">
                                                        {data.name}, {data.place}, {data.stateAndUT.name}
                                                    </option>
                                                ))}
                                                <option value="Other" className="" >Other (Add new...)</option>
                                            </select>
                                        ) : (
                                            <p className="w-full px-2 py-1 text-sm border rounded">{form.organisationName || "N/A"}{form.organisationPlace && ","} {form.organisationPlace || ""}, {form.organisationState || ""}</p>
                                        )}
                                    </div>
                                </div>
                                {/* Organisation name*/}
                                {form.organisationId === "Other" &&
                                    <div className="px-4 py-2 ">
                                        <label htmlFor="organisationName" className="">
                                            {form.organisationType === "College" ? " College" : form.organisationType === "School" ? "School" : form.organisationType === "Corporate" ? "Corporate Organisation" : "Goverment Organisation"} Name {isEditing && <span className="text-red-500">*</span>}

                                        </label>
                                        <div className="">
                                            {isEditing ? (
                                                <input
                                                    name="organisationName"
                                                    value={form.organisationName}
                                                    onChange={(e) => {
                                                        const { name, value } = e.target;
                                                        setForm((prev) => ({ ...prev, [name]: value }));
                                                    }}

                                                    className="w-full px-2 py-1 text-sm border border-gray-800 rounded"
                                                    placeholder={`Enter ${form.organisationType === "College" ? " College" : form.organisationType === "School" ? "School" : "Organisation"} name`}
                                                />
                                            ) : (
                                                <p className="w-full px-2 py-1 text-sm border rounded">{form.organisationName || "N/A"}</p>
                                            )}
                                        </div>

                                    </div>

                                }
                                {/*Organisation Place*/}
                                {form.organisationId === "Other" &&
                                    <div className="px-4 py-2 ">
                                        <label htmlFor="organisationPlace" className="">
                                            {form.organisationType === "College" ? " College" : form.organisationType === "School" ? "School" : form.organisationType === "Corporate" ? "Corporate Organisation" : "Goverment Organisation"} Place {isEditing && <span className="text-red-500">*</span>}

                                        </label>
                                        <div className="">
                                            {isEditing ? (
                                                <input
                                                    name="organisationPlace"
                                                    value={form.organisationPlace}
                                                    onChange={(e) => {
                                                        const { name, value } = e.target;
                                                        setForm((prev) => ({ ...prev, [name]: value }));
                                                    }}

                                                    className="w-full px-2 py-1 text-sm border border-gray-800 rounded"
                                                    placeholder={`Enter ${form.organisationType === "College" ? " College" : form.organisationType === "School" ? "School" : "Organisation"} place`}
                                                />
                                            ) : (
                                                <p className="w-full px-2 py-1 text-sm border rounded">{form.organisationName || "N/A"}</p>
                                            )}
                                        </div>

                                    </div>
                                }
                                {form.organisationId === "Other" &&
                                    <div className="px-4 py-2 ">
                                        <label htmlFor="organisationPlace" className="">
                                            State or Union Territory {isEditing && <span className="text-red-500">*</span>}
                                        </label>
                                        <div className="">
                                            {isEditing ? (
                                                <select
                                                    name="organisationState"
                                                    value={form.organisationState}
                                                    onChange={(e) => {
                                                        const { name, value } = e.target;
                                                        setForm((prev) => {
                                                            const updatedForm = {
                                                                ...prev,
                                                                [name]: value,
                                                            };


                                                            return updatedForm;
                                                        });

                                                    }}


                                                    required
                                                    className="w-full px-2 py-1 text-sm border border-gray-800 rounded cursor-pointer"
                                                    aria-describedby="organisationState"
                                                >
                                                    <option value="" className="text-gray-300" disabled>Select an option</option>
                                                    {organisationStateData && organisationStateData.map((data) => (
                                                        <option key={data.id} value={parseInt(data.id, 10)} className="break-words ">
                                                            {data.name}
                                                        </option>
                                                    ))}

                                                </select>
                                            ) : (
                                                <p className="w-full px-2 py-1 text-sm border rounded">{form.organisationName || "N/A"}</p>
                                            )}
                                        </div>

                                    </div>
                                }
                                {/* LevelInfo */}
                                <div className="px-4 py-2 ">
                                    <h2 className="">{form.userType === "Student" && form.organisationType === "School" ? "Class" : form.userType === "Student" && form.organisationType === "College" ? "Course" : "Designation"} {isEditing && <span className="text-red-500">*</span>}</h2>
                                    {form.userType === "Student" && form.organisationType === "School" ?
                                        <div className="">
                                            {isEditing && form.organisationType !== "" ? (
                                                <select
                                                    name="levelInfo"
                                                    value={form.levelInfo}
                                                    onChange={(e) => {
                                                        const { name, value } = e.target;
                                                        setForm((prev) => ({
                                                            ...prev,
                                                            [name]: value,
                                                            level: "Class",
                                                        }));
                                                    }}

                                                    required
                                                    className="w-full px-2 py-1 text-sm border border-gray-800 rounded cursor-pointer"
                                                    aria-describedby="levelInfo"
                                                >
                                                    <option value="" className="text-gray-300" disabled>Select an option</option>
                                                    <option value="6">6th</option>
                                                    <option value="7">7th</option>
                                                    <option value="8">8th</option>
                                                    <option value="9">9th</option>
                                                    <option value="10">10th</option>
                                                    <option value="11">11th</option>
                                                    <option value="12">12th</option>
                                                </select>
                                            ) : (
                                                <p className="w-full px-2 py-1 text-sm border rounded">{form.levelInfo || "N/A"}</p>
                                            )}
                                        </div> : form.userType === "Student" && form.organisationType === "College" ?
                                            <div className="">
                                                {isEditing && form.organisationType !== "" ? (
                                                    <CreatableSelect
                                                        isClearable
                                                        name="levelInfo"
                                                        value={form.levelInfo ? { value: form.levelInfo, label: form.levelInfo } : null}
                                                        onChange={(selectedOption) => {
                                                            setForm((prev) => ({
                                                                ...prev,
                                                                levelInfo: selectedOption ? selectedOption.value : "",
                                                                level: "Course",
                                                            }));
                                                        }}
                                                        onCreateOption={(inputValue) => {
                                                            setForm((prev) => ({
                                                                ...prev,
                                                                levelInfo: inputValue,
                                                                level: "Course",
                                                            }));
                                                        }}
                                                        options={courseData.map((course) => ({ value: course, label: course }))}
                                                        placeholder="Select or add new course"
                                                        styles={{
                                                            control: (base, state) => ({
                                                                ...base,
                                                                minHeight: "30px",
                                                                //height:"20px",
                                                                maxHeight: "30px",
                                                                paddingLeft: "10px", // no internal padding
                                                                alignItems: "center",
                                                                borderRadius: "0.25rem",
                                                                borderColor: state.isFocused ? "oklch(37.2% 0.044 257.287)" : "oklch(37.2% 0.044 257.287)",
                                                                // boxShadow:"0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)",
                                                                cursor: "pointer",
                                                                "&:hover": {
                                                                    borderColor: "#6b7280",
                                                                },
                                                            }),
                                                            valueContainer: (base) => ({
                                                                ...base,
                                                                padding: "0px",         // completely remove internal padding
                                                                margin: "0px",          // no margin
                                                                gap: "0px",             // prevent internal spacing
                                                            }),
                                                            input: (base) => ({
                                                                ...base,
                                                                margin: 0,
                                                                padding: "0px",
                                                            }),
                                                            option: (provided, { isFocused, isSelected }) => ({
                                                                ...provided,
                                                                color: "#1f2937", // Tailwind's gray-800
                                                                backgroundColor: isSelected
                                                                    ? "#e5e7eb" // gray-200
                                                                    : isFocused
                                                                        ? "#f3f4f6" // gray-100
                                                                        : "transparent",
                                                                "&:hover": {
                                                                    backgroundColor: "#f3f4f6",
                                                                },
                                                            }),
                                                            dropdownIndicator: (base) => ({
                                                                ...base,
                                                                padding: "2px",
                                                                svg: {
                                                                    width: "14px",
                                                                    height: "14px",
                                                                },
                                                            }),
                                                            clearIndicator: (base) => ({
                                                                ...base,
                                                                padding: "2px", // shrink clickable area
                                                                svg: {
                                                                    width: "14px", // smaller "×" icon
                                                                    height: "14px",
                                                                },
                                                            }),
                                                        }}


                                                    />


                                                ) : (
                                                    <p className="w-full px-2 py-1 text-sm border rounded">{form.levelInfo || "N/A"}</p>
                                                )}
                                            </div> :
                                            <div className="">
                                                {isEditing && form.organisationType !== "" ? (
                                                    <input
                                                        name="levelInfo"
                                                        value={form.levelInfo}
                                                        onChange={(e) => {
                                                            const { name, value } = e.target;
                                                            setForm((prev) => ({
                                                                ...prev,
                                                                [name]: value,
                                                                level: "Designation",
                                                            }));
                                                        }}
                                                        className="w-full px-2 py-1 text-sm border border-gray-800 rounded"
                                                        placeholder="Enter designation"
                                                    />
                                                ) : (
                                                    <p className="w-full px-2 py-1 text-sm border rounded">{form.levelInfo || "N/A"}</p>
                                                )}
                                            </div>
                                    }
                                </div>

                            </div>

                            {showModal && (
                                <ChangePasswordModal setShowModal={setShowModal} toast />
                            )}

                            <ImageModal
                                isOpen={showImageModal}
                                onClose={() => setShowImageModal(false)}
                                profilePicture={profilePicture}
                                setProfilePicture={setProfilePicture}
                                fetchProfilePicture={fetchProfilePicture}
                                axiosInstance={axiosInstance}
                            />
                            <IdentityCardModal
                                isOpen={showIdentityCardModal}
                                onClose={() => setShowIdentityCardModal(false)}
                                axiosInstance={axiosInstance}
                            />

                        </div>
                    </div>
                </div>
            </div>


        </div >

    );

}
const ImageModal = ({ isOpen, onClose, profilePicture, setProfilePicture, fetchProfilePicture, axiosInstance }) => {
    const [isProfileChanges, setIsProfileChanges] = useState(false);
    const fileInputRef = useRef(null);
    const [uploading, setUploading] = useState(false);

    const handleChangeImage = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            setProfilePicture(imageUrl);
            await uploadImage(file);
        }
    };

    const uploadImage = async (file) => {
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append("image", file);

            const res = await axiosInstance.post(`/user/profile/image`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            fetchProfilePicture();
            setIsProfileChanges(true);
        } catch (error) {
            toast.error("Failed to upload profile picture");
        } finally {
            setUploading(false);
        }
    };

    const handleRemoveImage = async () => {
        try {
            const res = await axiosInstance.delete(`/user/profile/image`);
            setProfilePicture(null);
            toast.success("Profile image removed");
            setIsProfileChanges(true);
        } catch (error) {
            toast.error("Failed to remove profile image");
        }
    };

    if (!isOpen) return null;

    const hasProfileImage = !!profilePicture;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-40">
            <div className="bg-white w-full max-w-xl rounded shadow-lg overflow-y-auto max-h-[90vh] motion-preset-slide-down-sm">
                <div className="flex justify-end px-2 pt-2">
                    <button
                        className="text-2xl text-gray-600"
                        onClick={onClose}
                        aria-label="Close modal"
                    >
                        &times;
                    </button>
                </div>
                <div className="px-6 pb-6 font-Lexend_Regular">
                    <h2 className="text-lg text-center text-gray-700 font-Lexend_SemiBold sm:text-left">
                        {hasProfileImage ? "Your Profile Picture" : "Upload Profile Picture"}
                    </h2>
                    <p className="pb-4 text-xs text-center text-gray-500 font-Lexend_Light sm:text-left">
                        Please upload a clear headshot. Only JPG or PNG formats are accepted, and the file size must not exceed 5MB.
                    </p>
                    <div className="flex items-center justify-center p-2 mb-4 border-4 border-dotted rounded-lg">
                        <img
                            src={hasProfileImage ? profilePicture : "/UserAssets/user.png"}
                            alt="Profile"
                            className="object-cover w-40 h-40 p-1 border-2 rounded-full sm:h-52 sm:w-52"
                        />
                    </div>

                    <input
                        type="file"
                        accept=".jpg, .jpeg, .png"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={handleFileChange}
                    />

                    <div className="flex flex-col gap-3 text-sm sm:flex-row sm:justify-betwee">
                        <button
                            onClick={handleChangeImage}
                            disabled={uploading}
                            className="w-full px-4 py-2 text-white bg-gray-800 border border-gray-800 rounded sm:w-auto hover:bg-gray-900"
                        >
                            {uploading ? "Uploading..." : hasProfileImage ? "Change" : "Upload"}
                        </button>
                        {hasProfileImage && (
                            <button
                                onClick={handleRemoveImage}
                                className="w-full px-4 py-2 text-gray-900 border border-gray-900 rounded sm:w-auto hover:bg-gray-200"
                            >
                                Remove
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
const IdentityCardModal = ({ axiosInstance, isOpen, onClose }) => {
    const [identityCardUrl, setIdentityCardUrl] = useState(null);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef();

    useEffect(() => {
        if (isOpen) fetchIdentityCard();
    }, [isOpen]);

    const fetchIdentityCard = async () => {
        try {
            const res = await axiosInstance.get("/user/identification", {
                responseType: "blob",
            });
            const imageUrl = URL.createObjectURL(res.data);
            setIdentityCardUrl(imageUrl);
        } catch (err) {
        }
    };

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("identificationImage", file);

        setUploading(true);
        try {
            await axiosInstance.post(`/user/identification`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            fetchIdentityCard();
        } catch (err) {
        } finally {
            setUploading(false);
        }
    };

    const handleTriggerUpload = () => fileInputRef.current.click();

    const handleRemoveImage = async () => {
        try {
            await axiosInstance.delete("/user/identification");
            setIdentityCardUrl(null);
        } catch (err) {
        }
    };

    if (!isOpen) return null;

    const hasCard = !!identityCardUrl;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-40">
            <div className="bg-white w-full max-w-xl rounded shadow-lg overflow-y-auto max-h-[90vh] motion-preset-slide-down-sm">
                <div className="flex justify-end px-3 pt-3">
                    <button
                        className="text-2xl text-gray-600"
                        onClick={onClose}
                        aria-label="Close modal"
                    >
                        &times;
                    </button>
                </div>
                <div className="px-6 pb-6 font-Lexend_Regular">
                    <h2 className="text-lg text-center text-gray-700 font-Lexend_SemiBold sm:text-left">
                        {hasCard ? "Your Identity Card" : "Upload Identity Card"}
                    </h2>
                    <p className="pb-4 text-xs text-center text-gray-500 font-Lexend_Light sm:text-left">
                        Please upload a clear and visible image of your identity card to verify your profile details. Only JPG or PNG formats are accepted, and the file size must not exceed 5MB.
                    </p>

                    <div className="flex justify-center mb-4 border-4 border-dotted rounded-lg p-2 max-h-[60vh] overflow-hidden">
                        <img
                            src={hasCard ? identityCardUrl : "/UserAssets/identityCard.png"}
                            alt="Identity card"
                            className="rounded-lg object-contain max-h-[50vh] w-full"
                        />
                    </div>

                    <input
                        type="file"
                        accept=".jpg,.jpeg,.png"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                    />

                    <div className="flex flex-col gap-3 text-sm sm:flex-row">
                        <button
                            onClick={handleTriggerUpload}
                            disabled={uploading}
                            className="w-full px-4 py-2 text-white bg-gray-800 border border-gray-800 rounded sm:w-auto hover:bg-gray-900"
                        >
                            {uploading ? "Uploading..." : hasCard ? "Change" : "Upload"}
                        </button>
                        {hasCard && (
                            <button
                                onClick={handleRemoveImage}
                                className="w-full px-4 py-2 text-gray-900 border border-gray-900 rounded sm:w-auto hover:bg-gray-200"
                            >
                                Remove
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};


function ChangePasswordModal({ setShowModal }) {
    const [currentPassword, setCurrentPassword] = useState("");
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [validCurrentPassword, setValidCurrentPassword] = useState(false);
    const [currentPasswordFocus, setCurrentPasswordFocus] = useState(false);

    const [newPassword, setNewPassword] = useState("");
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [validNewPassword, setValidNewPassword] = useState(false);
    const [newPasswordFocus, setNewPasswordFocus] = useState(false);

    const [confirmPassword, setConfirmPassword] = useState("");
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [validConfirmPassword, setValidConfirmPassword] = useState(false);
    const [confirmPasswordFocus, setConfirmPasswordFocus] = useState(false);

    const [passwordChangeLoading, setPasswordChangeLoading] = useState(false)

    const handleReset = () => {
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
    };

    useEffect(() => {
        setValidCurrentPassword(PASSWORD_REGEX.test(currentPassword));
    }, [currentPassword]);

    useEffect(() => {
        setValidNewPassword(
            newPassword.length >= 8 &&
            newPassword.length <= 40 &&
            PASSWORD_REGEX.test(newPassword)
        );

        setValidConfirmPassword(newPassword === confirmPassword && newPassword !== "");
    }, [newPassword, confirmPassword]);

    const keyString = "7QzUf03atxcazzHM1x5SLQ==";
    const ivString = "Hy7oeHHNuXxYwdRluO6c5A==";
    const key = CryptoJS.enc.Base64.parse(keyString);
    const iv = CryptoJS.enc.Base64.parse(ivString);

    const handleChangePassword = async () => {
        if (newPassword !== confirmPassword) {
            toast.error("New passwords do not match !");
            return;
        }
        if (!validNewPassword) {
            toast.error("Password does not meet the required complexity.");
            return;
        }

        const encryptedCurrentPassword = CryptoJS.AES.encrypt(currentPassword, key, {
            iv: iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7,
        }).toString();

        const encryptedNewPassword = CryptoJS.AES.encrypt(newPassword, key, {
            iv: iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7,
        }).toString();

        try {
            setPasswordChangeLoading(true)
            const token = localStorage.getItem("Token");
            const res = await axios.post(
                `${url}/password/change`,
                JSON.stringify({
                    currentPassword: encryptedCurrentPassword,
                    newPassword: encryptedNewPassword,
                }),
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    withCredentials: true,
                }
            );
            toast.success(res.data);
            handleReset();
            setShowModal(false);
        } catch (error) {
            toast.error(error.response?.data || "Failed to change password.");
        } finally {
            setPasswordChangeLoading(false)
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center text-sm bg-black bg-opacity-40 font-Lexend_Regular">
            <div className="bg-white w-[447px] rounded shadow-lg motion-preset-slide-down-sm">
                <div className="flex justify-end px-2">
                    <button className="text-2xl text-gray-600 " onClick={() => setShowModal(false)}>
                        &times;
                    </button>
                </div>
                <div className="grid grid-cols-1 px-6 pb-6 font-Lexend_Regular gap-y-4">
                    <h2 className="mb-2 text-lg text-gray-700 border-b-2 border-gray-500 font-Lexend_SemiBold">
                        Change your Password
                    </h2>

                    {/* Current Password */}
                    <div className="relative flex flex-col">
                        <label htmlFor="current-password" className="font-Lexend_SemiBold ">
                            Current Password <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <input
                                type={showCurrentPassword ? "text" : "password"}
                                id="current-password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                onFocus={() => setCurrentPasswordFocus(false)}
                                onBlur={() => setCurrentPasswordFocus(true)}
                                onPaste={(e) => e.preventDefault()}
                                maxLength={40}
                                required
                                className="w-full h-10 px-2 pr-10 text-sm border border-black rounded outline-none font-Lexend_Regular"
                                placeholder="Enter your current password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowCurrentPassword((prev) => !prev)}
                                className="absolute text-gray-600 -translate-y-1/2 right-3 top-1/2 hover:text-gray-800 focus:outline-none"
                                tabIndex={-1}
                            >
                                <FontAwesomeIcon icon={showCurrentPassword ? faEyeSlash : faEye} />
                            </button>
                        </div>
                        {currentPasswordFocus && currentPassword && !validCurrentPassword && (
                            <p className="mt-1 text-xs text-red-500">
                                doesn't meet required complexity.
                            </p>
                        )}
                    </div>

                    {/* New Password */}
                    <div className="relative flex flex-col">
                        <label htmlFor="new-password" className="mb-1 font-Lexend_SemiBold">
                            New Password <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <input
                                type={showNewPassword ? "text" : "password"}
                                id="new-password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                onFocus={() => setNewPasswordFocus(false)}
                                onBlur={() => setNewPasswordFocus(true)}
                                onPaste={(e) => e.preventDefault()}
                                maxLength={40}
                                required
                                aria-invalid={!validNewPassword}
                                className="w-full h-10 px-2 pr-10 border border-black rounded outline-none font-Lexend_Regular"
                                placeholder="Enter your new password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowNewPassword((prev) => !prev)}
                                className="absolute text-gray-600 -translate-y-1/2 right-3 top-1/2 hover:text-gray-800 focus:outline-none"
                                tabIndex={-1}
                            >
                                <FontAwesomeIcon icon={showNewPassword ? faEyeSlash : faEye} />
                            </button>
                        </div>
                        {newPasswordFocus && newPassword && !validNewPassword && (
                            <p className="mt-1 text-xs text-red-500">
                                Password must be 8–40 characters and include at least 1 uppercase letter, 1 lowercase letter, 1 digit, and 1 special character (!@#$%&*_+=).
                            </p>
                        )}
                    </div>

                    {/* Confirm Password */}
                    <div className="relative flex flex-col">
                        <label htmlFor="confirm-password" className="mb-1 font-Lexend_SemiBold">
                            Confirm Password <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                id="confirm-password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                onFocus={() => setConfirmPasswordFocus(false)}
                                onBlur={() => setConfirmPasswordFocus(true)}
                                onPaste={(e) => e.preventDefault()}
                                maxLength={40}
                                required
                                className="w-full h-10 px-2 pr-10 text-sm border border-black rounded outline-none font-Lexend_Regular"
                                placeholder="Confirm new password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword((prev) => !prev)}
                                className="absolute text-gray-600 -translate-y-1/2 right-3 top-1/2 hover:text-gray-800 focus:outline-none"
                                tabIndex={-1}
                            >
                                <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
                            </button>
                        </div>
                        {confirmPasswordFocus && confirmPassword && !validConfirmPassword && (
                            <p className="mt-1 text-xs text-red-500">
                                Confirm Password doesn't match the password
                            </p>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <button
                            onClick={handleReset}
                            className="px-4 py-2 text-gray-900 bg-gray-200 rounded hover:bg-gray-300"
                        >
                            Reset
                        </button>
                        <button
                            onClick={handleChangePassword}
                            className={`px-4 py-2 rounded ${!validNewPassword ? "bg-gray-400 cursor-not-allowed" : "bg-gray-800 hover:bg-gray-900 text-white"
                                }`}
                            disabled={!validNewPassword || !validConfirmPassword}
                        >
                            {passwordChangeLoading ? <PulseLoader size={15} color="#fff" /> : "Change"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default UserProfile