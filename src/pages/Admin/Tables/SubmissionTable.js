
import { Tooltip } from "react-tooltip";
import SortableHeader from "./SortableHeader";
const SubmissionTable = ({
    selectedEvent,
    selectedEventData,
    submissionData,
    currentPage,
    rowsPerPage,
    setCurrentPage,
    sortBy,
    sortDirection,
    setSortBy,
    setSortDirection,
    handleSort,
    formatSubmissionDate,
    isLoading,
}) => {
    const columns = [
        { label: "S.No.", index: 0, sortable: true },
        { label: selectedEventData?.teamCreationAllowed ? "Team Name" : "Email", index: 1, sortable: true },
        { label: "Challenge Name", index: 2, sortable: true },
        { label: "Challenge Description", index: 3, sortable: true },
        { label: selectedEventData?.teamCreationAllowed ? "Team Solution" : "User Solution", index: 4, sortable: true },
        { label: "Submission Time", index: 5, sortable: true },
        { label: "Attempt", index: 6, sortable: true },
        { label: "Status", index: 7, sortable: true },
        { label: "Score", index: 8, sortable: true },
    ];

     const fields = [
        { label: "S.No.", value: 0 },
        { label: selectedEventData?.teamCreationAllowed ? "Team Name" : "Email", value: 1 },
        { label:"Challenge Name", value: 2 },
        { label: "Challenge Description", value: 3 },
        { label: selectedEventData?.teamCreationAllowed ? "Team Solution" : "User Solution", value: 4 },
        { label: "Submission Time", value: 5},
        { label: "Attempt", value: 6 },
        { label: "Status", value: 7},
        { label: "Score",value: 8},
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
        <>
            {/* Desktop Table */}
            <div className="hidden pt-4 overflow-x-auto sm:block">
                <table className="w-full bg-white rounded-lg font-Lexend_Regular">
                    <thead>
                        <tr className="h-10 border-b-2 bg-slate-200">
                            {columns.map((col, i) => {
                                const isFirst = i === 0;
                                const isLast = i === columns.length - 1;
                                const thClasses = `ps-1 ${isFirst ? 'rounded-tl-md' : ''} ${isLast ? 'rounded-tr-md' : ''}`;

                                return (
                                    <SortableHeader
                                        key={col.index}
                                        label={col.label}
                                        index={col.index}
                                        sortBy={sortBy}
                                        sortDirection={sortDirection}
                                        onSort={handleSort}
                                        className={thClasses}
                                    />
                                );
                            })}
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            renderSkeletonRow()
                        ) : selectedEvent ? (
                            submissionData?.content?.length > 0 ? (
                                submissionData.content.map((submission, index) => (
                                    <tr key={index} className="text-gray-700 border-b-2 h-9">
                                        <td className="ps-3">
                                            {(currentPage - 1) * rowsPerPage + index + 1}
                                        </td>
                                        <td className="ps-3">
                                            {selectedEventData?.teamCreationAllowed
                                                ? submission.team?.name
                                                : submission.user?.email}
                                        </td>
                                        <td className="ps-3">{submission.challenge.name}</td>
                                        
                                        <td className="ps-3">
                                            <span
                                                data-tooltip-id={`challenge-tooltip-${index}`}
                                                className="cursor-pointer"
                                            >
                                                {submission.challenge.questionDescription}
                                            </span>
                                            <Tooltip
                                                id={`challenge-tooltip-${index}`}
                                                place="top"
                                                effect="solid"
                                                render={() => (
                                                    <div className="text-center">
                                                        <p className="text-green-300 font-Lexend_SemiBold">Flags</p>
                                                        <div className="flex flex-wrap gap-1">
                                                            {submission.challenge.flags?.map((flag, i) => (
                                                                <span key={flag.id}>{flag.flag}{i < submission.challenge.flags.length - 1 && ','}</span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            />
                                        </td>
                                        <td className="ps-3">{submission.solution}</td>
                                        <td className="ps-3">
                                            {formatSubmissionDate(submission.submissionDateTime)}
                                        </td>
                                        <td className="ps-3">
                                            {submission.attempt}/{selectedEventData.maxAttempt}
                                        </td>
                                        <td className="ps-3">
                                            {submission.status ? (
                                                <span className="text-green-500">Correct</span>
                                            ) : (
                                                <span className="text-red-500">Incorrect</span>
                                            )}
                                        </td>
                                        <td className="ps-3">{submission.score}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="9" className="py-4 text-center text-gray-500">
                                        No submission available.
                                    </td>
                                </tr>
                            )
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

            {/* Mobile View */}
            <div className="pt-4 space-y-4 sm:hidden font-Lexend_Regular">
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
                ) : selectedEvent ? (
                    submissionData?.content?.length > 0 ? (
                        submissionData.content.map((submission, index) => (
                            <div
                                key={index}
                                className="p-4 space-y-1 text-gray-700 bg-white border rounded shadow font-Lexend_Regular"
                            >
                                <p className="text-sm font-Lexend_SemiBold ">
                                    #{(currentPage - 1) * rowsPerPage + index + 1} —{" "}
                                    {selectedEventData?.teamCreationAllowed
                                        ? submission.team?.name
                                        : submission.user?.email}
                                </p>
                                <p className="">
                                    <strong>Challenge Name:</strong> {submission.challenge.name}
                                </p>
                                <p className="">
                                    <strong>Challenge Description:</strong>{" "}
                                    {submission.challenge.questionDescription}
                                </p>
                                <p className="">
                                    <strong>User Solution:</strong> {submission.solution}
                                </p>
                                <p className="">
                                    <strong>Submission:</strong>{" "}
                                    {formatSubmissionDate(submission.submissionDateTime)}
                                </p>
                                <p className="">
                                    <strong>Attempt:</strong> {submission.attempt}/
                                    {selectedEventData.maxAttempt}
                                </p>
                                <p className="">
                                    <strong>Status:</strong>{" "}
                                    {submission.status ? (
                                        <span className="text-green-500">Correct</span>
                                    ) : (
                                        <span className="text-red-500">Incorrect</span>
                                    )}
                                </p>
                                <p className="">
                                    <strong>Score:</strong> {submission.score}
                                </p>
                            </div>
                        ))
                    ) : (
                        <p className="p-2 text-center text-gray-500 bg-white border rounded shadow font-Lexend_Regular">
                            No submission available.
                        </p>
                    )
                ) : (
                    <p className="p-2 text-center text-gray-500 bg-white border rounded shadow font-Lexend_Regular">No event selected yet. Please select an event.</p>
                )}
            </div>
        </>
    );
};

export default SubmissionTable;
