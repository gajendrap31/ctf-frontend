import { GiCheckMark } from "react-icons/gi";
import { CgClose } from "react-icons/cg";
import SortableHeader from "../SortableHeader";
export const RegisteredUserTable = ({
    users,
    currentPage,
    rowsPerPage,
    sortBy,
    sortDirection,
    handleSort,
    isLoading,
}) => {
    const columns = [
        { label: "S.No.", index: 0, sortable: true },
        { label: "Name", index: 1, sortable: true },
        { label: "Email", index: 2, sortable: true },
        { label: "Mobile", index: 3, sortable: true },
        { label: "User Type", index: 4, sortable: true },
        { label: "Organization", index: 5, sortable: true },
        { label: "Participated", index: 6, sortable: false },
    ];
    const renderSkeletonRow = (count = 5) => {
        return [...Array(count)].map((_, idx) => (
            <tr key={idx} className="border-b animate-pulse">
                {Array(7).fill(0).map((_, colIdx) => (
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
                                <td className="ps-1">{user.email}</td>
                                <td className="ps-1">{user.mobile}</td>
                                <td className="ps-1">{user.userType}</td>
                                <td className="ps-1">
                                    {user.organisation.name}, {user.organisation.place}
                                </td>

                                <td className="flex items-center justify-center h-full ps-1">{user.participated ? (
                                    <GiCheckMark size={20} className="text-green-500" />
                                ) : (
                                    <CgClose size={20} className="text-red-500" />
                                )}</td>

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
export const MobileRegisteredUserCards = ({
    users,
    currentPage,
    setCurrentPage,
    rowsPerPage,
    sortBy,
    sortDirection,
    setSortBy,
    setSortDirection,
    isLoading,

}) => {
    const fields = [
        { label: "S.No.", value: 0 },
        { label: "Name", value: 1 },
        { label: "Email", value: 2 },
        { label: "Mobile", value: 3 },
        { label: "User Type", value: 4 },
        { label: "Organization", value: 5 },
    ];
   
    const handleSortChange = (e) => {
        const { name, value } = e.target;
        setCurrentPage(1)
        if (name === "sortBy") setSortBy(Number(value));
        if (name === "sortDirection") setSortDirection(value);
    };
    return (
        <div className="block space-y-4 sm:hidden font-Lexend_Regular">
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
            {isLoading ? (
                [...Array(3)].map((_, index) => (
                    <div
                        key={index}
                        className="p-4 space-y-2 bg-white rounded shadow animate-pulse"
                    >
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
                        <p><strong>Email:</strong> {user.email}</p>
                        <p><strong>Mobile:</strong> {user.mobile}</p>
                        <p><strong>UserType:</strong> {user.userType}</p>
                        <p>
                            <strong> Organisation:</strong> {user.organisation.name}, {user.organisation.place}
                        </p>
                        <p className="flex items-center space-x-2"><strong>Participated: </strong>{user.participated ? (
                            <GiCheckMark size={16} className="text-green-500" />
                        ) : (
                            <CgClose size={16} className="text-red-500" />
                        )}</p>

                    </div>
                ))
            ) : (
                <p className="text-center text-gray-500">No user found.</p>
            )}
        </div>
    )
};
