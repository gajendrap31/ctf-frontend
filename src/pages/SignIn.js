import axios from "axios";
import { Link } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
// import logo from '../Assets/download.jpg'
import { jwtDecode } from "jwt-decode";
import CryptoJS from 'crypto-js';

import { useNavigate } from 'react-router-dom';
import { faCheck, faTimes, faEye, faEyeSlash, faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { IoClose } from "react-icons/io5";
import { url } from "./Authentication/Utility";
import { PulseLoader } from "react-spinners";
import { useContext } from "react";
import { ProfileContext } from "./Context API/ProfileContext";
import { IoMdRefresh } from "react-icons/io";
import { MdHome } from "react-icons/md";

const USERNAME_EMAIL_REGEX = /^[a-zA-Z]([a-zA-Z0-9._-]*[a-zA-Z0-9])?$|^[a-zA-Z0-9][a-zA-Z0-9._%+-]*@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%&*_+=])[a-zA-Z\d!@#$%&*_+=]+$/;
const LOGIN_URL = `${url}/login`;

const SignIn = ({ setIsLoggedIn, setUserDetails }) => {

    const userRef = useRef();
    const errRef = useRef();

    const [userName, setUserName] = useState("");
    const [validUserName, setValidUserName] = useState(false);
    const [usernameFocus, setUsernameFocus] = useState(false)

    const [password, setPassword] = useState("");
    const [validPassword, setValidPassword] = useState(false);
    const [passwordFocus, setPasswordFocus] = useState(false)
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false)

    const { fetchProfilePicture, fetchUserDetails } = useContext(ProfileContext);
    const [captchaImg, setCaptchaImg] = useState('');
    const [captchaToken, setCaptchaToken] = useState('');
    const [captchaInput, setCaptchaInput] = useState('');

    useEffect(() => {
        if (userRef.current) {
            userRef.current.focus();
        }
    }, [])

    useEffect(() => {
        const isValid =
            USERNAME_EMAIL_REGEX.test(userName) &&
            (userName.includes('@')
                ? userName.length <= 320
                : userName.length >= 6 && userName.length <= 40);
        setValidUserName(isValid);
    }, [userName])

    useEffect(() => {
        setValidPassword(
            password.length >= 8 &&
            password.length <= 40 &&
            PASSWORD_REGEX.test(password)
        );
    }, [password]);
  
    const navigate = useNavigate();

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

    const handleCaptcha = async () => {
        try {
            const resToken = await axios.post(`${url}/captcha/token`);
            setCaptchaToken(resToken.data);
            const res = await axios.get(`${url}/captcha/${resToken.data}`, { responseType: 'blob' });
            const imageUrl = URL.createObjectURL(res.data);
            setCaptchaImg(imageUrl);
        } catch (error) {
            console.log('Captcha fetch error:', error);
        }
    };

    useEffect(() => {
        handleCaptcha()
    }, [])

    const handleSignIn = async (e) => {
        e.preventDefault();
        setLoading(true)
        console.log("Hello")
        const username = userName;
        const date = new Date();
        try {
            console.log({ username, password: encryptedPassword, clientDateTime: date.toISOString(), captchaToken, captchaText: captchaInput })
            const response = await axios.post(LOGIN_URL,
                JSON.stringify({ username, password: encryptedPassword, clientDateTime: date.toISOString(), captchaToken, captchaText: captchaInput }),
                {
                    headers: { 'Content-Type': 'application/json' },
                    withCredentials: true
                }
            );

            console.log("data", response.data);


            const token = response.data;
            console.log("tt:", token)
            const decodedToken = jwtDecode(token);
            const userRole = decodedToken.role;

            localStorage.setItem('LogIn', true);
            localStorage.setItem('LogOut', false);
            localStorage.setItem('Token', token);
            localStorage.setItem("User_Role", userRole);
            await fetchUserDetails();
            await fetchProfilePicture();
            setUserDetails(decodedToken);
            setIsLoggedIn(true);

            console.log(decodedToken);

            navigate('/Dashboard', { replace: true });
            setUserName('');
            setPassword('');

        } catch (err) {
            console.log(err)
            toast.error(err.response.data || "Login failed!");
            errRef.current?.focus();
            handleCaptcha()
        } finally {
            setLoading(false)
        }
    };

    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };


    return (
        <section className="flex flex-col w-full min-h-screen md:flex-row">
            {/* LEFT SECTION */}
            <div
                style={{
                    backgroundImage: `url(/login3.png)`,
                    backgroundSize: "cover",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "center",
                    alt: "login background"
                }}
                className="flex flex-col items-center pb-64 justify-center text-gray-300 text-lg md:text-xl min-h-[50vh] md:min-h-screen w-full md:w-1/2 p-6"
            >
                <div className="w-full space-y-20 md:w-3/4">
                    {/* Logo and Title */}
                    <div
                        className="flex flex-col items-center justify-center cursor-pointer"
                        onClick={() => {
                            navigate("/");
                        }}
                    >
                        <img
                            className="h-16 rounded-full md:h-24"
                            src="/cdacLogo.png"
                            alt="CDAC Logo"
                            loading="lazy"
                        />
                        <h2 className="mt-2 text-2xl text-center md:text-3xl font-Lexend_SemiBold">CDAC CTF</h2>
                    </div>

                    {/* Text Section */}
                    <div>
                        <h2 className="text-2xl text-center md:text-3xl font-Lexend_SemiBold">
                            Capture The Flag
                        </h2>
                        <p className="mt-4 text-center text-gray-300">
                            Enhance your cyber security skills by tackling challenges on the CDAC
                            CTF platform.
                        </p>
                    </div>
                </div>
            </div>

            {/* RIGHT SECTION */}
            <div className="flex flex-col items-center w-full min-h-full p-2 bg-white md:w-1/2">
                <Link to="/" className="self-start text-gray-800">
                    <MdHome size={28} />
                </Link>
                <ToastContainer />
                <div className="flex items-center justify-center w-full h-full text-sm">
                    <div className="w-full sm:w-3/4 md:w-11/12 lg:w-4/5 xl:w-1/2">
                        <h1 className="mb-2 text-2xl text-gray-700 font-Lexend_Bold md:text-3xl">
                            Login
                        </h1>

                        {/* Signup Link */}
                        <div className="flex items-center mb-4 text-sm text-gray-600 ">
                            <p className="font-Lexend_Regular ">New user?</p>
                            <Link
                                to="/sign_up"
                                className="ml-2 text-blue-700 font-Lexend_Bold hover:underline"
                            >
                                Sign up now!
                            </Link>
                        </div>

                        {/* Login Form */}
                        <form className="flex flex-col space-y-4" onSubmit={handleSignIn}>
                            {/* Username Input */}
                            <div className="flex flex-col">
                                <label
                                    htmlFor="UserName"
                                    className="font-Lexend_SemiBold"
                                >
                                    Email or Username <span className="text-red-500">*</span>

                                </label>
                                <input
                                    type="text"
                                    id="userName"
                                    name="userName"
                                    value={userName}
                                    onChange={(e) => setUserName(e.target.value)}
                                    maxLength={128}
                                    required
                                    onFocus={() => setUsernameFocus(false)}
                                    onBlur={() => setUsernameFocus(true)}
                                    className={`outline-none rounded h-10 font-Lexend_Regular ${usernameFocus ? "border-gray-600" : "border-gray-500"} border px-2`}
                                    placeholder="Enter your username"
                                    autoComplete="off"
                                />
                                <p id="userName" className={`text-xs  ${usernameFocus && userName && !validUserName ? "instructions text-red-500" : "absolute left-[-9999px]"}`}>
                                    <FontAwesomeIcon icon={faInfoCircle} />
                                    Please enter a valid username or email address.
                                </p>
                            </div>

                            {/* Password Input */}
                            <div className="relative flex flex-col">
                                <label
                                    htmlFor="password"
                                    className="font-Lexend_Bold "
                                >
                                    Password <span className="text-red-500">*</span>
                                </label>

                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        id="password"
                                        name="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        maxLength={40}
                                        required
                                        onFocus={() => setPasswordFocus(false)}
                                        onBlur={() => setPasswordFocus(true)}
                                        onPaste={(e) => e.preventDefault()}
                                        className={`outline-none rounded h-10 w-full font-Lexend_Regular ${passwordFocus ? "border-gray-600" : "border-gray-500"} border px-2`}
                                        placeholder="Enter your password"
                                    />

                                    {/* Eye Icon */}
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(prev => !prev)}
                                        className="absolute text-gray-600 -translate-y-1/2 right-3 top-1/2 hover:text-gray-800 focus:outline-none"
                                        tabIndex={-1}
                                    >
                                        <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                                    </button>
                                </div>
                                <p id="password" className={`text-xs ${passwordFocus && password && !validPassword ? "instructions text-red-500" : "absolute left-[-9999px]"}`}>
                                    <FontAwesomeIcon icon={faInfoCircle} />
                                    Invalid password format
                                </p>
                            </div>

                            <div className="relative flex flex-col items-center justify-center h-full">
                                <label
                                    className="font-Lexend_Bold"
                                >
                                    Security Text <span className="text-red-500">*</span>
                                </label>
                                <div className="flex items-center justify-between w-full max-w-xs overflow-hidden border border-gray-700 rounded outline-none font-Lexend_Regular">
                                    <input
                                        type="text"
                                        value={captchaInput}
                                        onChange={(e) => setCaptchaInput(e.target.value)}
                                        className="px-2 py-2 outline-none w-28 md:w-32 2xl:w-36 font-Lexend_Regular "
                                        placeholder="Enter captcha"
                                    />

                                    <div className="flex items-center ">
                                        {captchaImg ? (
                                            <img src={captchaImg} alt="Captcha" className="object-contain w-auto h-10 " />
                                        ) : <p className="text-xs text-red-500">Captcha not available. Please try again.</p>}
                                        <button
                                            type="button"
                                            onClick={handleCaptcha}
                                            className="h-10 p-1 bg-gray-300 "
                                        >
                                            <IoMdRefresh size={20} />
                                        </button>
                                    </div>
                                </div>

                            </div>
                            {/* Forgot Password */}
                            <div className="flex justify-between mb-3 text-blue-600  font-Lexend_Medium">
                                <Link to="/Verify Email" className="hover:underline ">
                                    Verify Email?
                                </Link>
                                <Link to="/reset_password" className="text-center hover:underline">
                                    Forgot Password?
                                </Link>
                            </div>

                            {/* Submit Button */}
                            <div
                                className="w-full text-center text-white bg-gray-800 rounded cursor-pointer md:w-1/3 font-Lexend_Bold hover:bg-gray-700"
                            >
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`w-full py-2 flex items-center justify-center`}
                                >
                                    {loading ? <PulseLoader size={20} color={"#fff"} className="" /> : "Login"}
                                </button>
                            </div>
                        </form>

                        {/* Login with OTP */}
                        <h1 className="w-full mt-4 text-center font-Lexend_SemiBold">
                            OR
                        </h1>
                        <div className="flex justify-center mt-2 font-Lexend_Bold">
                            <button
                                className="text-blue-600 hover:underline"
                                onClick={() => setIsModalOpen(true)}
                            >
                                Login with OTP?
                            </button>
                        </div>
                        <Modal
                            isOpen={isModalOpen}
                            onClose={handleCloseModal}
                            setIsLoggedIn={setIsLoggedIn}
                            setUserDetails={setUserDetails}
                            fetchUserDetails={fetchUserDetails}
                            fetchProfilePicture={fetchProfilePicture}
                        />
                    </div>
                </div>
            </div>
        </section>


    );
};


