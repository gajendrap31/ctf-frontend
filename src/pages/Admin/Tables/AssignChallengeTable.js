import SortableHeader from "./SortableHeader";

export default function AssignChallengesTable({
    selectedEventData,
    unAssignedChallenges,
    selectedChallenge,
    handleCheckboxChange,
    handleSelectAllChange,
    isAllSelected,
    currentPage,
    setCurrentPage,
    rowsPerPage,
    sortBy,
    sortDirection,
    setSortBy,
    setSortDirection,
    handleSort,
    isLoading
}) {

    const columns = [
        { label: "S.No.", index: 0, sortable: true },
        { label: "Category Name", index: 1, sortable: true },
        { label: "Difficulty", index: 2, sortable: true },
        { label: "Challenge Name", index: 3, sortable: true },
        { label: "Question Description", index: 4, sortable: true },
        { label: "Flag", index: 5, sortable: true },
        { label: "Hint", index: 6, sortable: true },
        { label: "Max Marks", index: 7, sortable: true },

    ];

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
        <div>
            <div className="hidden pt-4 overflow-x-auto sm:block">
                <table className="w-full bg-white rounded-lg table-auto font-Lexend_Regular">
                    <thead>
                        <tr className="h-10 border-b-2 bg-slate-200">
                            <th className="rounded-tl-lg text-start ps-1">
                                <input
                                    type="checkbox"
                                    checked={isAllSelected}
                                    onChange={(e) => handleSelectAllChange(e.target.checked)}
                                    title="Select all"
                                />
                            </th>
                            {columns.map((col, i) => {
                                const thClasses = ` ${i === columns.length - 1 ? 'rounded-tr-md' : ''}`;
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
                    <tbody className="rounded-b-lg">
                        {selectedEventData?.id ? isLoading ? (
                            renderSkeletonRow()
                        ) : unAssignedChallenges.content?.length > 0 ? (
                            unAssignedChallenges.content.map((challenge, index) => (
                                <tr key={index} className={`border-b-2 h-9 ps-2`}>
                                    <td className="ps-1">
                                        <input
                                            type="checkbox"
                                            value={selectedChallenge}
                                            checked={selectedChallenge.includes(challenge.id)}
                                            onChange={(e) => handleCheckboxChange(challenge.id, e.target.checked)}
                                        />
                                    </td>
                                    <td className="ps-1">{(currentPage - 1) * rowsPerPage + index + 1}</td>
                                    <td className="ps-1">{challenge.challengeCategory?.name}</td>
                                    <td className="ps-1">{challenge.difficulty}</td>
                                    <td className="ps-1">{challenge.name}</td>
                                    <td className="ps-1">{challenge.questionDescription}</td>
                                    <td className="ps-1">
                                        <div className="flex flex-wrap gap-1">
                                            {challenge.flags?.map((flag, index) => (
                                                <span key={flag.id}>{flag.flag}{index < challenge.flags.length - 1 && ", "}</span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="text-center ps-1">{challenge.hint || 'N/A'}</td>
                                    <td className="text-center ps-1">{challenge.maxMarks}</td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="9" className="text-center text-gray-500 ps-1">No challenges available.</td></tr>
                        ) : (
                            <tr><td colSpan="9" className="text-center text-gray-500 ps-1">No event selected yet. Please select an event.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Mobile View */}
            <div className="grid grid-cols-1 gap-4 pt-4 md:hidden">
                {selectedEventData && <div className="font-Lexend_Regular">
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
                {selectedEventData ? isLoading ? (
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

                        </div>
                    ))
                ) : unAssignedChallenges.content?.length > 0 ? (
                    unAssignedChallenges.content.map((challenge, index) => (
                        <div key={index} className="p-3 text-gray-700 bg-white border rounded-lg shadow font-Lexend_Regular">
                            <div className="flex items-center mb-2">
                                <input
                                    type="checkbox"
                                    checked={selectedChallenge.includes(challenge.id)}
                                    onChange={(e) => handleCheckboxChange(challenge.id, e.target.checked)}
                                    className="me-2"
                                />
                                <p className="text-sm font-semibold">{(currentPage - 1) * rowsPerPage + index + 1}. {challenge.name}</p>
                            </div>
                             <p className=""><span className="font-Lexend_SemiBold">Question Description:</span> {challenge.questionDescription}</p>
                            <p className=""><span className="font-Lexend_SemiBold">Category Name:</span> {challenge.challengeCategory?.name}</p>
                            <p className=""><span className="font-Lexend_SemiBold">Difficulty:</span> {challenge.difficulty}</p>
                            <p className=""><span className="font-Lexend_SemiBold">Flag:</span> {challenge.flags?.map(f => f.flag).join(", ")}</p>
                            <p className=""><span className="font-Lexend_SemiBold">Hint:</span> {challenge.hint || 'N/A'}</p>
                            <p className=""><span className="font-Lexend_SemiBold">Max Marks:</span> {challenge.maxMarks}</p>
                        </div>
                    ))
                ) : (
                    <p className="text-center text-gray-500">No challenges available.</p>
                ) : (
                    <p className="text-center text-gray-500">No event selected yet. Please select an event.</p>
                )}
            </div>
        </div >

    );
}