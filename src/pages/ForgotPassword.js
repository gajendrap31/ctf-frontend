


import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { url } from "./Authentication/Utility";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CryptoJS from "crypto-js";
import { IoMdRefresh } from "react-icons/io";
import { faCheck, faTimes, faEye, faEyeSlash, faInfoCircle, faCircleCheck } from "@fortawesome/free-solid-svg-icons";
import { BeatLoader, PulseLoader } from 'react-spinners';
import { MdHome } from "react-icons/md";
const API_BASE_URL = "http://your-backend-api.com";

const ForgotPassword = () => {

    const navigate = useNavigate()
    const [step, setStep] = useState(1);

    const [email, setEmail] = useState("");
    const [token, setToken] = useState()

    const [loading, setLoading] = useState(false)
    //Reload captcha
    const [captchaKey, setCaptchaKey] = useState(0);
    // Handlers
    const handleSendOTP = async (captchaToken, captchaInput) => {
        console.log(email)
        try {
            setLoading(true)
            console.log({ emailAddress: email, captchaToken, captchaText: captchaInput })
            const res = await axios.post(
                `${url}/forgot-password/otp`,
                { emailAddress: email, captchaToken, captchaText: captchaInput },
                {
                    headers: { 'Content-Type': 'application/json' },
                    withCredentials: true,
                }
            );
            console.log(res.data);
            toast.success(res?.data || "OTP sent successfully, Please check your email.")
            setStep(2);
        } catch (error) {
            toast.error(error.response?.data || "Email doesn't exist")
            console.log(error)
            setCaptchaKey(prev => prev + 1);
        } finally {
            setLoading(false)
        }
    }




    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <EmailInput
                        email={email}
                        setEmail={setEmail}
                        onSendOTP={handleSendOTP}
                        loading={loading}
                        captchaKey={captchaKey}
                    />
                );
            case 2:
                return (
                    <OTPInput
                        email={email}
                        setStep={setStep}
                        setToken={setToken}

                    />
                );
            case 3:
                return (
                    <ResetPassword
                        email={email}
                        token={token}
                        navigate={navigate}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <section className="flex flex-col lg:flex-row w-full min-h-screen">

            {/* LEFT SECTION - IMAGE & TEXT */}
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
                <div className="w-full md:w-3/4 space-y-20">
                    {/* Logo and Title */}
                    <div
                        className="flex flex-col items-center justify-center cursor-pointer"
                        onClick={() => {
                            navigate("/");
                        }}
                    >
                        <img
                            className="rounded-full h-16 md:h-24"
                            src="/cdacLogo.png"
                            alt="CDAC Logo"
                            loading="lazy"
                        />
                        <h2 className="text-center text-2xl md:text-3xl mt-2 font-Lexend_SemiBold">CDAC CTF</h2>
                    </div>

                    {/* Text Section */}
                    <div>
                        <h2 className="text-center text-2xl md:text-3xl font-Lexend_SemiBold">
                            Capture The Flag
                        </h2>
                        <p className="text-center text-gray-300 mt-4">
                            Enhance your cyber security skills by tackling challenges on the CDAC
                            CTF platform.
                        </p>
                    </div>
                </div>
            </div>

            {/* RIGHT SECTION - FORGOT PASSWORD FORM */}
            <div className="flex flex-col items-center w-full md:w-1/2 p-2 min-h-full">
                <Link to="/" className="self-start text-gray-800">
                    <MdHome size={28} />
                </Link>
                <ToastContainer />
                <div className="w-full flex items-center justify-center h-full">

                    <div className="w-full sm:max-w-md lg:max-w-lg">
                        <h1 className="text-gray-700 font-Lexend_Bold text-2xl md:text-3xl mb-4">Forgot Password</h1>
                        <div className="flex mb-4 space-x-2 font-Lexend_Regular text-gray-600">
                            <p className="text-sm ">Remember your password?</p>
                            <Link to="/Login" className="font-Lexend_Bold text-blue-700 hover:underline">
                                Login here
                            </Link>
                        </div>

                        {/* Forgot password steps (rendered dynamically) */}
                        <div>{renderStep()}</div>
                    </div>
                </div>
            </div>

        </section>

    );
};

