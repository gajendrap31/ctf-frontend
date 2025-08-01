import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { url } from './Authentication/Utility';
import { BeatLoader, PulseLoader } from 'react-spinners';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faTimes, faCircleCheck, faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { IoMdRefresh } from "react-icons/io";
import { MdHome } from "react-icons/md";
function VerifyEmail() {
    const location = useLocation();
    const navigate = useNavigate();
    const { email } = location.state || {};
    const [inputEmail, setInputEmail] = useState("");
    const [isOTPSent, setIsOTPSent] = useState(false)
    const [otp, setOtp] = useState("");
    const [loadingVerifyEmail, setLoadingVerifyEmail] = useState(false);
    const [loadingResendOTP, setLoadingResendOTP] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    //reload captcha
    const [captchaKey, setCaptchaKey] = useState(0);

    const handleResendOTP = async (email) => {
        setLoadingResendOTP(true);
        try {
            console.log(email)
            const response = await axios.post(
                `${url}/verify/otp/resend`,
                { emailAddress: email },
                {
                    headers: { 'Content-Type': 'application/json' },
                    withCredentials: true,
                }
            );
            console.log(response.data)
            toast.success(response.data);
        } catch (err) {
            toast.error(err.response?.data || "Error occurred while sending otp")

        } finally {
            setLoadingResendOTP(false);
        }
    };

    const handleSendOTP = async (captchaToken, captchaInput) => {
        setLoadingResendOTP(true);
        try {
            console.log({ emailAddress: inputEmail, captchaToken, captchaText: { captchaInput } })
            const response = await axios.post(
                `${url}/verify/otp/send`,
                { emailAddress: inputEmail, captchaToken, captchaText: captchaInput },
                {
                    headers: { 'Content-Type': 'application/json' },
                    withCredentials: true,
                }
            );
            console.log(response.data)
            setIsOTPSent(true)
        } catch (err) {
            console.log(err)
            toast.error(err.response?.data || "Error occurred while sending otp")
            setCaptchaKey(prev => prev + 1);
        } finally {
            setLoadingResendOTP(false);
        }
    };
    const handleVerifyEmail = async () => {
        setLoadingVerifyEmail(true);

        try {
            const response = await axios.post(
                `${url}/verify`,
                { emailAddress: isOTPSent ? inputEmail : email, otpInput: otp },
                {
                    headers: { 'Content-Type': 'application/json' },
                    withCredentials: true,
                }
            );
            console.log(response.data)
            setShowSuccessModal(true);
        } catch (error) {
            toast.error(error.response.data)
        } finally {
            setLoadingVerifyEmail(false);
        }
    };

    return (
        <section className="flex flex-col md:flex-row w-full  min-h-screen items-center md:items-start text-sm">
            <ToastContainer />
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

            {/* RIGHT SECTION */}
            <div className=" w-full md:w-1/2 p-2 min-h-screen flex flex-col">
                {/* Home Icon */}
                <Link to="/" className="text-gray-800 ">
                    <MdHome size={28} />
                </Link>



                {/* Centered form container */}
                <div className="flex-grow flex items-center justify-center overflow-hidden">
                    <div className="bg-white rounded-lg w-full sm:max-w-lg lg:max-w-3xl xl:max-w-2xl flex flex-col items-center justify-center p-6 md:p-8 text-gray-700">
                        <img
                            className="rounded-full h-24 md:h-32"
                            src="/Email_logo.png"
                            alt="Email verify Logo"
                            loading="lazy"
                        />
                        <h1 className="font-Lexend_SemiBold text-xl md:text-2xl px-4 pt-4 pb-2">
                            Verify your email address
                        </h1>
                        <div className="flex items-center mb-4 text-gray-600 text-sm ">
                            <p className="font-Lexend_Regular  ">Already verified?</p>
                            <Link
                                to="/Login"
                                className="ml-2 font-Lexend_Bold text-blue-700 hover:underline"
                            >
                                Login
                            </Link>
                        </div>
                        {email ? <div className='flex flex-col items-center justify-center'>
                            <p className="font-Lexend_Regular text-sm  text-gray-400 p-2 text-center">
                                An OTP has been sent to
                                <span className="text-black"> {email}</span>,<br />
                                please check your inbox and enter the code to verify your account.
                            </p>

                            <input
                                type="text"
                                id="otp"
                                autoComplete="off"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                required
                                className="px-3 py-2 shadow-lg border border-slate-400 rounded w-full sm:w-10/12 md:w-9/12 m-3 h-10 outline-none text-sm"
                                placeholder="Enter OTP"
                            />

                            <div className="font-Lexend_SemiBold space-y-2 md:space-y-0 md:space-x-4 py-2 flex flex-col md:flex-row items-center justify-between">
                                <button
                                    className="bg-blue-600 rounded px-4 py-2 text-white disabled:bg-blue-500 disabled:cursor-not-allowed mb-2 md:mb-0 flex items-center"
                                    onClick={()=>handleResendOTP(email)}
                                    disabled={loadingResendOTP || loadingVerifyEmail}
                                >
                                    {loadingResendOTP ? <PulseLoader size={15} color={"#fff"} /> : "Resend OTP"}
                                </button>
                                <button
                                    className="bg-green-600 rounded px-4 py-2 text-white disabled:bg-green-500 disabled:cursor-not-allowed mb-2 md:mb-0 flex items-center"
                                    onClick={handleVerifyEmail}
                                    disabled={loadingVerifyEmail || loadingResendOTP}
                                >
                                    {loadingVerifyEmail ? <PulseLoader size={15} color={"#fff"} /> : "Verify Email"}
                                </button>
                            </div>
                        </div> : (
                            <div className='w-full  lg:w-2/3 md: sm:w-full'>
                                {!isOTPSent ? (
                                    <div>
                                        <EmailInput
                                            email={inputEmail}
                                            setEmail={setInputEmail}
                                            onSendOTP={handleSendOTP}
                                            loading={loadingResendOTP}
                                            captchaKey={captchaKey}
                                        />
                                    </div>
                                ) : (<div className='flex flex-col items-center justify-center'>
                                    <p className="font-Lexend_Regular text-sm  text-gray-400 p-2 text-center">
                                        An OTP has been sent to
                                        <span className="text-black"> {inputEmail}</span>,<br />
                                        please check your inbox and enter the code to verify your account.
                                    </p>

                                    <input
                                        type="text"
                                        id="otp"
                                        autoComplete="off"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        required
                                        className="px-3 py-2 shadow-lg border border-slate-400 rounded w-full sm:w-10/12 md:w-9/12 m-3 h-10 outline-none "
                                        placeholder="Enter OTP"
                                    />

                                    <div className="font-Lexend_SemiBold space-y-2 md:space-y-0 md:space-x-4 py-2 flex flex-col md:flex-row items-center justify-center text-sm">
                                        <button
                                            className="bg-blue-600 rounded px-4 py-2 text-white disabled:bg-blue-500 disabled:cursor-not-allowed mb-2 md:mb-0 flex items-center"
                                            onClick={()=>handleResendOTP(inputEmail)}
                                            disabled={loadingResendOTP || loadingVerifyEmail}
                                        >
                                            {loadingResendOTP ? <PulseLoader size={15} color={"#fff"} /> : "Resend OTP"}
                                        </button>
                                        <button
                                            className="bg-green-600 rounded px-4 py-2 text-white disabled:bg-green-500 disabled:cursor-not-allowed mb-2 md:mb-0 flex items-center"
                                            onClick={handleVerifyEmail}
                                            disabled={loadingVerifyEmail || loadingResendOTP}
                                        >
                                            {loadingVerifyEmail ? <PulseLoader size={15} color={"#fff"} /> : "Verify Email"}
                                        </button>
                                    </div>
                                </div>)}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {showSuccessModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm sm:max-w-md md:max-w-lg text-center font-Lexend_Regular">
                        <FontAwesomeIcon
                            icon={faCircleCheck}
                            className="w-20 h-20 mx-auto mb-4 text-green-500"
                        />
                        <h2 className="text-2xl font-Lexend_SemiBold text-green-600 mb-2">
                            Verification Successful!
                        </h2>
                        <p className="text-gray-600 mb-4">
                            Email verification complete!
                            <br />
                            You're all set to log in now.
                        </p>
                        <button
                            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition duration-300"
                            onClick={() => navigate('/Login', { replace: true })}
                        >
                            Go to Login
                        </button>
                    </div>
                </div>
            )}

        </section>

    );
}

const EmailInput = ({ email, setEmail, onSendOTP, loading, captchaKey }) => {
    const EMAIL_REGEX = /^[a-zA-Z0-9][a-zA-Z0-9._%+-]*@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const [validEmail, setValidEmail] = useState(false);
    const [emailFocus, setEmailFocus] = useState(false)
    const [captchaImg, setCaptchaImg] = useState('');
    const [captchaToken, setCaptchaToken] = useState('');
    const [captchaInput, setCaptchaInput] = useState('');

    useEffect(() => {
        const isValid = email.length <= 320 && EMAIL_REGEX.test(email);
        setValidEmail(isValid);
    }, [email]);

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

    const handleChange = (e) => {
        const value = e.target.value;
        setEmail(value);
    };

    return (
        <div className="flex flex-col w-">
            <div>


                <label className="font-Lexend_Bold">
                    Email Address <span className="text-red-500 pr-2">*</span>
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
                    onFocus={() => setEmailFocus(true)}
                    onBlur={() => setEmailFocus(false)}
                    className="outline-none  rounded w-full h-10 font-Lexend_Regular text-gray-800 border-gray-800 border  px-2 "
                    placeholder="Enter your email address"
                />
                <p id="email" className={`text-xs ${emailFocus && email && !validEmail ? "instructions text-red-500" : "absolute left-[-9999px]"}`}>
                    <FontAwesomeIcon icon={faInfoCircle} />
                    Please enter a valid email address.
                </p>
            </div>
            <div className="flex flex-col items-center justify-center relative h-full pt-2">
                
                <label
                    className="font-Lexend_Bold  "
                >
                    Security Text  <span className="text-red-500">*</span>
                </label>
                <div className="outline-none text-gray-800 font-Lexend_Regular  rounded border-gray-800 border w-full max-w-xs flex items-center justify-between ps-2 overflow-hidden">
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
            <div className='flex items-center justify-center w-full'>
                <button
                    onClick={() => onSendOTP(captchaToken, captchaInput)}
                    className="w-fit px-4 mt-4 text-center flex items-center justify-center font-Lexend_Bold py-2 disabled:bg-gray-700 disabled:cursor-not-allowed bg-gray-800 text-white rounded cursor-pointer hover:bg-gray-700"
                    disabled={!validEmail || loading}
                >
                    {loading ? <PulseLoader size={15} color={"#fff"} /> : "Send OTP"}
                </button>
            </div>

        </div >
    );
};
export default VerifyEmail;
