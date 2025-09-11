import { useRef, useState, useEffect } from "react";
import { Link, useNavigate } from 'react-router-dom'
import axios from "axios";
import { url } from './Authentication/Utility'
//import logo from '../Assets/download.jpg'
import { Tooltip } from "react-tooltip";
import { faCheck, faTimes, faInfoCircle, faEye, faEyeSlash, faCircleCheck } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { PulseLoader } from "react-spinners";
import CryptoJS from "crypto-js";
import { MdHome } from "react-icons/md";
import { RiInformation2Line } from "react-icons/ri";

const NAME_REGEX = /^[A-Za-z]+([ '-][A-Za-z]+)*$/;
const EMAIL_REGEX = /^[a-zA-Z0-9][a-zA-Z0-9._%+-]*@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const USERNAME_REGEX = /^[a-zA-Z]([a-zA-Z0-9._-]*[a-zA-Z0-9])?$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%&*_+=])[a-zA-Z\d!@#$%&*_+=]+$/;
const ORG_NAME_REGEX = /^[A-Za-z0-9&.,'()\-\s]+$/;
const ORG_PLACE_REGEX = /^[A-Za-z.'\-() ]+$/;
const MOBILE_REGEX = /^[6-9]\d{9}$/



const Signup = () => {
    const userRef = useRef();
    const errRef = useRef();
    const navigate = useNavigate()

    const [name, setName] = useState("");
    const [validName, setValidName] = useState(false);
    const [nameFocus, setNameFocus] = useState(false);

    const [email, setEmail] = useState("");
    const [validEmail, setValidEmail] = useState(false);
    const [emailFocus, setEmailFocus] = useState(false);

    const [userName, setUserName] = useState("");
    const [validUserName, setValidUserName] = useState(false);
    const [userNameFocus, setUserNameFocus] = useState(false);

    const [password, setPassword] = useState("");
    const [validPassword, setValidPassword] = useState(false);
    const [passwordFocus, setPasswordFocus] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const [confirmPassword, setConfirmPassword] = useState("");
    const [validCnfPassword, setValidCnfPassword] = useState(false);
    const [cnfPasswordFocus, setCnfPasswordFocus] = useState(false);
    const [showCnfPassword, setShowCnfPassword] = useState(false);

    const [organizationType, setOrganizationType] = useState("");
    const [validOrganizationType, setValidOrganizationType] = useState(false);
    const [organizationTypeFocus, setOrganizationTypeFocus] = useState(false);
    const [organizationTypeData, setOrganizationTypeData] = useState([])

    const [organizationName, setOrganizationName] = useState("");
    const [validOrganizationName, setValidOrganizationName] = useState(false);
    const [organizationNameFocus, setOrganizationNameFocus] = useState(false);
    const [organisationNameData, setOrganizationNameData] = useState([])

    const [newOrganizationName, setNewOrganizationName] = useState("");
    const [validNewOrganizationName, setValidNewOrganizationName] = useState(false);
    const [newOrganizationNameFocus, setNewOrganizationNameFocus] = useState(false);

    const [newOrganizationPlace, setNewOrganizationPlace] = useState("");
    const [validNewOrganizationPlace, setValidNewOrganizationPlace] = useState(false);
    const [newOrganizationPlaceFocus, setNewOrganizationPlaceFocus] = useState(false);

    const [organizationStateData, setOrganizationStateData] = useState([])
    const [organizationState, setOrganizationState] = useState()
    const [organizationStateFocus, setOrganizationStateFocus] = useState(false)
    const [validOrganizationState, setValidOrganizationState] = useState(false)

    const [userType, setUserType] = useState("");
    const [validUserType, setValidUserType] = useState(false);
    const [userTypeFocus, setUserTypeFocus] = useState(false);

    const [mobile, setMobile] = useState("");
    const [validMobile, setValidMobile] = useState(false);
    const [mobileFocus, setMobileFocus] = useState(false);

    const [loading, setLoading] = useState(false);
    const [showSignupSuccessModal, setShowSignupSuccessModal] = useState(false)
    useEffect(() => {
        userRef.current.focus();
    }, [])

    useEffect(() => {
        setValidName(name.length >= 3 && name.length <= 40 && NAME_REGEX.test(name));
    }, [name]);

    useEffect(() => {
        const isValid = email.length <= 320 && EMAIL_REGEX.test(email);
        setValidEmail(isValid);
    }, [email]);

    useEffect(() => {
        const isValid =
            userName.length >= 6 &&
            userName.length <= 40 &&
            USERNAME_REGEX.test(userName);
        setValidUserName(isValid);
    }, [userName]);

    useEffect(() => {
        setValidNewOrganizationName(
            newOrganizationName.length >= 2 &&
            newOrganizationName.length <= 100 &&
            ORG_NAME_REGEX.test(newOrganizationName)
        );
    }, [newOrganizationName]);

    useEffect(() => {
        setValidNewOrganizationPlace(
            newOrganizationPlace.length >= 2 &&
            newOrganizationPlace.length <= 100 &&
            ORG_PLACE_REGEX.test(newOrganizationPlace)
        );
    }, [newOrganizationPlace]);


    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%&*_+=]/.test(password);
    const isValidLength = password.length >= 8 && password.length <= 40;
    useEffect(() => {
        setValidPassword(
            password.length >= 8 &&
            password.length <= 40 &&
            PASSWORD_REGEX.test(password)
        );

        setValidCnfPassword(password === confirmPassword && password !== "");
    }, [password, confirmPassword]);


    useEffect(() => {
        setValidMobile(MOBILE_REGEX.test(mobile));
    }, [mobile])

    useEffect(() => {
        const fetchOrganizationType = async () => {
            try {

                const response = await axios.get(`${url}/organisation-type`);
                setOrganizationTypeData(response.data);
            } catch (error) {
            }
        };
        fetchOrganizationType();
    }, [])

    const fetchOrganizationName = async (organisationType) => {
        try {
            const response = await axios.get(`${url}/organisation/${organisationType}`);
            setOrganizationNameData(response.data);
        } catch (error) {
        }
    };

    const keyString = "7QzUf03atxcazzHM1x5SLQ==";
    const ivString = "Hy7oeHHNuXxYwdRluO6c5A==";
    // const algorithm = "AES/CBC/PKCS5Padding";
    const key = CryptoJS.enc.Base64.parse(keyString);
    const iv = CryptoJS.enc.Base64.parse(ivString);

    // Encrypt the password
    const encryptedPassword = CryptoJS.AES.encrypt(password, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
    }).toString();

    const handleSignup = async (e) => {
        e.preventDefault();
        setLoading(true)
        const v1 = NAME_REGEX.test(name);
        const v2 = EMAIL_REGEX.test(email);
        const v3 = USERNAME_REGEX.test(userName);
        const v4 = PASSWORD_REGEX.test(password);


        const v8 = MOBILE_REGEX.test(mobile)

        if (!v1 || !v2 || !v3 || !v4 || !v8) {
            toast.error("Invalid Entry");
            return;
        }
        const username = userName;
        const organisationId = organizationName === "Other" ? null : parseInt(organizationName, 10)
        const organization = organisationId === null ? {
            name: newOrganizationName,
            place: newOrganizationPlace,
            organisationType: organizationType,
            stateAndUT: organizationState
        } : null
        const payload = {
            fullName: name,
            username,
            email,
            password: encryptedPassword,
            organisationType: organizationType,
            organisationId,
            organisation: organization,
            userType,
            mobile
        };

        try {
            const response = await axios.post(`${url}/signup`,
                JSON.stringify({ fullName: name, username, email, password: encryptedPassword, organisationType: organizationType, organisationId: organisationId, organisation: organization, userType, mobile }),
                {
                    headers: { 'Content-Type': 'application/json' },
                    withCredentials: true
                }
            );
            setShowSignupSuccessModal(true);
            setName('');
            setUserName('');
            setPassword('');
            setConfirmPassword('')
            setOrganizationType('')
            setOrganizationName('')
            setUserType('')
            setMobile('')
            setNewOrganizationName('');
            setNewOrganizationPlace('');
            setOrganizationState('');
            setLoading(false)

        } catch (err) {
            toast.error(err.response.data || "Registration failed")
            errRef.current?.focus();
        } finally {
            setLoading(false)
        }
    };

    const [loadingVerifyNow, setLoadingVerifyNow] = useState(false)
    const handleVerifyNow = async () => {
        setLoadingVerifyNow(true);
        try {
            const response = await axios.post(
                `${url}/verify/otp/resend`,
                { emailAddress: email },
                {
                    headers: { 'Content-Type': 'application/json' },
                    withCredentials: true,
                }
            );
            toast.success("OTP resent successfully!");
            navigate("/verify-email", { state: { email } })
            setEmail('')
        } catch (err) {
            toast.error(err.response?.data || "Error occurred while sending otp")

        } finally {
            setLoadingVerifyNow(false);
        }
    }

    const fetchOrganizationState = async () => {
        try {
            const res = await axios.get(`${url}/statesAndUT`)
            setOrganizationStateData(res.data)
        } catch (error) {
        }
    }
    return (
        <section className="grid grid-cols-1 lg:grid-cols-12 min-h-[100vh]  text-sm">

            <div
                style={{
                    backgroundImage: `url(/SignUpPageImage.jpg)`,
                    backgroundSize: 'cover',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center',
                    alt: "signup background"
                }}
                className="flex flex-col items-center w-full col-span-3 text-gray-300 bg-center bg-cover lg:col-span-4 xl:col-span-3 "
            >
                <div className="w-11/12 pb-10 space-y-16 md:w-10/12 lg:w-9/12 md:space-y-24 lg:pb-0">
                    <div
                        className="flex flex-col items-center justify-center w-full mt-10 mb-10 cursor-pointer font-Lexend_Regular sm:mb-16 sm:mt-20"
                        onClick={() => {
                            navigate('/');
                        }}
                    >
                        <img
                            className="h-20 rounded-full sm:h-24"
                            src="/cdacLogo.png"
                            alt="CDAC Logo"
                            loading="lazy"
                        />
                        <h2 className="px-2 py-2 text-2xl text-center sm:text-3xl font-Lexend_SemiBold">CDAC CTF</h2>
                    </div>
                    <div>
                        <div className="flex items-center justify-center w-full font-Lexend_SemiBold">
                            <h2 className="px-2 py-3 text-2xl text-center sm:text-3xl">
                                Capture The Flag
                            </h2>
                        </div>
                        <p className="p-2 text-sm text-center sm:text-base">
                            Enhance your cybersecurity skills by tackling challenges on the CDAC
                            CTF platform.
                        </p>
                    </div>
                </div>
            </div>

            {/* RIGHT SECTION */}
            <div className="flex w-full col-span-9 p-2 lg:col-span-8 xl:col-span-9">

                <Link to="/" className="self-start text-gray-800">
                    <MdHome size={28} />
                </Link>
                <ToastContainer />
                <div className="flex items-center justify-center w-full h-full">
                    <div className="w-10/12 text-gray-800 bg-white ">

                        {/* <p ref={errRef} className={errMsg ? "text-red-700" : "offscreen"} aria-live="assertive">{errMsg}</p> */}
                        <h1 className="mb-2 text-3xl text-gray-800 font-Lexend_Bold ">
                            Sign Up
                        </h1>
                        <div className="flex mb-4 space-x-2 text-gray-600 font-Lexend_Regular">
                            <p>Already have an account?</p>
                            <Link to="/login" className="inline-block text-blue-700 font-Lexend_Bold">
                                Login here
                            </Link>
                        </div>
                        <div className="text-gray-800 opacity-75">
                            <form onSubmit={handleSignup} className="space-y-4 text-sm xl:space-y-4">
                                <div className="grid grid-cols-1 xl:grid-cols-2 gap-x-10 gap-y-4 ">
                                    <div>
                                        <label htmlFor="name" className="space-x-1 font-Lexend_Bold">
                                            Name <span className="text-red-500">*</span>
                                        </label>
                                        <div className="flex flex-col font-Lexend_Regular">
                                            <input
                                                type="text"
                                                id="name"
                                                name="name"
                                                ref={userRef}
                                                autoComplete="off"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (/\d/.test(e.key)) {
                                                        e.preventDefault(); // Prevent digits
                                                    }
                                                }}
                                                aria-invalid={validName ? "false" : "true"}
                                                aria-describedby="name"
                                                maxLength={100}
                                                onFocus={() => setNameFocus(true)}
                                                onBlur={() => setNameFocus(false)}
                                                className={`outline-none px-2 py-1 h-10 shadow-lg border rounded transition-all duration-200 
                                                    ${validName ? "border-green-500" : !name ? nameFocus ? "border-slate-700" : "border-slate-400" : "border-red-500"}                                               
                                                `}
                                                placeholder="Enter your name"
                                            />
                                            <p
                                                id="name"
                                                className={`text-xs mt-1 ${nameFocus && name && !validName
                                                    ? "instructions text-red-500"
                                                    : "sr-only"
                                                    }`}
                                            >
                                                <FontAwesomeIcon icon={faInfoCircle} className="mr-1" />
                                                Name must be 3–40 characters and only contain letters, spaces, hyphens (-), or apostrophes (').
                                            </p>
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="Email" className="font-Lexend_Bold">
                                            Email Address <span className="text-red-500 ">*</span>
                                            {/* <FontAwesomeIcon icon={faCheck} className={validEmail ? "text-green-600 ml-1/4" : "hidden"} />
                                            <FontAwesomeIcon icon={faTimes} className={validEmail || !email ? "hidden" : "text-red-500 ml-1/4"} /> */}
                                        </label>
                                        <div className="flex flex-col font-Lexend_Regular">
                                            <input
                                                type="email"
                                                id="email"
                                                name="email"
                                                value={email}
                                                onChange={(e) => {
                                                    e.preventDefault();
                                                    setEmail(e.target.value);
                                                }}
                                                maxLength={320}
                                                required
                                                aria-invalid={validEmail ? "false" : "true"}
                                                aria-describedby="email"
                                                onFocus={() => setEmailFocus(true)}
                                                onBlur={() => setEmailFocus(false)}
                                                className={`outline-none px-2 py-1 h-10 shadow-lg border rounded transition-all duration-200 
                                                    ${validEmail ? "border-green-500" : !email ? emailFocus ? "border-slate-700" : "border-slate-400" : "border-red-500"}                                               
                                                `}
                                                placeholder="Enter your email address"
                                            />
                                            <p id="email" className={`text-xs ${emailFocus && email && !validEmail ? "instructions text-red-500" : "absolute left-[-9999px]"}`}>
                                                <FontAwesomeIcon icon={faInfoCircle} />
                                                Please enter a valid email address.
                                            </p>
                                        </div>
                                    </div>
                                    <div>
                                        <label htmlFor="mobile" className="font-Lexend_Bold">
                                            Mobile Number {organizationType !== "School" && <span className="text-red-500">*</span>}
                                            {/* <FontAwesomeIcon icon={faCheck} className={validMobile ? "text-green-600 ml-1/4" : "hidden"} />
                                            <FontAwesomeIcon icon={faTimes} className={validMobile || !mobile ? "hidden" : "text-red-500 ml-1/4"} /> */}
                                        </label>
                                        <div className="flex flex-col font-Lexend_Regular">
                                            <input
                                                type="text"
                                                id="mobile"
                                                name="mobile"
                                                ref={userRef}
                                                autoComplete="off"
                                                value={mobile}
                                                onChange={(e) => {
                                                    e.preventDefault();
                                                    setMobile(e.target.value);
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
                                                title="Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9"
                                                required={userType !== "Class"}
                                                aria-invalid={validMobile ? "false" : "true"}
                                                aria-describedby="mobile"
                                                onFocus={() => setMobileFocus(true)}

                                                onBlur={() => setMobileFocus(false)}
                                                className={`outline-none px-2 py-1  h-10 shadow-lg border rounded 
                                                     ${validMobile ? "border-green-500" : !mobile ? mobileFocus ? "border-slate-700" : "border-slate-400" : "border-red-500"}  `
                                                }
                                                placeholder="Enter your mobile number"
                                            />
                                            {mobileFocus && mobile && !validMobile ?
                                                <p id="mobile" className={`text-xs ${mobileFocus && mobile && !validMobile ? "instructions text-red-500" : "absolute left-[-9999px]"}`}>
                                                    <FontAwesomeIcon icon={faInfoCircle} />
                                                    Please enter a valid 10-digit mobile number.
                                                </p> : <p className="pt-1 text-xs text-gray-500">Mobile Number (Not Mandatory) for School Students</p>}
                                        </div>
                                    </div>
                                    <div>
                                        <label htmlFor="userName" className="font-Lexend_Bold">
                                            Username <span className="text-red-500 ">*</span>
                                            {/* <FontAwesomeIcon icon={faCheck} className={validUserName ? "text-green-600 ml-1/4" : "hidden"} />
                                            <FontAwesomeIcon icon={faTimes} className={validUserName || !userName ? "hidden" : "text-red-500 ml-1/4"} /> */}
                                        </label>

                                        <div className="flex flex-col font-Lexend_Regular">
                                            <input
                                                type="text"
                                                id="userName"
                                                name="userName"
                                                ref={userRef}
                                                autoComplete="off"
                                                value={userName}
                                                onChange={(e) => {
                                                    e.preventDefault();
                                                    setUserName(e.target.value);
                                                }}
                                                onKeyDown={(e) => {
                                                    const allowedKeys = ["Backspace", "ArrowLeft", "ArrowRight", "Delete", "Tab"];
                                                    if (!/^[a-zA-Z0-9._-]$/.test(e.key) && !allowedKeys.includes(e.key)) {
                                                        e.preventDefault();
                                                    }
                                                }}
                                                maxLength={20}
                                                required
                                                title="User Name should be a combination of letters, digits, underscores, and hyphens (4-20 characters)."
                                                aria-invalid={validUserName ? "false" : "true"}
                                                aria-describedby="userName"
                                                onFocus={() => setUserNameFocus(true)}
                                                onBlur={() => setUserNameFocus(false)}
                                                className={`outline-none px-2 py-1  h-10 shadow-lg border rounded 
                                                     ${validUserName ? "border-green-500" : !userName ? userNameFocus ? "border-slate-700" : "border-slate-400" : "border-red-500"}  `
                                                }
                                                placeholder="Enter your username"
                                            />
                                            <p id="username" className={` text-xs ${userNameFocus && userName && !validUserName ? "instructions text-red-500" : "absolute left-[-9999px]"}`}>
                                                <FontAwesomeIcon icon={faInfoCircle} />
                                                Username must be 6–40 characters, start with a letter, and can include letters, numbers, periods (.), underscores (_), and hyphens (-). It cannot end with a special character.
                                            </p>
                                        </div>
                                    </div>
                                    <div>
                                        <label htmlFor="password" className="flex items-center space-x-1 font-Lexend_Bold">
                                            <span>Password</span> <span className="text-red-500 ">*</span>
                                            <RiInformation2Line size={16}
                                                data-tooltip-id={"PasswordInfo"}
                                                // data-tooltip-variant={"info"}
                                                data-tooltip-float={true}

                                            />
                                            {/* <FontAwesomeIcon icon={faCheck} className={validPassword ? "text-green-600 ml-1/4" : "hidden"} />
                                            <FontAwesomeIcon icon={faTimes} className={validPassword || !password ? "hidden" : "text-red-500 ml-1/4"} /> */}
                                        </label>

                                        <div className="relative flex flex-col font-Lexend_Regular">
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                id="password"
                                                data-tooltip-id={"Password"}
                                                name="password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                onKeyDown={(e) => {
                                                    const allowedKeys = ["Backspace", "ArrowLeft", "ArrowRight", "Delete", "Tab"];
                                                    if (!/^[a-zA-Z0-9!@#$%&*_+=]$/.test(e.key) && !allowedKeys.includes(e.key)) {
                                                        e.preventDefault();
                                                    }
                                                }}
                                                maxLength={20}
                                                autoComplete="off"
                                                title="Password must include uppercase and lowercase letters, a number, and a special character. Allowed special characters: ! @ # $ % * ? &"
                                                required
                                                aria-invalid={validPassword ? "false" : "true"}
                                                aria-describedby="password"
                                                onFocus={() => setPasswordFocus(true)}
                                                onBlur={() => setPasswordFocus(false)}
                                                onPaste={(e) => e.preventDefault()}
                                                className={`outline-none px-2 py-1  h-10 shadow-lg border rounded 
                                                     ${validPassword ? "border-green-500" : !password ? passwordFocus ? "border-slate-700" : "border-slate-400" : "border-red-500"}  `
                                                }
                                                placeholder="Enter your password"
                                            />

                                            {/* Eye Icon */}
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(prev => !prev)}
                                                className="absolute right-2  top-2.5 text-gray-600 hover:text-gray-800 focus:outline-none"
                                                tabIndex={-1}
                                            >
                                                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                                            </button>

                                            <Tooltip
                                                id="PasswordInfo"
                                                place="top-start"
                                                effect="solid"
                                                className="opaque"
                                                render={() => (
                                                    <div className="max-w-md p-2 text-sm text-white rounded shadow-md font-Lexend_Regular">
                                                        <p className="mb-1 font-Lexend_SemiBold">Your password must:</p>
                                                        <ul className="space-y-1 list-disc list-inside">
                                                            <li>Be 8–40 characters long</li>
                                                            <li>Include at least one uppercase letter, one lowercase letter, one number, and one special character (e.g., <code>! @ # $ % & * _ + =</code>)</li>
                                                            <li>Not contain your name, email, username, mobile number, or organization details</li>
                                                            <li>Avoid using academic or professional info</li>
                                                            <li>Not include common words (e.g., <code>password</code>, <code>admin</code>, <code>user</code>, <code>cdac</code>, <code>root</code>)</li>
                                                            <li>Not contain obvious sequences (e.g., <code>abc</code>, <code>123</code>, <code>cba</code>, <code>321</code>)</li>
                                                        </ul>
                                                    </div>
                                                )}
                                            />

                                            <div
                                                className={`absolute bg-slate-950  text-white border  border-gray-300 shadow-md rounded-md p-3 text-sm z-10 top-full mt-2 w-80 transition-opacity duration-200 
                                                 ${passwordFocus && password ? "opacity-100" : "opacity-0 pointer-events-none"}`}
                                            >
                                                <p className={`${isValidLength ? "text-green-600" : "text-red-500"}`}>
                                                    {isValidLength ? "✔" : "✖"} 8–40 characters
                                                </p>
                                                <p className={`${hasUpperCase ? "text-green-600" : "text-red-500"}`}>
                                                    {hasUpperCase ? "✔" : "✖"} At least 1 uppercase letter
                                                </p>
                                                <p className={`${hasLowerCase ? "text-green-600" : "text-red-500"}`}>
                                                    {hasLowerCase ? "✔" : "✖"} At least 1 lowercase letter
                                                </p>
                                                <p className={`${hasNumber ? "text-green-600" : "text-red-500"}`}>
                                                    {hasNumber ? "✔" : "✖"} At least 1 number
                                                </p>
                                                <p className={`${hasSpecialChar ? "text-green-600" : "text-red-500"}`}>
                                                    {hasSpecialChar ? "✔" : "✖"} At least 1 special character (!@#$%&*_+=)
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <label htmlFor="cnfPassword" className="font-Lexend_Bold">
                                            Confirm Password <span className="text-red-500">*</span>
                                            {/* <FontAwesomeIcon icon={faCheck} className={validCnfPassword ? "text-green-600 ml-1/4" : "hidden"} />
                                            <FontAwesomeIcon icon={faTimes} className={validCnfPassword || !confirmPassword ? "hidden" : "text-red-500 ml-1/4"} /> */}
                                        </label>

                                        <div className="relative flex flex-col font-Lexend_Regular">
                                            <input
                                                type={showCnfPassword ? "text" : "password"}
                                                id="cnfPassword"
                                                name="cnfPassword"
                                                value={confirmPassword}
                                                onChange={(e) => {
                                                    e.preventDefault();
                                                    setConfirmPassword(e.target.value);
                                                }}
                                                onPaste={(e) => e.preventDefault()}
                                                onKeyDown={(e) => {
                                                    const allowedKeys = ["Backspace", "ArrowLeft", "ArrowRight", "Delete", "Tab"];
                                                    if (!/^[a-zA-Z0-9@$!%*?&#]$/.test(e.key) && !allowedKeys.includes(e.key)) {
                                                        e.preventDefault();
                                                    }
                                                }}
                                                maxLength={20}
                                                required
                                                autoComplete="off"
                                                aria-invalid={validCnfPassword ? "false" : "true"}
                                                aria-describedby="cnfPasswordHelp"
                                                onFocus={() => setCnfPasswordFocus(true)}
                                                onBlur={() => setCnfPasswordFocus(false)}
                                                className={`outline-none px-2 py-1  h-10 shadow-lg border rounded 
                                                     ${validCnfPassword ? "border-green-500" : !confirmPassword ? cnfPasswordFocus ? "border-slate-700" : "border-slate-400" : "border-red-500"}  `
                                                }
                                                placeholder="Enter your confirm password"
                                            />

                                            {/* Eye toggle */}
                                            <button
                                                type="button"
                                                onClick={() => setShowCnfPassword(prev => !prev)}
                                                className="absolute right-2 top-2.5 text-gray-600 hover:text-gray-800 focus:outline-none"
                                                tabIndex={-1}
                                            >
                                                <FontAwesomeIcon icon={showCnfPassword ? faEyeSlash : faEye} />
                                            </button>

                                            <p id="cnfPasswordHelp" className={` text-xs ${cnfPasswordFocus && !validCnfPassword ? "instructions text-red-500" : "absolute left-[-9999px]"}`}>
                                                <FontAwesomeIcon icon={faInfoCircle} />
                                                Confirm Password doesn't match the password
                                            </p>
                                        </div>
                                    </div>
                                    <div>
                                        <label htmlFor="userType" className="font-Lexend_Bold">
                                            User Type <span className="text-red-500">*</span>
                                            {/* <FontAwesomeIcon icon={faCheck} className={userType !== "" && validUserType ? "text-green-600 ml-1/4" : "hidden"} />
                                            <FontAwesomeIcon icon={faTimes} className={validUserType || !userType ? "hidden" : "text-red-500 ml-1/4"} /> */}
                                        </label>
                                        <div className="flex flex-col font-Lexend_Regular">

                                            <select
                                                value={userType}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    setUserType(value);
                                                    setValidUserType(true);
                                                }}
                                                onFocus={() => setUserTypeFocus(true)}
                                                onBlur={() => setUserTypeFocus(false)}
                                                required
                                                className={`outline-none px-2 py-1  h-10 shadow-lg border rounded 
                                                     ${validUserType ? "border-green-500" : !userType ? userTypeFocus ? "border-slate-700" : "border-slate-400" : "border-red-500"}  `
                                                }
                                                aria-describedby="userType"
                                            >
                                                <option value="" className="text-gray-300" disabled>Select an option</option>
                                                <option value="Student" >Student</option>
                                                <option value="Employee" >Employee</option>
                                            </select>

                                            <p id="userType" className={`text-xs ${userTypeFocus && !validUserType ? "instructions text-red-500" : "absolute left-[-9999px]"}`}>
                                                <FontAwesomeIcon icon={faInfoCircle} />
                                                Please select valid type
                                            </p>
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="OrganizationType" className="font-Lexend_Bold">
                                            Where do you belong to? <span className="text-red-500">*</span>
                                            {/* <FontAwesomeIcon icon={faCheck} className={organizationType !== "" && validOrganizationType ? "text-green-600 ml-1/4" : "hidden"} />
                                            <FontAwesomeIcon icon={faTimes} className={validOrganizationType || !organizationType ? "hidden" : "text-red-500 ml-1/4"} /> */}
                                        </label>
                                        <div className="flex flex-col font-Lexend_Regular">
                                            <select
                                                id="orgType"
                                                value={organizationType}
                                                onChange={(e) => {
                                                    //e.preventDefault();
                                                    const data = e.target.value
                                                    setOrganizationType(data);
                                                    setValidOrganizationType(true)
                                                    setOrganizationName("")
                                                    fetchOrganizationName(data)
                                                }}
                                                required
                                                aria-invalid={validOrganizationType ? "false" : "true"}
                                                aria-describedby="organizationType"
                                                onFocus={() => setOrganizationTypeFocus(true)}
                                                onBlur={() => setOrganizationTypeFocus(false)}
                                                className={`outline-none px-2 py-1  h-10 shadow-lg border rounded 
                                                     ${validOrganizationType ? "border-green-500" : !organizationType ? organizationTypeFocus ? "border-slate-700" : "border-slate-400" : "border-red-500"}  `
                                                }
                                            >
                                                <option value="" disabled>Select an option</option>
                                                {organizationTypeData && organizationTypeData
                                                    .filter(option => !(userType === "Student" && (option === "Government" || option === "Corporate")))
                                                    .map((data,index) => (
                                                        <option key={index} value={data} >{data}</option>

                                                    ))
                                                }

                                            </select>
                                            <p id="organizationType" className={`text-xs ${organizationTypeFocus && !validOrganizationType ? "instructions text-red-500" : "absolute left-[-9999px]"}`}>
                                                <FontAwesomeIcon icon={faInfoCircle} />
                                                Please select valid type
                                            </p>
                                        </div>
                                    </div>
                                    <div>
                                        <label htmlFor="organizationName" className="font-Lexend_Bold">
                                            {organizationType === "College" ? " College" : organizationType === "School" ? "School" : "Organisation"} <span className="text-red-500">*</span>
                                            {/* <FontAwesomeIcon icon={faCheck} className={organizationName !== "" && validOrganizationName ? "text-green-600 ml-1/4" : "hidden"} />
                                            <FontAwesomeIcon icon={faTimes} className={validOrganizationName || !organizationName ? "hidden" : "text-red-500 ml-1/4"} /> */}
                                        </label>
                                        <div className="flex flex-col font-Lexend_Regular">
                                            <select
                                                id="orgName"
                                                value={organizationName}
                                                onChange={(e) => {
                                                    //e.preventDefault();
                                                    setValidOrganizationName(true)
                                                    setOrganizationName(e.target.value);
                                                    if (e.target.value === "Other") {
                                                        fetchOrganizationState()
                                                    }

                                                }}
                                                required
                                                aria-invalid={validOrganizationName ? "false" : "true"}
                                                aria-describedby="organizationName"
                                                onFocus={() => setOrganizationNameFocus(true)}
                                                onBlur={() => setOrganizationNameFocus(false)}
                                                disabled={!organizationType}
                                                className={`outline-none px-2 py-1  h-10 shadow-lg border rounded 
                                                     ${validOrganizationName ? "border-green-500" : !organizationName ? organizationNameFocus ? "border-slate-700" : "border-slate-400" : "border-red-500"}  `
                                                }
                                            >

                                                <option value="" className="text-gray-300" disabled>Select your {organizationType === "College" ? "college" : organizationType === "School" ? "school" : "organisation"}</option>
                                                {organisationNameData && organisationNameData.map((data) => (
                                                    <option key={data.id} value={parseInt(data.id, 10)} className="break-words ">
                                                        {data.name}, {data.place}, {data.stateAndUT?.name}
                                                    </option>
                                                ))}
                                                <option value="Other" className="" >Other (Add new...)</option>
                                            </select>

                                            <p id="organizationName" className={`text-xs ${organizationNameFocus && !validOrganizationName ? "instructions text-red-500" : "absolute left-[-9999px]"}`}>
                                                <FontAwesomeIcon icon={faInfoCircle} />
                                                Please select an organisation
                                            </p>
                                        </div>
                                    </div>
                                    {organizationName === "Other" &&
                                        <div>
                                            <label htmlFor="newOrganizationName" className="font-Lexend_Bold">
                                                {organizationType === "College" ? " College" : organizationType === "School" ? "School" : "Organisation"} Name <span className="text-red-500">*</span>
                                                {/* <FontAwesomeIcon icon={faCheck} className={newOrganizationName !== "" && validNewOrganizationName ? "text-green-600 ml-1/4" : "hidden"} />
                                                <FontAwesomeIcon icon={faTimes} className={validNewOrganizationName || !newOrganizationName ? "hidden" : "text-red-500 ml-1/4"} /> */}
                                            </label>

                                            <div className="flex flex-col font-Lexend_Regular">
                                                <input
                                                    type="text"
                                                    id="newOrganizationName"
                                                    name="newOrganizationName"
                                                    autoComplete="off"
                                                    value={newOrganizationName}
                                                    onChange={(e) => {
                                                        e.preventDefault();
                                                        setNewOrganizationName(e.target.value);
                                                    }}
                                                    required
                                                    title=""
                                                    aria-invalid={validNewOrganizationName ? "false" : "true"}
                                                    aria-describedby="newOrganizationName"
                                                    onFocus={() => setNewOrganizationNameFocus(true)}
                                                    onBlur={() => setNewOrganizationNameFocus(false)}
                                                    className={`outline-none px-2 py-1  h-10 shadow-lg border rounded 
                                                     ${validNewOrganizationName ? "border-green-500" : !newOrganizationName ? newOrganizationNameFocus ? "border-slate-700" : "border-slate-400" : "border-red-500"}  `
                                                    }
                                                    placeholder={`Enter your ${organizationType === "College" ? " college" : organizationType === "School" ? "school" : "organisation"} name`}
                                                />
                                                <p id="newOrganizationName" className={` text-xs ${newOrganizationNameFocus && !validNewOrganizationName ? "instructions text-red-500" : "absolute left-[-9999px]"}`}>
                                                    <FontAwesomeIcon icon={faInfoCircle} />
                                                    Organisation name must be 2–100 characters and can only include letters, numbers, spaces, and characters like & . , ' ( ) -.
                                                </p>
                                            </div>
                                        </div>

                                    }
                                    {organizationName === "Other" &&
                                        <div>
                                            <label htmlFor="newOrganizationPlace" className="font-Lexend_Bold">
                                                {organizationType === "College" ? " College" : organizationType === "School" ? "School" : "Organisation"} Place <span className="text-red-500">*</span>
                                                {/* <FontAwesomeIcon icon={faCheck} className={newOrganizationPlace !== "" && validNewOrganizationPlace ? "text-green-600 ml-1/4" : "hidden"} />
                                                <FontAwesomeIcon icon={faTimes} className={validNewOrganizationPlace || !newOrganizationPlace ? "hidden" : "text-red-500 ml-1/4"} /> */}
                                            </label>

                                            <div className="flex flex-col font-Lexend_Regular">
                                                <input
                                                    type="text"
                                                    id="newOrganizationPlace"
                                                    name="newOrganizationPlace"
                                                    autoComplete="off"
                                                    value={newOrganizationPlace}
                                                    onChange={(e) => {
                                                        e.preventDefault();
                                                        setNewOrganizationPlace(e.target.value);
                                                    }}
                                                    required
                                                    title=""
                                                    aria-invalid={newOrganizationPlace ? "false" : "true"}
                                                    aria-describedby="newOrganizationPlace"
                                                    onFocus={() => setNewOrganizationPlaceFocus(true)}
                                                    onBlur={() => setNewOrganizationPlaceFocus(false)}
                                                    className={`outline-none px-2 py-1  h-10 shadow-lg border rounded 
                                                     ${validNewOrganizationPlace ? "border-green-500" : !newOrganizationPlace ? newOrganizationPlaceFocus ? "border-slate-700" : "border-slate-400" : "border-red-500"}  `
                                                    }
                                                    placeholder={`Enter your ${organizationType === "College" ? " college" : organizationType === "School" ? "school" : "organisation"} place`}
                                                />
                                                <p id="organizationName" className={` text-xs ${newOrganizationPlaceFocus && !validNewOrganizationPlace ? "instructions text-red-500" : "absolute left-[-9999px]"}`}>
                                                    <FontAwesomeIcon icon={faInfoCircle} />
                                                    Organisation place must be 2–100 characters and may only contain letters, spaces, periods (.), apostrophes ('), hyphens (-), and parentheses.
                                                </p>
                                            </div>
                                        </div>}
                                    {organizationName === "Other" &&
                                        <div>
                                            <label htmlFor="organizationState" className="font-Lexend_Bold">
                                                {organizationType === "College" ? " College" : organizationType === "School" ? "School" : "Organisation"} State or Union Territory <span className="text-red-500">*</span>
                                                {/* <FontAwesomeIcon icon={faCheck} className={organizationState !== "" && validOrganizationState ? "text-green-600 ml-1/4" : "hidden"} />
                                                <FontAwesomeIcon icon={faTimes} className={validOrganizationState || !organizationState ? "hidden" : "text-red-500 ml-1/4"} /> */}
                                            </label>

                                            <div className="flex flex-col font-Lexend_Regular">
                                                <select
                                                    id="organizationState"
                                                    value={organizationState}
                                                    onChange={(e) => {
                                                        //e.preventDefault();
                                                        setValidOrganizationState(true)
                                                        setOrganizationState(e.target.value);

                                                    }}
                                                    required
                                                    aria-invalid={validOrganizationState ? "false" : "true"}
                                                    aria-describedby="organizationState"
                                                    onFocus={() => setOrganizationStateFocus(true)}
                                                    onBlur={() => setOrganizationStateFocus(false)}
                                                    disabled={!organizationType}
                                                    className={`outline-none px-2 py-1  h-10 shadow-lg border rounded 
                                                     ${validOrganizationState ? "border-green-500" : !organizationState ? organizationStateFocus ? "border-slate-700" : "border-slate-400" : "border-red-500"}  `
                                                    }
                                                >

                                                    <option value="" className="text-gray-300" disabled selected>Select state or union territory</option>
                                                    {organizationStateData && organizationStateData.map((data) => (
                                                        <option key={data.id} value={parseInt(data.id, 10)} className="break-words ">
                                                            {data.name}
                                                        </option>
                                                    ))}
                                                </select>
                                                <p id="organizationState" className={` text-sm ${organizationStateFocus && organizationState && !validOrganizationState ? "instructions text-red-500" : "absolute left-[-9999px]"}`}>
                                                    <FontAwesomeIcon icon={faInfoCircle} />
                                                    Please select state.
                                                </p>
                                            </div>
                                        </div>}
                                </div>
                                <div className="text-white bg-gray-900 rounded cursor-pointer w-fit font-Lexend_Bold disabled:bg-gray-800 hover:bg-gray-700">
                                    <button
                                        type="submit"
                                        className={`px-8 py-2 font-Lexend_Bold flex items-center justify-center disabled:cursor-not-allowed cursor-pointer`}
                                        disabled={
                                            !validName ||
                                            !validEmail ||
                                            !validUserName ||
                                            !validPassword ||
                                            !validCnfPassword ||
                                            !validUserType ||
                                            !validOrganizationType ||
                                            !validOrganizationName ||
                                            (organizationName === "Other" &&
                                                (!validNewOrganizationName || !validNewOrganizationPlace || !validOrganizationState)) ||
                                            (organizationType !== "School" && !validMobile) ||
                                            loading
                                        }
                                    >
                                        {loading ? <PulseLoader size={15} color="#fff" /> : "Sign Up"}
                                    </button>
                                </div>

                            </form>
                        </div>
                    </div>
                </div>
            </div>
            {showSignupSuccessModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black bg-opacity-50">
                    <div className="w-full max-w-sm p-6 text-center bg-white rounded-lg shadow-lg sm:max-w-md md:max-w-lg font-Lexend_Regular">
                        <FontAwesomeIcon
                            icon={faCircleCheck}
                            className="w-20 h-20 mx-auto mb-4 text-green-500"
                        />
                        <h2 className="mb-4 text-2xl text-green-600 font-Lexend_SemiBold">
                            Signup Successful!
                        </h2>
                        <p className="mb-4 text-gray-600">
                            Email verification is pending. <br /> You can complete it now or later from the login page.

                        </p>
                        <div className="flex justify-between">
                            <button
                                className="px-6 py-2 text-white transition duration-300 bg-green-600 rounded hover:bg-green-700"
                                onClick={() => navigate('/', { replace: true })}
                            >
                                Home
                            </button>
                            <button
                                className="flex items-center px-4 py-2 mb-2 text-white bg-green-600 rounded disabled:bg-green-500 disabled:cursor-not-allowed md:mb-0"
                                onClick={() => {
                                    handleVerifyNow()
                                }}
                                disabled={loadingVerifyNow}
                            >
                                {loadingVerifyNow ? <PulseLoader size={15} color={"#fff"} /> : 'Verify Now'}
                            </button>
                        </div>

                    </div>

                </div>
            )}

        </section>
    );
};

function validatePassword(password, userInfo = {}) {
    const errors = [];

    if (!password || password.trim() === "") {
        errors.push("Password is required.");
        return errors;
    }

    if (!PASSWORD_REGEX.test(password)) {
        errors.push("Password must include uppercase, lowercase, digit, and special character (!@#$%&*_+=).");
    }

    if (password.length < 8 || password.length > 40) {
        errors.push("Password must be between 8 and 40 characters.");
    }

    const lowerPwd = password.toLowerCase();

    // Check for personal info
    const sensitive = [
        ...(userInfo.fullName?.split(" ") || []),
        userInfo.username,
        userInfo.email,
        userInfo.userType,
        userInfo.organisationType,
        userInfo.organisationName,
        userInfo.organisationPlace,
        userInfo.mobile,
        userInfo.role,
        userInfo.level,
        userInfo.levelInfo,
    ].filter(Boolean).map(i => i.toLowerCase());

    for (let val of sensitive) {
        if (lowerPwd.includes(val) || val.includes(lowerPwd)) {
            errors.push("Password cannot contain your personal information.");
            break;
        }
    }

    // Insecure words
    const blacklist = ["password", "cdac", "admin", "user", "root"];
    for (let word of blacklist) {
        if (lowerPwd.includes(word)) {
            errors.push(`Password cannot contain the word "${word}".`);
            break;
        }
    }

    // Sequence check
    if (containsThreeCharSequence(lowerPwd)) {
        errors.push("Password cannot contain sequential letters or numbers (e.g., abc or 123).");
    }

    return errors;
}

function containsThreeCharSequence(pwd) {
    for (let i = 0; i <= pwd.length - 3; i++) {
        const c1 = pwd.charCodeAt(i);
        const c2 = pwd.charCodeAt(i + 1);
        const c3 = pwd.charCodeAt(i + 2);

        // Check ascending/descending sequences for letters or digits
        if (
            ((c2 === c1 + 1) && (c3 === c2 + 1)) ||
            ((c2 === c1 - 1) && (c3 === c2 - 1))
        ) {
            if (
                /[a-z]/.test(pwd[i]) && /[a-z]/.test(pwd[i + 1]) && /[a-z]/.test(pwd[i + 2]) ||
                /\d/.test(pwd[i]) && /\d/.test(pwd[i + 1]) && /\d/.test(pwd[i + 2])
            ) {
                return true;
            }
        }
    }
    return false;
}


export default Signup;
