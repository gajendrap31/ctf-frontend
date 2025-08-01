import SortableHeader from "./SortableHeader";


export default function AssignedChallengeTable({
    assignedChallenges,
    sortBy,
    sortDirection,
    setSortBy,
    setSortDirection,
    onSort,
    currentPage,
    setCurrentPage,
    rowsPerPage,
    onRemove,
    selectedEvent,
    isLoading
}) {

    return (
        <>
            <DesktopAssignedChallengeTable
                assignedChallenges={assignedChallenges}
                sortBy={sortBy}
                sortDirection={sortDirection}
                onSort={onSort}
                currentPage={currentPage}
                rowsPerPage={rowsPerPage}
                onRemove={onRemove}
                selectedEvent={selectedEvent}
                isLoading={isLoading}
            />
            <MobileAssignedChallengeCards
                assignedChallenges={assignedChallenges}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                rowsPerPage={rowsPerPage}
                onRemove={onRemove}
                selectedEvent={selectedEvent}
                sortBy={sortBy}
                sortDirection={sortDirection}
                setSortBy={setSortBy}
                setSortDirection={setSortDirection}
                isLoading={isLoading}
            />
        </>
    );
}

export function DesktopAssignedChallengeTable({
    assignedChallenges,
    sortBy,
    sortDirection,
    onSort,
    currentPage,
    rowsPerPage,
    onRemove,
    selectedEvent,
    isLoading
}) {

    const columns = [
        { label: "S.No.", index: 0, sortable: true },
        { label: "Category Name", index: 1, sortable: true },
        { label: "Difficulty", index: 2, sortable: true },
        { label: "Challenge Name", index: 3, sortable: true },
        { label: "Question Description", index: 4, sortable: true },
        { label: "Flag", index: 7, sortable: false },
        { label: "Hint", index: 5, sortable: true },
        { label: "Max Marks", index: 6, sortable: true },
        { label: "Action", index: 8, sortable: false },
    ];

    // Skeleton row for loading state
    const renderSkeletonRow = (count = 5) => {
        return [...Array(count)].map((_, idx) => (
            <tr key={idx} className="border-b animate-pulse">
                {Array(9).fill(0).map((_, colIdx) => (
                    <td key={colIdx} className="px-3 py-2">
                        <div className="w-3/4 h-4 bg-gray-300 rounded"></div>
                    </td>
                ))}
            </tr>
        ));
    };
    return (
        <div className="hidden w-full overflow-x-auto sm:block">
            <table className="w-full bg-white rounded-lg table-auto font-Lexend_Regular">
                <thead>
                    <tr className="w-full h-10 border-b-2 bg-slate-200">
                        {columns.map((col, i) => {
                            const thClasses = `${i === 0 ? 'rounded-tl-md' : ''} ${i === columns.length - 1 ? 'rounded-tr-md' : ''}`;
                            return col.sortable ? (
                                <SortableHeader
                                    key={col.index}
                                    label={col.label}
                                    index={col.index}
                                    sortBy={sortBy}
                                    sortDirection={sortDirection}
                                    onSort={onSort}
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
                    {selectedEvent ? isLoading ? (
                        renderSkeletonRow()
                    ) : assignedChallenges?.content?.length > 0 ? (
                        assignedChallenges?.content?.map((challenge, index) => (
                            <tr key={index} className="border-b-2 h-9 ps-2">
                                <td className="ps-2">{(currentPage - 1) * rowsPerPage + index + 1}</td>
                                <td>{challenge.challengeCategory?.name}</td>
                                <td>{challenge.difficulty}</td>
                                <td>{challenge.name}</td>
                                <td>{challenge.questionDescription}</td>
                                <td>
                                    <div className="flex flex-wrap gap-1">
                                        {challenge.flags?.map((flag, i) => (
                                            <span key={flag.id}>{flag.flag}{i < challenge.flags.length - 1 && ','}</span>
                                        ))}
                                    </div>
                                </td>
                                <td className="text-center">{challenge.hint || 'N/A'}</td>
                                <td className="text-center">{challenge.maxMarks}</td>
                                <td>
                                    <button
                                        className="px-2 py-1 text-white bg-red-800 rounded"
                                        onClick={() => onRemove(challenge.id, challenge.name, selectedEvent)}
                                    >
                                        Remove
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={9} className="py-3 text-center text-gray-700">No challenges assigned</td>
                        </tr>
                    ) : (
                        <tr>
                            <td colSpan="9" className="py-3 text-center text-gray-700">
                                Event has not been selected yet. Please select an event.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

export function MobileAssignedChallengeCards({
    assignedChallenges,
    currentPage,
    setCurrentPage,
    rowsPerPage,
    sortBy,
    sortDirection,
    setSortBy,
    setSortDirection,
    onRemove,
    selectedEvent,
    isLoading
}) {


    const fields = [
        { label: "S.No.", value: 0 },
        { label: "Challenge Name", value: 3 },
        { label: "Question Description", value: 4 },
        { label: "Category Name", value: 1 },
        { label: "Difficulty", value: 2 },
        { label: "Hint", value: 5 },
        { label: "Max Marks", value: 6 },

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
    if (!assignedChallenges?.content?.length) {
        return <p className="py-4 text-center text-gray-500 bg-white rounded sm:hidden font-Lexend_Regular">No challenges assigned to the selected event.</p>;
    }

    return (
        <div className="flex flex-col gap-4 sm:hidden">
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
            ) : assignedChallenges?.content.map((challenge, index) => (
                <div key={index} className="p-4 space-y-2 text-gray-700 bg-white border rounded-lg shadow font-Lexend_Regular">
                    <p className="font-semibold">#{(currentPage - 1) * rowsPerPage + index + 1} - {challenge.name}</p>
                    <p><strong className="font-Lexend_SemiBold">Question Description:</strong> {challenge.questionDescription}</p>
                    <p><strong className="font-Lexend_SemiBold">Category Name:</strong> {challenge.challengeCategory?.name}</p>
                    <p><strong className="font-Lexend_SemiBold">Difficulty:</strong> {challenge.difficulty}</p>

                    <p><strong className="font-Lexend_SemiBold">Hint:</strong> {challenge.hint || 'N/A'}</p>
                    <p><strong className="font-Lexend_SemiBold">Max Marks:</strong> {challenge.maxMarks}</p>
                    <p><strong className="font-Lexend_SemiBold">Flags:</strong> {challenge.flags?.map(f => f.flag).join(', ')}</p>
                    <button
                        className="px-4 py-2 text-white bg-red-800 rounded font-Lexend_SemiBold"
                        onClick={() => onRemove(challenge.id, challenge.name, selectedEvent)}
                    >
                        Remove
                    </button>
                </div>
            ))}
        </div>
    );
}
