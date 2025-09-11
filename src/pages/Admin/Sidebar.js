
import React, { useState} from "react";
import { NavLink } from "react-router-dom";
import { ImMenu } from 'react-icons/im';
import { TbLayoutDashboardFilled } from "react-icons/tb";
import { FaUsers,FaRegUser, FaFlagCheckered } from "react-icons/fa";
import { FaUsersLine } from "react-icons/fa6";
import { MdOutlineScoreboard, MdOutlineArrowForwardIos, MdOutlineExpandMore, MdOutlineEventNote, MdOutlineRateReview } from "react-icons/md";
import { GoOrganization } from "react-icons/go";
import { IoExtensionPuzzle } from "react-icons/io5";
import { TbReport } from "react-icons/tb";
const Sidebar = ({ open, setValue }) => {
    const storedSubmenu = localStorage.getItem("activeSubmenu");
    const [activeSubmenu, setActiveSubmenu] = useState(storedSubmenu ? JSON.parse(storedSubmenu) : null);
    const [openSubmenu, setOpenSubmenu] = useState(storedSubmenu !== null);

    const adminMenus = [
        { id: 1, name: "Dashboard", link: "/dashboard", icon: TbLayoutDashboardFilled },
        {
            id: 2, name: "Events", icon: MdOutlineEventNote,
            submenu: [
                { id: 3, name: "Manage Events", link: "/admin/events" },
                { id: 4, name: "Assign Challenges", link: "/admin/assign-challenges" },
                { id: 5, name: "Add Instruction", link: "/admin/instruction" },
                { id: 6, name: "Go Live", link: "/admin/activate-events" }
            ]
        },
        { id: 7, name: "Registered Users", link: "/admin/registered-users", icon: FaRegUser },
        { id: 8, name: "Teams", link: "/admin/teams", icon: FaUsersLine },
        {
            id: 9, name: "Challenges", icon: IoExtensionPuzzle,
            submenu: [
                { id: 10, name: "Challenge", link: "/admin/challenges" },
                { id: 11, name: "Challenge Category", link: "/admin/challenge-category" }
            ]
        },
        { id: 12, name: "Submissions", link: "/admin/submissions", icon: FaFlagCheckered },
        { id: 13, name: "Scoreboard", link: "/admin/scoreboard", icon: MdOutlineScoreboard },
        { id: 14, name: "Review Submissions", link: "/admin/mark-for-review", icon: MdOutlineRateReview },
          {
            id: 15, name: "Organsations", icon: GoOrganization,
            submenu: [
                { id: 16, name: "Manage Organisations", link: "/admin/organisations", },
                { id: 17, name: "State & Union Territory", link: "/admin/state-ut" }
            ]
        },
       
        { id: 18, name: "Manage Users", link: "/admin/users", icon: FaUsers },
        { id: 19, name: "Report", link: "/admin/report", icon: TbReport },
        // { id: 17, name: "Notifications", link: "/admin/notifications", icon: MdOutlineNotificationsActive }
       
    ];

    const handleMenuClick = (menuId) => {
        const newActive = activeSubmenu === menuId ? null : menuId;
        setActiveSubmenu(newActive);
        setOpenSubmenu(newActive !== null);
        localStorage.setItem("activeSubmenu", JSON.stringify(newActive));
    };

    return (
        <>
            {/* Overlay for mobile */}
            {open && (
                <div
                    className="fixed inset-0 z-30 bg-black bg-opacity-40 md:hidden"
                    onClick={() => setValue(false)}
                />
            )}

            {/* Sidebar Panel */}
            <section
                className={`fixed top-0 overflow-auto left-0 z-40 h-screen bg-slate-900 text-white shadow-lg transform transition-transform duration-300 ease-in-out
                ${open ? "translate-x-0 w-64 md:w-72" : "-translate-x-full"}`}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 bg-slate-800">
                    <div className="flex items-center">
                        <img src="/cdacLogo.png" alt="CDAC Logo" className="w-12 h-12 mr-2 rounded-full" />
                        <h1 className="text-lg leading-tight md:text-xl text-sky-400 font-Lexend_Bold">
                            CDAC
                            <span className="block text-sm font-normal text-white">Capture the Flag</span>
                        </h1>
                    </div>
                    <button className="p-2 text-white" onClick={() => setValue(false)}>
                        <ImMenu size={22} />
                    </button>
                </div>

                {/* Menu */}
                <nav className="px-2 mt-4 space-y-1 text-sm font-Lexend_SemiBold">
                    {adminMenus.map((menu) => (
                        <div key={menu.id}>
                            {menu.submenu ? (
                                <>
                                    <div
                                        className={`flex items-center justify-between px-4 py-2 cursor-pointer rounded hover:bg-slate-800 ${activeSubmenu === menu.id ? "bg-slate-700" : ""
                                            }`}
                                        onClick={() => handleMenuClick(menu.id)}
                                    >
                                        <div className="flex items-center gap-3">
                                            {React.createElement(menu.icon, { size: 20 })}
                                            <span>{menu.name}</span>
                                        </div>
                                        {activeSubmenu === menu.id && openSubmenu ? (
                                            <MdOutlineExpandMore size={20} />
                                        ) : (
                                            <MdOutlineArrowForwardIos size={14} />
                                        )}
                                    </div>
                                    {activeSubmenu === menu.id && (
                                        <div className="mt-1 ml-10 space-y-1">
                                            {menu.submenu.map((submenu) => (
                                                <NavLink
                                                    to={submenu.link}
                                                    key={submenu.id}
                                                    className={({ isActive }) =>
                                                        `block px-3 py-1.5 rounded hover:bg-slate-700 ${isActive ? "bg-slate-700 text-white" : "text-gray-300"}`
                                                    }
                                                    onClick={() => setValue(false)}
                                                >
                                                    {submenu.name}
                                                </NavLink>
                                            ))}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <NavLink
                                    to={menu.link}
                                    className={({ isActive }) =>
                                        `flex items-center gap-3 px-4 py-2 rounded hover:bg-slate-800 ${isActive ? "bg-slate-700 text-white" : "text-gray-300"}`
                                    }
                                    onClick={() => setValue(false)}
                                >
                                    {React.createElement(menu.icon, { size: 20 })}
                                    <span>{menu.name}</span>
                                </NavLink>
                            )}
                        </div>
                    ))}
                </nav>
            </section>
        </>
    );
};

export default Sidebar;
