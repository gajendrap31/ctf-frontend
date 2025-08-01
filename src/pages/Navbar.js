// import React, { useState } from 'react'
// import { NavLink, useNavigate } from "react-router-dom";
// import { IoMdHelp } from "react-icons/io";
// import { ImMenu } from 'react-icons/im';
// import { Link } from "react-scroll";

// function Navbar() {
//     const navigate = useNavigate()
//     const [isMenuOpen, setIsMenuOpen] = useState(false)
//     const menus = [
//         { name: "HOME", link: "home-section" },
//         { name: "ABOUT US", link: "about-section" },
//         { name: "UPCOMING EVENTS", link: "events-section" },
//         { name: "RESOURCES", link: "resources-section" },
//     ]


//     return (
//         <div className="fixed flex items-center justify-between w-full px-4 py-2 bg-gray-100">
//             {/* Logo and Title */}
//             <div
//                 className="flex items-center space-x-2 cursor-pointer"
//                 onClick={() => {

//                     navigate("/");
//                 }}
//             >
//                 <img
//                     className="w-12 h-12 rounded-full"
//                     src="/cdacLogo.png"
//                     alt="CDAC Logo"
//                     loading="lazy"
//                 />
//                 <h1 className="pl-2 ml-1 text-sm text-blue-700 border-l-2 border-blue-700 md:text-base font-Lexend_SemiBold">
//                     CDAC <br /> CAPTURE THE FLAG
//                 </h1>
//             </div>

//             {/* Menu Links */}
//             <div className="flex-row items-center hidden space-x-3 text-sm text-blue-700 md:flex font-Lexend_SemiBold">
//                 <nav className="space-x-3 text-">
//                     {menus.map((menu, i) => (
//                         <Link
//                         key={i}
//                         to={menu.link}
//                         spy={true}
//                         smooth={true}
//                         duration={500}
//                         offset={-50}  // Adjust based on navbar height
//                         activeClass="bg-gray-300 font-bold border-b-2 border-blue-600"
//                         className="px-3 py-2 transition-all rounded cursor-pointer hover:text-blue-600 hover:bg-gray-300"
//                     >
//                         {menu.name}
//                     </Link>

//                     ))}
//                 </nav>


//             </div>

//             {/* Buttons */}
//             <div className="flex items-center space-x-3 font-Lexend_SemiBold ">

//                 <button
//                     className="hidden px-4 py-2 text-gray-800 bg-gray-300 rounded shadow-lg md:block hover:bg-gray-400"
//                     onClick={() => {
//                         navigate("/sign_up");
//                     }}
//                 >
//                     SIGN UP
//                 </button>
//                 <button
//                     className="hidden px-4 py-2 text-white bg-blue-600 rounded md:block hover:bg-blue-500"
//                     onClick={() => {
//                         navigate("/Login");
//                     }}
//                 >
//                     LOGIN
//                 </button>
//             </div>

//             {/* Hamburger Menu for Small Screens */}
//             <div className="md:hidden font-Lexend_SemiBold">
//                 <button
//                     className="p-2 text-2xl text-gray-600 rounded hover:bg-gray-300"
//                     onClick={() => setIsMenuOpen(!isMenuOpen)}
//                 >
//                     <ImMenu />
//                 </button>
//                 {isMenuOpen && (
//                     <div className="absolute left-0 w-full bg-gray-100 border-t border-gray-300 shadow-md top-16">
//                         <nav className='flex flex-col items-center space-x-3 border-t text-'>
//                             {menus.map((menu, i) => (
//                                 <Link
//                                     to={menu.link}
//                                     spy={true} 
//                                     smooth={true}
//                                     duration={500}
//                                     key={i}
//                                     className={`block px-2 py-1 w-3/4 text-center rounded hover:bg-violet-200`}
//                                     activeClass="text-blue-600 font-bold"
//                                 >
//                                     {menu.name}
//                                 </Link>
//                             ))}
//                         </nav>
//                         <div className="flex flex-col items-center py-3 space-y-3">
//                             <button
//                                 className="w-3/4 px-4 py-2 text-gray-900 bg-gray-300 rounded shadow-lg hover:bg-gray-400"
//                                 onClick={() => {
//                                     navigate("/sign_up");
//                                 }}
//                             >
//                                 SIGN UP
//                             </button>
//                             <button
//                                 className="w-3/4 px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-500"
//                                 onClick={() => {
//                                     navigate("/Login");
//                                 }}
//                             >
//                                 LOGIN
//                             </button>
//                         </div>
//                     </div>
//                 )}
//             </div>
//         </div>

//     )
// }

// export default Navbar