const EmailInput = ({ email, setEmail, onSendOTP, loading, captchaKey }) => {
    const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;

    // const EMAIL_REGEX = /^[a-zA-Z0-9_+&*-]+(?:\\.[a-zA-Z0-9_+&*-]+)*@(?:[a-zA-Z0-9-]+\\.)+[a-zA-Z]{2,7}$/;
    const [validEmail, setValidEmail] = useState(false);
    const [emailFocus, setEmailFocus] = useState(false)
    const [captchaImg, setCaptchaImg] = useState('');
    const [captchaToken, setCaptchaToken] = useState('');
    const [captchaInput, setCaptchaInput] = useState('');

    useEffect(() => {
        setValidEmail(EMAIL_REGEX.test(email));
    }, [email])

    const handleChange = (e) => {
        const value = e.target.value;
        setEmail(value);
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
    }, [captchaKey])

    return (
        <div className="flex flex-col text-sm">
            <div className="flex flex-col">
                <label className="font-Lexend_Bold">
                    Email Address <span className="text-red-500">*</span>
                    {/* <FontAwesomeIcon icon={faCheck} className={validEmail ? "text-green-600 ml-1/4" : "hidden"} />
                    <FontAwesomeIcon icon={faTimes} className={email !== "" && !validEmail ? "text-red-500 ml-1/4" : "hidden"} /> */}
                </label>
                <input
                    type="email"
                    value={email}
                    onChange={handleChange}
                    maxLength={128}
                    required
                    aria-invalid={validEmail ? "false" : "true"}
                    aria-describedby="email"
                    onFocus={() => setEmailFocus(false)}
                    onBlur={() => setEmailFocus(true)}
                    className="outline-none rounded  h-10 font-Lexend_Regular border-black border  px-2 "
                    placeholder="Enter your email"
                />
                <p id="email" className={`text-xs ${emailFocus && email && !validEmail ? "instructions text-red-500" : "absolute left-[-9999px]"}`}>
                    <FontAwesomeIcon icon={faInfoCircle} />
                    Please enter a valid email address.
                </p>
            </div>
            <div className="flex flex-col items-center justify-center relative h-full pt-2">
                <label
                    className="font-Lexend_Bold "
                >
                    Security Text <span className="text-red-500">*</span>
                </label>
                <div className="outline-none  rounded border-gray-700 border w-full max-w-xs flex items-center justify-between ps-2 overflow-hidden font-Lexend_Regular">
                    <input
                        type="text"
                        value={captchaInput}
                        onChange={(e) => setCaptchaInput(e.target.value)}
                        className="w-28 md:w-32 2xl:w-36  font-Lexend_Regular outline-none"
                        placeholder="Enter captcha"
                    />

                    <div className="flex items-center ">
                        {captchaImg ? (
                            <img src={captchaImg} alt="Captcha" className="h-10 w-auto object-contain " />
                        ) : <p className="text-xs text-red-500 font-Lexend_Regular">Captcha not available. Please try again.</p>}
                        <button
                            type="button"
                            onClick={handleCaptcha}
                            className="bg-gray-300 p-1 h-10 "
                        >
                            <IoMdRefresh size={20} />
                        </button>
                    </div>
                </div>
            </div>
            <div className="w-full text-center flex items-center justify-center font-Lexend_Bold   text-white    mt-4">
                <button
                    onClick={() => onSendOTP(captchaToken, captchaInput)}
                    className={`w-fit px-4 py-2 bg-gray-800 flex items-center cursor-pointer hover:bg-gray-700 rounded`}
                    disabled={!validEmail || loading}
                >
                    {loading ? <PulseLoader size={15} color={"#fff"} /> : "Send OTP"}
                </button>
            </div >
        </div >
    );
};