const Modal = ({ isOpen, onClose, setIsLoggedIn, setUserDetails, fetchUserDetails, fetchProfilePicture }) => {
    const [email, setEmail] = useState("");
    const [validEmail, setValidEmail] = useState(false)
    const [emailFocus, setEmailFocus] = useState(false)
    const [isOTPSent, setIsOTPSent] = useState(false);
    const [otp, setOTP] = useState("");
    const [loading, setLoading] = useState(false)
    const [loadingSubmit, setLoadingSubmit] = useState(false)
    const [loadingResendOTP, setLoadingResendOTP] = useState(false)
    const navigate = useNavigate();
    const [captchaImg, setCaptchaImg] = useState('');
    const [captchaToken, setCaptchaToken] = useState('');
    const [captchaInput, setCaptchaInput] = useState('');

    useEffect(() => {
        setValidEmail(USERNAME_EMAIL_REGEX.test(email));
    }, [email])

    const handleClose = () => {
        setEmail("");
        setIsOTPSent(false);
        setOTP("");
        onClose();
    };
    const handleCaptcha = async () => {
        try {
            const resToken = await axios.post(`${url}/captcha/token`);
            setCaptchaToken(resToken.data);
            const res = await axios.get(`${url}/captcha/${resToken.data}`, { responseType: 'blob' });
            const imageUrl = URL.createObjectURL(res.data);
            setCaptchaImg(imageUrl);
        } catch (error) {
            console.log('Captcha fetch error:', error);
        }
    };

    useEffect(() => {
        handleCaptcha()
    }, [])

    if (!isOpen) return null;

    const handleSendOTP = async (e) => {
        e.preventDefault();
        setLoading(true)
        console.log({ username: email, captchaToken, captchaText: captchaInput });
        try {
            const response = await axios.post(
                `${url}/login/otp/send`,
                { username: email, captchaToken, captchaText: captchaInput },
                {
                    headers: { 'Content-Type': 'application/json' },
                    withCredentials: true
                }
            );

            console.log("data", response.data);
            setIsOTPSent(true);
        } catch (error) {
            toast.error(error.response?.data || "Error occurred while sending otp")
            handleCaptcha()
        } finally {
            setLoading(false)
        }
    };

    const handleSubmitOTP = async (e) => {
        e.preventDefault();
        setLoadingSubmit(true)
        console.log("OTP:", otp);
        try {
            const date = new Date();
            const response = await axios.post(
                `${url}/login/otp`,
                { username: email, otpInput: otp, clientDateTime: date.toISOString() },
                {
                    headers: { 'Content-Type': 'application/json' },
                    withCredentials: true
                }
            );
            const token = response.data;
            console.log("tt:", token)
            const decodedToken = jwtDecode(token);
            const userRole = decodedToken.role;
            console.log(decodedToken)
            localStorage.setItem('LogIn', true);
            localStorage.setItem('LogOut', false);
            localStorage.setItem('Token', token);
            localStorage.setItem("User_Role", userRole);
            await fetchUserDetails();
            await fetchProfilePicture();
            setUserDetails(decodedToken);
            setIsLoggedIn(true);
            console.log(3)
            console.log(decodedToken);

            navigate('/Dashboard', { replace: true });
        } catch (error) {
            toast.error(error.response?.data || "OTP Verification Failed");
        } finally {
            setLoadingSubmit(false)
        }
    };

    const handleResendOTP = async (e) => {
        e.preventDefault();
        setLoadingResendOTP(true)
        console.log({ username: email });
        try {
            const response = await axios.post(
                `${url}/login/otp/resend`,
                { username: email, },
                {
                    headers: { 'Content-Type': 'application/json' },
                    withCredentials: true
                }
            );

            console.log("data", response.data);
            toast.success(response.data)
            setIsOTPSent(true);
        } catch (error) {
            toast.error(error.response?.data || "Error occurred while sending otp")
        } finally {
            setLoadingResendOTP(false)
        }
    };

    const isCorrectEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };
    return (
        <div className="fixed inset-0 flex items-center justify-center text-base bg-black bg-opacity-60 sm:text-lg">
            <div className="w-11/12 p-1 text-center bg-white rounded-lg sm:w-3/4 md:w-1/2 xl:w-1/3 2xl:w-1/4">
                {/* Close Button */}
                <div className="flex justify-end">
                    <button
                        onClick={handleClose}
                        className="p-1 text-xl text-gray-700 rounded-lg sm:text-2xl hover:bg-gray-200"
                    >
                        <IoClose />
                    </button>
                </div>

                {/* Modal Content */}
                <div className="flex flex-col items-center p-4 px-4 pb-6">
                    <h2 className="mb-4 text-lg font-Lexend_Bold sm:text-xl">Login with OTP</h2>

                    {!isOTPSent ? (
                        <p className="mb-4 text-sm text-center text-gray-500 font-Lexend_Regular">
                            Enter your registered email or username to receive an one-time password (OTP) for secure login.
                        </p>
                    ) : (
                        <p className="mb-4 text-sm text-center text-gray-500 font-Lexend_Regular">
                            An OTP has been sent to  {isCorrectEmail(email) ? "your registered email " : "the email account linked to the username"}  <span className="text-gray-800 font-Lexend_SemiBold">{email}</span>.
                        </p>
                    )}

                    {/* Form */}
                    <form className="flex flex-col items-start w-full mt-2">
                        {!isOTPSent ? (
                            <>
                                {/* Email Input */}
                                <div className="flex flex-col items-start w-full ">
                                    <label htmlFor="email" className="text-sm font-Lexend_SemiBold ">
                                        Email or Username
                                    </label>
                                    <input
                                        type="text"
                                        id="email"
                                        name="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        onFocus={() => setEmailFocus(false)}
                                        onBlur={() => setEmailFocus(true)}
                                        placeholder="Enter your email or username"
                                        className="w-full h-10 px-2 text-sm border border-black rounded outline-none font-Lexend_Regular"
                                    />
                                    <p id="userName" className={`text-xs   ${emailFocus && email && !validEmail ? "instructions text-red-500" : "absolute left-[-9999px]"}`}>
                                        <FontAwesomeIcon icon={faInfoCircle} />
                                        Please enter a valid username or email address.
                                    </p>
                                </div>
                                <div className="relative flex flex-col items-center justify-center w-full h-full pt-2 pb-4">
                                    <label
                                        className="text-sm font-Lexend_Bold"
                                    >
                                        Security Text
                                    </label>
                                    <div className="flex items-center justify-between w-full max-w-xs overflow-hidden text-sm border border-gray-700 rounded outline-none ps-2">
                                        <input
                                            type="text"
                                            value={captchaInput}
                                            onChange={(e) => setCaptchaInput(e.target.value)}
                                            className="outline-none w-28 md:w-32 2xl:w-36 font-Lexend_Regular"
                                            placeholder="Enter captcha"
                                        />

                                        <div className="flex items-center ">
                                            {captchaImg ? (
                                                <img src={captchaImg} alt="Captcha" className="object-contain w-auto h-10 " />
                                            ) : <p className="text-xs text-red-500 font-Lexend_Regular">Captcha not available. Please try again.</p>}
                                            <button
                                                type="button"
                                                onClick={handleCaptcha}
                                                className="h-10 p-1 bg-gray-300 "
                                            >
                                                <IoMdRefresh size={20} />
                                            </button>
                                        </div>
                                    </div>

                                </div>
                                <div className="flex items-center justify-center w-full">
                                    <button
                                        type="button"
                                        onClick={handleSendOTP}
                                        className="flex items-center justify-center px-4 py-2 text-sm text-center text-white bg-gray-800 rounded cursor-pointer w-fit disabled:cursor-not-allowed font-Lexend_SemiBold hover:bg-gray-700"
                                        disabled={!email || loading}
                                    >
                                        {loading ? <PulseLoader size={16} color={"#fff"} className="" /> : "Send OTP"}
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                {/* OTP Input */}
                                <label htmlFor="otp" className="text-sm font-Lexend_SemiBold ">
                                    OTP
                                </label>
                                <input
                                    type="text"
                                    id="otp"
                                    name="otp"
                                    value={otp}
                                    onChange={(e) => setOTP(e.target.value)}
                                    placeholder="Enter your OTP"
                                    className="w-full h-10 p-2 mb-4 text-sm border border-gray-700 rounded"
                                />
                                <div className="flex justify-between w-full text-sm">
                                    {/* Submit OTP Button */}
                                    <button
                                        type="button"
                                        onClick={handleSubmitOTP}
                                        className="flex items-center justify-center px-4 py-2 text-center text-white bg-gray-800 rounded cursor-pointer disabled:cursor-not-allowed font-Lexend_SemiBold hover:bg-gray-700"
                                        disabled={!otp || loadingSubmit}
                                    >
                                        {loadingSubmit ? <PulseLoader size={16} color={"#fff"} className="py-1" /> : "Submit"}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleResendOTP}
                                        className="flex items-center justify-center px-2 py-2 text-center text-white bg-gray-800 rounded cursor-pointer  disabled:cursor-not-allowed font-Lexend_SemiBold hover:bg-gray-700"
                                        disabled={loadingResendOTP}
                                    >
                                        {loadingResendOTP ? <PulseLoader size={16} color={"#fff"} className="py-1" /> : "Resend OTP"}
                                    </button>
                                </div>
                            </>
                        )}
                    </form>
                </div>
            </div>
        </div>

    );
};


export default SignIn;