import React, { useState, useEffect } from 'react'
import { useNavigate } from "react-router-dom";
import { ImMenu } from 'react-icons/im';
import { Link } from "react-scroll";
import AuthService from './Authentication/AuthService';
function Navbar({ activeSection }) {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isTokenValid, setIsTokenValid] = useState(false)
    const menus = [
        { name: "HOME", link: "home-section" },
        { name: "ABOUT US", link: "about-section" },
        { name: "UPCOMING EVENTS", link: "events-section" },
    //    { name: "RESOURCES", link: "resources-section" },
    ];
    useEffect(() => {
        const checkToken = async () => {
            const token = AuthService.getToken(); // If it's async
            setIsTokenValid(AuthService.isTokenValid(token));
        };
        checkToken();
    }, []);

    return (
        <div className="fixed z-50 flex items-center justify-between w-full px-4 py-4 bg-gray-100">
            {/* Logo */}
            <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate("/")}>
                <img className="w-12 h-12 rounded-full" src="/cdacLogo.png" alt="CDAC Logo" loading="lazy" />
                <h1 className="pl-2 ml-1 text-sm text-blue-700 border-l-2 border-blue-700 md:text-base font-Lexend_SemiBold">
                    CDAC <br /> CAPTURE THE FLAG
                </h1>
            </div>

            {/* Menu Links */}
            <div className="flex-row items-center hidden space-x-3 text-sm text-blue-700 lg:flex font-Lexend_SemiBold">
                <nav className="space-x-3">
                    {menus.map((menu, i) => (
                        <Link
                            key={i}
                            to={menu.link}
                            spy={true}
                            smooth={true}
                            duration={500}
                            offset={-50} // Adjust based on navbar height
                            className={`hover:text-blue-600 hover:bg-gray-300 px-3 py-2 cursor-pointer rounded transition-all ${activeSection === menu.link ? "bg-gray-300 font-bold border-b-2 border-blue-600" : ""
                                }`}
                        >
                            {menu.name}
                        </Link>
                    ))}
                </nav>
            </div>

            {/* Buttons */}
            {/* {isTokenValid?<div className="flex items-center space-x-3 font-Lexend_SemiBold">
                <button
                    className="hidden px-4 py-2 text-gray-800 bg-gray-300 rounded shadow-lg lg:block hover:bg-gray-400"
                    onClick={() => navigate("/sign_up")}
                >
                    SIGN UP
                </button>
                <button
                    className="hidden px-4 py-2 text-white bg-blue-600 rounded lg:block hover:bg-blue-500"
                    onClick={() => navigate("/Login")}
                >
                    LOGIN
                </button>
            </div>:<button>Dashboard</button>} */}
            {isTokenValid ? (
                <button
                    className="hidden px-4 py-2 text-white bg-blue-600 rounded lg:block hover:bg-blue-500 font-Lexend_SemiBold"
                    onClick={() => navigate("/dashboard")}
                >
                    Dashboard
                </button>
            ) : (
                <div className="flex items-center space-x-3 font-Lexend_SemiBold">
                    <button
                        className="hidden px-4 py-2 text-gray-800 bg-gray-300 rounded shadow-lg lg:block hover:bg-gray-400"
                        onClick={() => navigate("/sign_up")}
                    >
                        SIGN UP
                    </button>
                    <button
                        className="hidden px-4 py-2 text-white bg-blue-600 rounded lg:block hover:bg-blue-500"
                        onClick={() => navigate("/Login")}
                    >
                        LOGIN
                    </button>
                </div>
            )}


            {/* Hamburger Menu for Small Screens */}
            <div className="lg:hidden font-Lexend_SemiBold">
                <button
                    className="p-2 text-2xl text-gray-600 rounded hover:bg-gray-300"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    <ImMenu />
                </button>
                {isMenuOpen && (
                    <div className="absolute left-0 w-full bg-gray-100 border-t border-gray-300 shadow-md top-16">
                        <nav className="flex flex-col items-center">
                            {menus.map((menu, i) => (
                                <Link
                                    key={i}
                                    to={menu.link}
                                    spy={true}
                                    smooth={true}
                                    duration={500}
                                    className={`block px-2 py-1 w-3/4 text-center rounded hover:bg-violet-200 ${activeSection === menu.link ? "text-blue-600 font-bold" : ""
                                        }`}
                                >
                                    {menu.name}
                                </Link>
                            ))}
                        </nav>
                        {isTokenValid ? (
                            <div className='flex items-center justify-center py-2'>
                                <button
                                    className="w-3/4 px-4 py-2 text-white bg-blue-600 rounded  hover:bg-blue-500"
                                    onClick={() => navigate("/dashboard")}
                                >
                                    Dashboard
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center py-3 space-y-3">
                                <button
                                    className="w-3/4 px-4 py-2 text-gray-900 bg-gray-300 rounded shadow-lg hover:bg-gray-400"
                                    onClick={() => navigate("/sign_up")}
                                >
                                    SIGN UP
                                </button>
                                <button
                                    className="w-3/4 px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-500"
                                    onClick={() => navigate("/Login")}
                                >
                                    LOGIN
                                </button>
                            </div>
                        )}
                    </div>

                )}
            </div>
        </div>
    );
}

export default Navbar;
