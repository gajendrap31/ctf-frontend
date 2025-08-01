import SortableHeader from "./SortableHeader";

export const TeamTableData = ({
    teams,
    currentPage,
    rowsPerPage,
    sortBy,
    sortDirection,
    setSortBy,
    setSortDirection,
    handleSort,
    handleMembersClick,
    selectedEventData,
    selectedEvent,
    isLoading
}) => {
    return (
        <div>
            {/* Desktop Table View */}
            <TeamTable
                teams={teams}
                currentPage={currentPage}
                rowsPerPage={rowsPerPage}
                sortBy={sortBy}
                sortDirection={sortDirection}
                handleSort={handleSort}
                handleMembersClick={handleMembersClick}
                selectedEventData={selectedEventData}
                selectedEvent={selectedEvent}
                isLoading={isLoading}
            />

            {/* Mobile Card View */}
            <MobileTeamCards
                teams={teams}
                sortBy={sortBy}
                sortDirection={sortDirection}
                setSortBy={setSortBy}
                setSortDirection={setSortDirection}
                selectedEventData={selectedEventData}
                selectedEvent={selectedEvent}
                handleMembersClick={handleMembersClick}
                isLoading={isLoading}
            />
        </div>
    );
};

export const TeamTable = ({
    teams,
    currentPage,
    rowsPerPage,
    sortBy,
    sortDirection,
    handleSort,
    handleMembersClick,
    selectedEventData,
    selectedEvent,
    isLoading
}) => {
    const columns = [
        { label: "S.No.", index: 0, sortable: true },
        { label: "Team Name", index: 1, sortable: true },
        { label: "Captain Name", index: 2, sortable: true },
        { label: "Captain Email", index: 3, sortable: true },
        { label: "Members", index: 4, sortable: false },
    ];

    // Skeleton row for loading state
    const renderSkeletonRow = (count = 5) => {
        return [...Array(count)].map((_, idx) => (
            <tr key={idx} className="border-b animate-pulse">
                {Array(5).fill(0).map((_, colIdx) => (
                    <td key={colIdx} className="px-3 py-2">
                        <div className="w-3/4 h-4 bg-gray-300 rounded"></div>
                    </td>
                ))}
            </tr>
        ));
    };
    return (
        <div className="hidden pt-4 overflow-x-auto sm:block">
            <table className="w-full bg-white rounded-lg font-Lexend_Regular">
                <thead>
                    <tr className="h-10 border-b-2 bg-slate-200">
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
                <tbody>
                    {!selectedEvent ? (
                        <tr>
                            <td colSpan="5" className="py-3 text-center text-gray-700">
                                Event has not been selected yet. Please select an event.
                            </td>
                        </tr>
                    ) : selectedEventData?.teamCreationAllowed ? (
                        isLoading ? (
                            renderSkeletonRow()
                        ) : teams?.content?.length > 0 ? (
                            teams?.content?.map((team, index) => (
                                <tr key={index} className="text-gray-700 border-b-2 h-9">
                                    <td className="ps-3">{(currentPage - 1) * rowsPerPage + index + 1}</td>
                                    <td className="ps-3">{team.name}</td>
                                    <td className="ps-3">{team.captain?.fullName}</td>
                                    <td className="ps-3">{team.captain?.email}</td>
                                    <td className="py-1 ps-3">
                                        <button
                                            onClick={() => handleMembersClick(team.members)}
                                            className="px-3 py-1 text-white rounded bg-slate-800"
                                        >
                                            View ({team.members?.length || 0})
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="py-3 text-center text-gray-700">
                                    No teams available.
                                </td>
                            </tr>
                        )
                    ) : (
                        <tr>
                            <td colSpan="5" className="py-3 text-center text-gray-700">
                                Team creation is <strong>not allowed</strong> for this event.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export const MobileTeamCards = ({
    teams,
    selectedEventData,
    selectedEvent,
    handleMembersClick,
    isLoading,
    sortBy,
    sortDirection,
    setSortBy,
    setSortDirection,
}) => {
    const fields = [
        { label: "S.No.", value: 0 },
        { label: "Team Name", value: 1 },
        { label: "Captain Name", value: 2 },
        { label: "Captain Email", value: 3 },
    ];

    const handleSortChange = (e) => {
        const { name, value } = e.target;
        if (name === "sortBy") setSortBy(Number(value));
        if (name === "sortDirection") setSortDirection(value);
    };
    return (
        <div className="block pt-4 space-y-4 text-gray-700 sm:hidden font-Lexend_Regular">
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
            {!selectedEvent ? (
                <p className="p-2 text-center text-gray-500 bg-white border rounded shadow font-Lexend_Regular">No event selected yet. Please select an event.</p>
            ) : !selectedEventData?.teamCreationAllowed ? (
                <p className="p-4 text-center bg-white rounded shadow ">Team creation is not allowed for this event.</p>
            ) : isLoading ? (
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
            ) : teams.totalElements === 0 ? (
                <p className="p-4 text-center bg-white rounded shadow ">No teams available.</p>
            ) : (
                teams?.content?.map((team, index) => (
                    <div key={index} className="p-4 bg-white rounded shadow">
                        <p className="mb-1 text-lg font-bold">
                            #{index + 1} - {team.name}
                        </p>
                        <p><strong>Captain:</strong> {team.captain?.fullName}</p>
                        <p><strong>Email:</strong> {team.captain?.email}</p>
                        <button
                            onClick={() => handleMembersClick(team.members)}
                            className="px-3 py-1 mt-3 text-white rounded bg-slate-800"
                        >
                            View Members ({team.members?.length || 0})
                        </button>
                    </div>
                ))
            )}
        </div>
    );
};
