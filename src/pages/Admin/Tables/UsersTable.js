
import SortableHeader from "./SortableHeader";
import { FaEye } from "react-icons/fa";

export const UserTable = ({
    users,
    currentPage,
    rowsPerPage,
    sortBy,
    sortDirection,
    handleSort,
    handleDeactivateUser,
    handleActivateUser,
    handleEnableUser,
    handleDisableUser,
    handleViewId,
    setSelectedForDeleteUserId,
    setSelectedForDeleteUserEmail,
    setShowUserDeleteModal,
    isLoading,
}) => {
    const columns = [
        { label: "S.No.", index: 0, sortable: true },
        { label: "Name", index: 1, sortable: true },
        { label: "Username", index: 2, sortable: true },
        { label: "Email", index: 3, sortable: true },
        { label: "Mobile", index: 4, sortable: true },
        { label: "User Type", index: 5, sortable: true },
        { label: "Organisation", index: 6, sortable: true },
        { label: "Organisation Type", index: 7, sortable: true },
        { label: "Level", index: 8, sortable: true },
        { label: "Level Info", index: 9, sortable: true },
        { label: "Verified", index: 10, sortable: true },
        { label: "Active", index: 11, sortable: true },
        { label: "Identity", index: 12, sortable: false },
        { label: "Action", index: 13, sortable: false },
    ];
    const renderSkeletonRow = (count = 5) => {
        return [...Array(count)].map((_, idx) => (
            <tr key={idx} className="border-b animate-pulse">
                {Array(14).fill(0).map((_, colIdx) => (
                    <td key={colIdx} className="px-3 py-2">
                        <div className="w-3/4 h-4 bg-gray-300 rounded"></div>
                    </td>
                ))}
            </tr>
        ));
    };
    return (
        <div className="hidden pt-2 overflow-x-auto text-sm sm:block">
            <table className="w-full h-full bg-white rounded-lg font-Lexend_Regular">
                <thead>
                    <tr className="h-10 border-b-2 bg-slate-200">
                        {columns.map((col, i) => {
                            const isFirst = i === 0;
                            const isLast = i === columns.length - 1;

                            const thClasses = `text-start ps-1 ${isFirst ? 'rounded-tl-md' : ''} ${isLast ? 'rounded-tr-md' : ''}`.trim();

                            return col.sortable ? (
                                <SortableHeader
                                    key={col.index}
                                    label={col.label}
                                    index={col.index}
                                    sortBy={sortBy}
                                    sortDirection={sortDirection}
                                    onSort={handleSort}
                                    className={thClasses}
                                />
                            ) : (
                                <th key={col.index} className={thClasses}>
                                    {col.label}
                                </th>
                            );
                        })}
                    </tr>
                </thead>

                <tbody>
                    {isLoading ? (
                        renderSkeletonRow()
                    ) : users.content?.length > 0 ? (
                        users.content.map((user, index) => (
                            <tr key={user.id} className="text-gray-700 border-b-2 h-9">
                                <td className="text-center">
                                    {(currentPage - 1) * rowsPerPage + index + 1}
                                </td>
                                <td className="ps-1">{user.fullName}</td>
                                <td className="ps-1">{user.username}</td>
                                <td className="ps-1">{user.email}</td>
                                <td className="ps-1">{user.mobile}</td>
                                <td className="ps-1">{user.userType}</td>
                                <td className="ps-1">
                                    {user.organisation.name}, {user.organisation.place}
                                </td>
                                <td className="ps-1">
                                    {user.organisation.organisationType === "Organisation"
                                        ? "Government/Corporate"
                                        : user.organisation.organisationType}
                                </td>
                                <td className="ps-1">{user.level}</td>
                                <td className="ps-1">{user.levelInfo}</td>
                                <td className="text-center">{user.verified ? "Yes" : "No"}</td>
                                <td className="text-center">{user.active ? "Yes" : "No"}</td>
                                <td className="text-center">
                                    {user.identificationPresent ? (
                                        <div className="flex items-center justify-center">
                                            <FaEye
                                                size={20}
                                                onClick={() => handleViewId(user.id)}
                                                className="cursor-pointer"
                                            />
                                        </div>
                                    ) : (
                                        "N/A"
                                    )}
                                </td>
                                <td className="ps-1">
                                    {user.role !== "ROLE_ADMIN" && (
                                        <div className="flex flex-col px-2 py-2 space-y-2 text-xs 3xl:flex-row 3xl:space-y-0 3xl:space-x-2 ">
                                            <button
                                                className="px-2 py-1 text-white bg-red-800 rounded"
                                                onClick={() => {
                                                    setSelectedForDeleteUserId(user.id);
                                                    setSelectedForDeleteUserEmail(user.email);
                                                    setShowUserDeleteModal(true);
                                                }}
                                            >
                                                Delete
                                            </button>
                                            {user.active ? (
                                                <button
                                                    className="px-2 py-1 text-white rounded bg-slate-800"
                                                    onClick={() => handleDeactivateUser(user.id)}
                                                >
                                                    Deactivate
                                                </button>
                                            ) : (
                                                <button
                                                    className="px-5 py-1 text-white bg-green-700 rounded"
                                                    onClick={() => handleActivateUser(user.id)}
                                                >
                                                    Activate
                                                </button>
                                            )}
                                            {user.disabled ? (
                                                <button
                                                    title="Enable user account"
                                                    className="px-5 py-1 text-white bg-green-700 rounded"
                                                    onClick={() => handleEnableUser(user.id)}
                                                >
                                                    Enable
                                                </button>

                                            ) : (
                                                <button
                                                    title="Permanently disable user account"
                                                    className="px-2 py-1 text-white rounded bg-slate-800"
                                                    onClick={() => handleDisableUser(user.id)}
                                                >
                                                    Disable
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="12" className="text-center text-gray-500">
                                No user found.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

// MobileCardView.js
export const MobileUserCards = ({
    users,
    currentPage,
    setCurrentPage,
    rowsPerPage,
    sortBy,
    sortDirection,
    setSortBy,
    setSortDirection,
    isLoading,
    handleDeactivateUser,
    handleActivateUser,
    handleEnableUser,
    handleDisableUser,
    setSelectedForDeleteUserId,
    setSelectedForDeleteUserEmail,
    setShowUserDeleteModal,
    handleViewId,

   
}) => {
   
      const fields = [
        { label: "S.No.", value: 0 },
        { label: "Name", value: 1 },
        { label: "Username", value: 2 },
        { label: "Email", value: 3 },
        { label: "Mobile", value: 4 },
        { label: "User Type", value: 5 },
        { label: "Organisation", value: 6 },
        { label: "Organisation Type", value: 7 },
        { label: "Level", value: 8 },
        { label: "Level Info", value: 9 },
        { label: "Verified", value: 10 },
        { label: "Active", value: 11 },
    ];

    const handleSortChange = (e) => {
        const { name, value } = e.target;
        setCurrentPage(1)
        if (name === "sortBy") setSortBy(Number(value));
        if (name === "sortDirection") setSortDirection(value);
    };

    return (
        <div className="block space-y-4 sm:hidden">
           
            <div className="">
                <p className="mb-1 font-medium">Sort By</p>
                <div className="grid grid-cols-4 gap-2">
                    
                    <select
                        name="sortBy"
                        value={sortBy ?? ""}
                        onChange={handleSortChange}
                        className="w-full col-span-3 px-2 py-1 bg-white border rounded"
                    >
                       
                        {fields.map((field) => (
                            <option key={field.value} value={field.value}>
                                {field.label}
                            </option>
                        ))}
                    </select>

                    {/* Direction Dropdown */}
                    <select
                        name="sortDirection"
                        value={sortDirection ?? ""}
                        onChange={handleSortChange}
                        className="w-full px-2 py-1 bg-white border rounded"
                    >
                        <option value="ASC">Asc</option>
                        <option value="DESC">Desc</option>
                    </select>
                </div>
            </div>

            {/* Cards List */}
            {isLoading ? (
                [...Array(3)].map((_, index) => (
                    <div key={index} className="p-4 space-y-2 bg-white rounded shadow animate-pulse">
                        <div className="w-3/4 h-4 rounded bg-slate-200" />
                        <div className="w-5/6 h-4 rounded bg-slate-200" />
                        <div className="w-2/3 h-4 rounded bg-slate-200" />
                        <div className="w-3/4 h-4 rounded bg-slate-200" />
                        <div className="w-4/5 h-4 rounded bg-slate-200" />
                        <div className="w-1/2 h-4 rounded bg-slate-200" />
                        <div className="w-2/3 h-4 rounded bg-slate-200" />
                    </div>
                ))
            ) : users.content?.length > 0 ? (
                users.content.map((user, index) => (
                    <div key={user.id} className="flex flex-col p-4 text-gray-700 bg-white border rounded shadow">
                        <p className="font-Lexend_SemiBold">
                            {(currentPage - 1) * rowsPerPage + index + 1}. {user.fullName}
                        </p>
                        <p><strong>Username:</strong> {user.username}</p>
                        <p><strong>Email:</strong> {user.email}</p>
                        <p><strong>Mobile:</strong> {user.mobile}</p>
                        <p><strong>UserType:</strong> {user.userType}</p>
                        <p>
                            <strong>Organisation:</strong> {user.organisation.name}, {user.organisation.place}
                        </p>
                          <p>
                            <strong>Organisation Type :</strong> {user.organisation.organisationType}
                        </p>
                        <p><strong>{user.level || "Level "}: </strong>{user.levelInfo || "N/A "}</p>
                        <p><strong>Verified:</strong> {user.verified ? "Yes" : "No"}</p>
                        <p><strong>Active:</strong> {user.active ? "Yes" : "No"}</p>
                        <div className="flex items-center space-x-1">
                            <strong>Identity Card: </strong> 
                            {user.identificationPresent ? (
                                    <FaEye
                                        size={20}
                                        onClick={() => handleViewId(user.id)}
                                        className="cursor-pointer"
                                    />
                            ) : (
                                <p> N/A</p>
                            )}
                        </div>

                        {user.role !== "ROLE_ADMIN" && (
                            <div className="flex flex-wrap gap-2 mt-2">
                                <button
                                    className="px-3 py-1 text-white bg-red-600 rounded"
                                    onClick={() => {
                                        setSelectedForDeleteUserId(user.id);
                                        setSelectedForDeleteUserEmail(user.email);
                                        setShowUserDeleteModal(true);
                                    }}
                                >
                                    Delete
                                </button>
                                {user.active ? (
                                    <button
                                        className="px-3 py-1 text-white rounded bg-slate-800"
                                        onClick={() => handleDeactivateUser(user.id)}
                                    >
                                        Deactivate
                                    </button>
                                ) : (
                                    <button
                                        className="px-3 py-1 text-white bg-green-700 rounded"
                                        onClick={() => handleActivateUser(user.id)}
                                    >
                                        Activate
                                    </button>
                                )}
                                {user.disabled ? (
                                    <button
                                        title="Enable user account"
                                        className="px-5 py-1 text-white bg-green-700 rounded"
                                        onClick={() => handleEnableUser(user.id)}
                                    >
                                        Enable
                                    </button>
                                ) : (
                                    <button
                                        title="Permanently disable user account"
                                        className="px-2 py-1 text-white rounded bg-slate-800"
                                        onClick={() => handleDisableUser(user.id)}
                                    >
                                        Disable
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                ))
            ) : (
                <p className="text-center text-gray-500">No user found.</p>
            )}
        </div>
    );
};