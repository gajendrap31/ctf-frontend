import SortableHeader from "./SortableHeader";


export const RegisteredUsersTableData = ({
    users,
    selectedEvent,
    sortBy,
    sortDirection,
    setSortBy,
    setSortDirection,
    setCurrentPage,
    handleSort,
    isLoading
}) => {
    return (
        <div>
            {/* Desktop Table View */}
            <RegisteredUsersTable
                users={users}
                selectedEvent={selectedEvent}
                sortBy={sortBy}
                sortDirection={sortDirection}
                handleSort={handleSort}
                isLoading={isLoading}
            />

            <MobileRegisteredUsers
                users={users}
                selectedEvent={selectedEvent}
                sortBy={sortBy}
                sortDirection={sortDirection}
                setSortBy={setSortBy}
                setSortDirection={setSortDirection}
                setCurrentPage={setCurrentPage}
                isLoading={isLoading}
            />
        </div>
    );
};
export const RegisteredUsersTable = ({
    users,
    selectedEvent,
    sortBy,
    sortDirection,
    handleSort,
    isLoading
}) => {

    const columns = [
        { label: "S.No.", index: 0, sortable: true },
        { label: "Name", index: 1, sortable: true },
        { label: "Username", index: 2, sortable: true },
        { label: "Email", index: 3, sortable: true },
        { label: "Mobile", index: 4, sortable: true },
        { label: "User Type", index: 5, sortable: true },
        { label: "Organisation", index: 6, sortable: true },
        { label: "Level", index: 7, sortable: true },
        { label: "Level Info", index: 8, sortable: true },
        { label: "Active", index: 9, sortable: true },
    ];

    // Skeleton row for loading state
    const renderSkeletonRow = (count = 5) => {
        return [...Array(count)].map((_, idx) => (
            <tr key={idx} className="border-b animate-pulse">
                {Array(10).fill(0).map((_, colIdx) => (
                    <td key={colIdx} className="px-3 py-2">
                        <div className="w-3/4 h-4 bg-gray-300 rounded"></div>
                    </td>
                ))}
            </tr>
        ));
    };
    return (
        <div className="hidden pt-4 overflow-x-auto sm:block">
            <table className="w-full bg-white rounded-lg font-Lexend_Regular ">
                <thead>
                    <tr className="h-10 border-b-2 bg-slate-200 ">

                        {columns.map((col, i) => {
                            const thClasses = `${i === 0 ? 'rounded-tl-md' : ''} ${i === columns.length - 1 ? 'rounded-tr-md' : ''}`;
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
                                <th key={col.index} className={`text-start ps-3 ${thClasses}`}>
                                    {col.label}
                                </th>
                            );
                        })}
                    </tr>
                </thead>
                <tbody className="text-gray-700">
                    {selectedEvent ? (
                        isLoading ? (
                            renderSkeletonRow()
                        ) : users?.content?.length > 0 ? (
                            users.content.map((user, index) => (
                                <tr key={index} className="h-10 border-b">
                                    <td className="ps-2">{index + 1}</td>
                                    <td className="ps-2">{user.fullName}</td>
                                    <td className="ps-2">{user.username}</td>
                                    <td className="ps-2">{user.email}</td>
                                    <td className="ps-2">{user.mobile}</td>
                                    <td className="ps-2">{user.userType}</td>
                                    <td className="ps-2">{user.organisation.name}, {user.organisation.place}</td>
                                    <td className="ps-2">{user.level}</td>
                                    <td className="ps-2">{user.levelInfo}</td>
                                    <td className="ps-2">{user.active ? "Yes" : "No"}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="10" className="py-2 text-center text-gray-500">
                                    No users registered for this event.
                                </td>
                            </tr>
                        )
                    ) : (
                        <tr>
                            <td colSpan="10" className="py-3 text-center text-gray-700">
                                Event has not been selected yet. Please select an event.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export const MobileRegisteredUsers = ({
    users,
    selectedEvent,
    setCurrentPage,
    sortBy,
    sortDirection,
    setSortBy,
    setSortDirection,
    isLoading }) => {

    const fields = [
        { label: "S.No.", value: 0 },
        { label: "Name", value: 1},
        { label: "Username", value: 2 },
        { label: "Email", value: 3 },
        { label: "Mobile",value: 4 },
        { label: "User Type", value: 5},
        { label: "Organisation",value: 6 },
        { label: "Level", value: 7},
        { label: "Level Info", value: 8 },
        { label: "Active", value: 9},
    ];
    

    const handleSortChange = (e) => {
        const { name, value } = e.target;
        setCurrentPage(1)
        if (name === "sortBy") setSortBy(Number(value));
        if (name === "sortDirection") setSortDirection(value);
    };

    if (!selectedEvent) {
        return <p className="p-2 mt-4 text-center text-gray-500 bg-white border rounded shadow sm:hidden font-Lexend_Regular">No event selected. Please select an event.</p>;
    }

    if (!users?.content?.length) {
        return <p className="p-2 mt-4 text-center text-gray-500 bg-white border rounded shadow sm:hidden font-Lexend_Regular">No users registered for this event.</p>;
    }

    return (
        <div className="pt-4 space-y-4 sm:hidden">
            {selectedEvent && <div className="font-Lexend_Regular">
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
            </div>}
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
            ) : users.content.map((user, index) => (
                <div key={index} className="p-4 bg-white border rounded-lg shadow">
                    <p className="mb-1 text-lg font-bold">#{index + 1} - {user.fullName}</p>
                    <p><strong>Username:</strong> {user.username}</p>
                    <p><strong>Email:</strong> {user.email}</p>
                    <p><strong>Mobile:</strong> {user.mobile}</p>
                    <p><strong>User Type:</strong> {user.userType}</p>
                    <p><strong>Organisation:</strong> {user.organisation.name}, {user.organisation.place}</p>
                    <p><strong>{user.level ||"Level"}:</strong> {user.levelInfo || "N/A"}</p>
                    <p><strong>Active:</strong> {user.active ? "Yes" : "No"}</p>
                </div>
            ))}
        </div>
    );
};