const OTPInput = ({ email, setStep, setToken }) => {
    const [otp, setOtp] = useState("");
    const [loadingSubmit, setLoadingSubmit] = useState(false)
    const [loadingResend, setLoadingResend] = useState(false)

    const handleSubmitOTP = async () => {
        try {
            setLoadingSubmit(true)
            console.log("Hello")
            console.log(email, otp)
            const res = await axios.post(
                `${url}/reset-password/otp/verify`,
                { emailAddress: email, otp },
                {
                    headers: { 'Content-Type': 'application/json' },
                    withCredentials: true,
                }
            );
            console.log(res);

            setToken(res.data)
            setStep(3);
        } catch (error) {
            toast.error(error.response?.data || "Error occured while verifing the email!")
            console.error(error);
        } finally {
            setLoadingSubmit(false)
        }
    };
    const handleResendOTP = async () => {
        console.log(email)
        try {
            setLoadingResend(true)
            console.log({ emailAddress: email, })
            const res = await axios.post(
                `${url}/forgot-password/otp/resend`,
                { emailAddress: email, },
                {
                    headers: { 'Content-Type': 'application/json' },
                    withCredentials: true,
                }
            );
            console.log(res.data);
            toast.success(res?.data || "OTP sent successfully, Please check your email.")
            setStep(2);
        } catch (error) {
            toast.error(error.response?.data || "Email doesn't exist")
            console.log(error)
        } finally {
            setLoadingResend(false)
        }
    }
    return (
        <div className="flex flex-col items-center w-full max-w-sm mx-auto md:max-w-md lg:max-w-lg text-sm">
            <p className="mb-4 text-center font-Lexend_Regular text-sm ">
                OTP has been sent to your email <span className="text-green-500">{email}</span>
            </p>
            <label className="font-Lexend_Bold text-sm  self-start">OTP</label>
            <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full  px-2 py-1 h-10 shadow-md border font-Lexend_Regular border-slate-400 rounded focus:outline-none "
                placeholder="Enter your OTP"
            />
            <div className="flex items-center justify-between w-full">

                <div className=" text-center  font-Lexend_Bold   text-white    mt-4">
                    <button
                        onClick={handleSubmitOTP}
                        className={`w-fit px-4 py-2 bg-gray-800 cursor-pointer hover:bg-gray-700 rounded text-center flex items-center `}
                        disabled={!otp || loadingSubmit}
                    >
                        {loadingSubmit ? <PulseLoader size={15} color={"#fff"} /> : "Submit OTP"}
                    </button>
                </div >
                <div className=" text-center  font-Lexend_Bold   text-white    mt-4">
                    <button
                        onClick={handleResendOTP}
                        className={`w-fit px-4 py-2 bg-gray-800 cursor-pointer hover:bg-gray-700 rounded text-center flex items-center `}
                        disabled={loadingResend}
                    >
                        {loadingResend ? <PulseLoader size={15} color={"#fff"} /> : "Resend OTP"}
                    </button>
                </div >
            </div>
        </div>

    )
};

