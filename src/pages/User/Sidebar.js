import React, { useState, useEffect } from "react";
import { AiFillDashboard } from "react-icons/ai";
import { ImMenu } from 'react-icons/im';
import { NavLink } from "react-router-dom";
import { FaFlagCheckered } from 'react-icons/fa';
import { PiMicrosoftTeamsLogoBold } from "react-icons/pi";
import { MdOutlineScoreboard } from "react-icons/md"
import { RiTeamFill } from "react-icons/ri";
import { FaUsersLine } from "react-icons/fa6";
import { TbLayoutDashboardFilled } from "react-icons/tb";
const Sidebar = ({ value, setValue }) => {

    const menus = [
        { name: "Dashboard", link: "/Dashboard", icon: TbLayoutDashboardFilled, url: 'UserAssets/dashboard.png' },
        // { name: "Challenges", link: "/Challenges", icon: AiFillDashboard, url:'UserAssets/challenges.png'},
        { name: "Teams", link: "/Teams", icon: FaUsersLine, url: 'UserAssets/team.png' },
        { name: "My Team", link: "/Myteams", icon: RiTeamFill, url: 'UserAssets/myteam.png' },
        { name: "Submissions", link: "/Submissions", icon: FaFlagCheckered, url: 'UserAssets/myteam.png' },
        { name: "Scoreboard", link: "/Scoreboard", icon: MdOutlineScoreboard, url: 'UserAssets/scoreboard.png' },
        // { name: "Events", link: "/Events", icon: AiFillDashboard },
    ];

    return (
        // <section className=" bg-white fixed rounded-s-xl text-sm">

        //     {value && <div className={` shadow-md overflow-hidden min-h-screen ${value ? "w-72" : "w-0"} duration-500  text-gray-300 bg-slate-900 space-y-2 font-Lexend_SemiBold`}>

        //         <div className="flex items-center justify-between p-2 py-2">
        //             <div className="flex items-center">
        //                 <img className="rounded-full h-16 w-16 p-2 " src='/cdacLogo.png' alt="CDAC Logo" loading="lazy" />
        //                 <h1 className='text-xl font-Lexend_Bold hd:text-3xl xl:text-xl lg:text-base md:text-sm text-sky-500 flex flex-col'>
        //                     CDAC<span className="text-white "> Capture the Flag</span>
        //                 </h1>
        //             </div>

        //             <div className=" mb-4 rounded p-1 flex items-center hover:text-gray-400 cursor-pointer" onClick={() => setValue(!value)}>
        //                 <ImMenu size={26} />
        //             </div>
        //         </div>

        //         {menus.map((menu, i) => (
        //             <div key={i}>
        //                 <NavLink
        //                     to={menu.link}
        //                     className={` group flex items-center gap-3.5 font-bold p-2 hover:bg-slate-800 hover:text-white rounded ps-1`}

        //                     style={({ isActive }) => ({ color: isActive ? 'white' : '', background: isActive ? '#475569' : '' })}
        //                     end
        //                 >
        //                     <div className={`ml-3 font-bold ${menu.color}`}>
        //                         {React.createElement(menu.icon, { size: "24" })}
        //                     </div>
        //                     <h2 className={`whitespace-pre duration-00 ${!value && "opacity-0 translate-x-28 overflow-hidden"}`}>
        //                         {menu.name}
        //                     </h2>

        //                 </NavLink>
        //                 {menu.submenu?.map((smenu, index) => (
        //                     <NavLink
        //                         to={smenu.link}
        //                         key={index}
        //                         className={`group flex items-center gap-3 font-bold p-2 hover:bg-slate-800 hover:text-white rounded-md ${value && 'ml-8'} mx-1 mt-1 p-1 ps-1`}
        //                         style={({ isActive }) => ({ color: isActive ? 'white' : '', background: isActive ? '#0c4a6e' : '' })}
        //                         end
        //                     >
        //                         <div className={`ml-3 font-bold ${smenu.color}`}>
        //                             {React.createElement(smenu.icon, { size: "24" })}
        //                         </div>
        //                         <h2 className={`whitespace-pre duration-00  ${!value && "opacity-0 translate-x-28 overflow-hidden"}`}>
        //                             {smenu.name}
        //                         </h2>
        //                         {/* <h2 className={`${open && "hidden"} absolute left-48 bg-white font-bold whitespace-pre text-gray-500 rounded-md drop-shadow-lg px-0 py-0 w-0 overflow-hidden group-hover:px-2 group-hover:py-1 group-hover:left-14 group-hover:duration-300 group-hover:w-fit`}>
        //                                 {smenu.name}
        //                             </h2> */}
        //                     </NavLink>
        //                 ))}
        //             </div>
        //         ))}
        //     </div>}

        // </section>
        <>
            {/* Sidebar Overlay (Mobile Only) */}
            {value && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-40 z-30 md:hidden"
                    onClick={() => setValue(false)}
                />
            )}

            {/* Sidebar */}
            <section
                className={`fixed top-0 left-0 z-40 h-screen bg-slate-900 text-white shadow-lg transform transition-transform duration-300 ease-in-out
                ${value ? "translate-x-0 w-64  md:w-72" : "-translate-x-full "} `}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 bg-slate-800">
                    <div className="flex items-center">
                        <img
                            src="/cdacLogo.png"
                            alt="CDAC Logo"
                            className="h-12 w-12 rounded-full mr-2"
                            loading="lazy"
                        />
                        <h1 className="text-lg md:text-xl text-sky-400 font-Lexend_Bold leading-tight">
                            CDAC
                            <span className="block text-white text-sm font-normal">Capture the Flag</span>
                        </h1>
                    </div>
                    <button
                        className="text-white p-2"
                        onClick={() => setValue(false)}
                        aria-label="Close sidebar"
                    >
                        <ImMenu size={22} />
                    </button>
                </div>

                {/* Menu Items */}
                <nav className="mt-4 px-2 space-y-1 font-Lexend_SemiBold text-sm">
                    {menus.map((menu, i) => (
                        <NavLink
                            key={i}
                            to={menu.link}
                            className={({ isActive }) =>
                                `flex items-center gap-4 px-4 py-2 rounded hover:bg-slate-800 ${isActive ? "bg-slate-700 text-white" : "text-gray-300"
                                }`
                            }
                            onClick={() => setValue(false)} // auto-close on mobile
                        >
                            {React.createElement(menu.icon, { size: 20 })}
                            <span>{menu.name}</span>
                        </NavLink>
                    ))}
                </nav>
            </section>
        </>
    );
};

export default Sidebar;