const ResetPassword = ({ email, token, navigate }) => {

    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false)
    const [validPassword, setValidPassword] = useState(false);
    const [passwordFocus, setPasswordFocus] = useState(false);

    const [confirmPassword, setConfirmPassword] = useState("");
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [validConfirmPassword, setValidConfirmPassword] = useState(false);
    const [confirmPasswordFocus, setConfirmPasswordFocus] = useState(false);

    const [loadingSubmit, setLoadingSubmit] = useState(false)

    const [forgotPasswordSuccessModalOpen, setForgotPasswordSuccessModalOpen] = useState(false)

    const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%&*_+=])[a-zA-Z\d!@#$%&*_+=]+$/;
    useEffect(() => {
        setValidPassword(
            password.length >= 8 &&
            password.length <= 40 &&
            PASSWORD_REGEX.test(password)
        );
        setValidConfirmPassword(password === confirmPassword && password !== '')
    }, [password, confirmPassword])

    const keyString = "7QzUf03atxcazzHM1x5SLQ==";
    const ivString = "Hy7oeHHNuXxYwdRluO6c5A==";
    const key = CryptoJS.enc.Base64.parse(keyString);
    const iv = CryptoJS.enc.Base64.parse(ivString);

    // Encrypt the password
    const encryptedPassword = CryptoJS.AES.encrypt(password, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
    }).toString();


    const handleResetPassword = async () => {
        try {
            console.log(email, password, token)
            setLoadingSubmit(true)
            const res = await axios.post(
                `${url}/reset-password`,
                { emailAddress: email, password: encryptedPassword, token },
                {
                    headers: { 'Content-Type': 'application/json' },
                    withCredentials: true,
                }
            );
            toast.success(res.data || "Password reset successful");
            // setTimeout(() => {
            //     navigate("/Login")
            // }, 2000);
            setForgotPasswordSuccessModalOpen(true)
        } catch (error) {
            toast.error(error.response?.data || "Enter valid password")
            console.error(error);
        } finally {
            setLoadingSubmit(false)
        }
    };
    return (
        <div className="flex flex-col items-center w-full font-Lexend_Regular max-w-sm mx-auto md:max-w-md lg:max-w-lg text-sm">
            <p className="mb-4 text-center font-Lexend_Regular text-sm">
                Enter new password for account associated with email{" "}
                <span className="text-green-500">{email}</span>
            </p>
            <div className="flex flex-col relative w-full">
                <label className="font-Lexend_Bold text-sm self-start">New Password <span className="text-red-500">*</span></label>
                <div className="relative w-full">
                    <input
                        type={showPassword ? "text" : "password"}
                        id="password"
                        name="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onFocus={() => setPasswordFocus(true)}
                        onBlur={() => setPasswordFocus(false)}
                        onPaste={(e) => e.preventDefault()}
                        maxLength={40}
                        required
                        aria-invalid={!validPassword}
                        className={`w-full  px-2 py-1 h-10 shadow-md border ${passwordFocus ? "border-slate-600" : "border-gray-400"} rounded outline-none`}
                        placeholder="Enter new password"
                    />

                    {/* Eye Icon */}
                    <button
                        type="button"
                        onClick={() => setShowPassword(prev => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-800 focus:outline-none"
                        tabIndex={-1}
                    >
                        <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                    </button>
                </div>
                {passwordFocus && password && !validPassword && (
                    <p className="text-xs text-red-500 mt-1">
                        Password must be 8–40 characters and include at least 1 uppercase letter, 1 lowercase letter, 1 digit, and 1 special character (!@#$%&*_+=).
                    </p>
                )}
            </div>

            <div className="flex flex-col relative w-full">
                <label className="font-Lexend_Bold text-sm mt-4 self-start">Confirm Password <span className="text-red-500">*</span></label>
                <div className="relative w-full">
                    <input
                        type={showConfirmPassword ? "text" : "password"}
                        id="confirmPassword"
                        name="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        onFocus={() => setConfirmPasswordFocus(true)}
                        onBlur={() => setConfirmPasswordFocus(false)}
                        onPaste={(e) => e.preventDefault()}
                        maxLength={40}
                        required
                        className={`w-full  px-2 py-1 h-10 shadow-md border ${confirmPasswordFocus ? "border-slate-600" : "border-gray-400"} rounded outline-none`}
                        placeholder="Confirm your password"
                    />

                    {/* Eye Icon */}
                    <button
                        type="button"
                        onClick={() => setShowConfirmPassword(prev => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-800 outline-none"
                        tabIndex={-1}
                    >
                        <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
                    </button>
                </div>
                {confirmPasswordFocus && confirmPassword && !validConfirmPassword && (
                    <p className="text-sm text-red-500 mt-1">
                        Confirm Password doesn't match the password
                    </p>
                )}
            </div>

            <div>
                <button
                    onClick={handleResetPassword}
                    className="w-full mt-4 font-Lexend_Bold py-1 px-4 bg-gray-800 text-white rounded shadow hover:bg-gray-700 transition duration-200 flex items-center justify-center "
                    disabled={!validPassword || !validConfirmPassword || loadingSubmit}
                >
                    {loadingSubmit ? <PulseLoader size={15} color={"#fff"} /> : "Submit"}
                </button>
            </div>
            {forgotPasswordSuccessModalOpen && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
    <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-sm sm:max-w-md md:max-w-lg text-center font-Lexend_Regular">
      {/* Success Icon */}
      <FontAwesomeIcon
        icon={faCircleCheck}
        className="w-16 h-16 mx-auto mb-4 text-green-500"
      />

      {/* Heading */}
      <h2 className="text-2xl font-Lexend_SemiBold text-green-600 mb-3">
        Password Reset Successful!
      </h2>

      {/* Message */}
      <p className="text-gray-700 mb-6 leading-relaxed">
        Your password has been reset successfully. <br />
        You can now log in with your new password.
      </p>

      {/* Action Button */}
      <div className="flex justify-center">
        <button
          className="bg-green-600 text-white px-6 py-2 rounded-full hover:bg-green-700 transition duration-300"
          onClick={() => navigate("/Login")}
        >
          Go to Login
        </button>
      </div>
    </div>
  </div>
)}

        </div>

    );
};

export default ForgotPassword