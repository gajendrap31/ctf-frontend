import { MdArrowDropUp, MdArrowDropDown } from 'react-icons/md';
import { Tooltip } from 'react-tooltip';
import SortableHeader from './SortableHeader';
const MarkForReviewTable = ({
    selectedEventData,
    selectedEvent,
    reviewData,
    handleSort,
    sortBy,
    sortDirection,
    setSortBy,
    setSortDirection,
    currentPage,
    setCurrentPage,
    rowsPerPage,
    handleReviewStatus,
    formatSubmissionDate,
    isLoading
}) => {
    const headers = [
        { label: "S.No.", index: 0, sortable: true },
        { label: selectedEventData?.teamCreationAllowed ? "Team Name" : "Email", index: 1, sortable: true },
        { label: "Challenge Description", index: 2, sortable: true },
        { label: "Flag", index: 5, sortable: false },
        { label: selectedEventData?.teamCreationAllowed ? "Team Solution" : "User Solution", index: 3, sortable: true },
        { label: "Submission Time", index: 4, sortable: true },
        { label: "Action", index: 6, sortable: false },
    ];

     const fields = [
        { label: "S.No.", value: 0 },
        { label: selectedEventData?.teamCreationAllowed ? "Team Name" : "Email", value: 1 },
        { label: "Challenge Description", value: 2 },
        { label: selectedEventData?.teamCreationAllowed ? "Team Solution" : "User Solution", value: 3 },
        { label: "Submission Time", value: 4 },
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
                {Array(7).fill(0).map((_, colIdx) => (
                    <td key={colIdx} className="px-3 py-2">
                        <div className="w-3/4 h-4 bg-gray-300 rounded"></div>
                    </td>
                ))}
            </tr>
        ));
    };
    return (
        <div className="mt-4 overflow-x-auto">
            <div className="hidden sm:block ">
                <table className="w-full bg-white rounded-lg font-Lexend_Regular">
                    <thead>
                        <tr className="h-10 border-b-2 bg-slate-200">
                            {headers.map((col, i) => {
                                const isFirst = i === 0;
                                const isLast = i === headers.length - 1;
                                const thClass = `ps-3 ${isFirst ? 'rounded-tl-md' : ''} ${isLast ? 'rounded-tr-md' : ''}`;

                                return col.sortable ? (
                                    <SortableHeader
                                        key={i}
                                        label={col.label}
                                        index={col.index}
                                        sortBy={sortBy}
                                        sortDirection={sortDirection}
                                        onSort={handleSort}
                                        className={thClass}
                                    />
                                ) : (
                                    <th key={i} className={thClass}>{col.label}</th>
                                );
                            })}
                        </tr>
                    </thead>
                    <tbody>
                        {selectedEvent ? (isLoading ? (
                            renderSkeletonRow()
                        ) : reviewData.content?.length > 0 ? (
                            reviewData.content.map((review, index) => (
                                <tr key={index} className="p-1 text-gray-700 border-b-2 h-9">
                                    <td className="ps-3">{(currentPage - 1) * rowsPerPage + index + 1}</td>
                                    <td className="ps-3">
                                        <span data-tooltip-id={`participant-tooltip-${index}`} className={review.user ? 'cursor-pointer' : 'cursor-default'}>
                                            {review.team?.name || review.user?.email}
                                        </span>
                                        <Tooltip
                                            id={`participant-tooltip-${index}`}
                                            place="top"
                                            effect="solid"
                                            render={() => (
                                                <div className="text-center">
                                                    <p className="text-green-300 font-Lexend_SemiBold">Name</p>
                                                    {review.user?.fullName}
                                                </div>
                                            )}
                                        />
                                    </td>
                                    <td className="ps-3">
                                        <span
                                            data-tooltip-id={`challenge-tooltip-${index}`}
                                            className="cursor-pointer"
                                        >
                                            {review.challenge.questionDescription}
                                        </span>
                                        <Tooltip
                                            id={`challenge-tooltip-${index}`}
                                            place="top"
                                            effect="solid"
                                            render={() => (
                                                <div className="text-center">
                                                    <p className="text-green-300 font-Lexend_SemiBold">Challenge Name</p>
                                                    {review.challenge.name}
                                                </div>
                                            )}
                                        />
                                    </td>
                                    <td className="ps-3">
                                        <div className="flex flex-wrap gap-1">
                                            {review.challenge.flags?.map((flag, idx) => (
                                                <span key={flag.id} id={flag.id}>
                                                    {flag.flag}
                                                    {idx < review.challenge.flags.length - 1 && ', '}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="ps-3">{review.solution}</td>
                                    <td className="ps-3">{formatSubmissionDate(review.submissionDateTime)}</td>
                                    <td className="flex flex-col px-2 py-2 space-x-0 space-y-2 text-gray-500 2xl:flex-row 2xl:space-y-0 2xl:space-x-2">
                                        <button
                                            className="px-2 py-1 text-white rounded bg-slate-800"
                                            onClick={() => handleReviewStatus(selectedEvent, review.id, true)}
                                        >
                                            Correct
                                        </button>
                                        <button
                                            className="px-2 py-1 text-white rounded bg-slate-800"
                                            onClick={() => handleReviewStatus(selectedEvent, review.id, false)}
                                        >
                                            Incorrect
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" className="py-1 text-center text-gray-500 border-b-2">No review available.</td>
                            </tr>
                        )
                        ) : (
                            <tr>
                                <td colSpan="7" className="py-3 text-center text-gray-700">
                                    Event has not been selected yet. Please select an event.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Mobile Cards */}
             <div className="block space-y-4 sm:hidden">
                {selectedEvent &&<div className="font-Lexend_Regular">
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
                {selectedEvent ? (isLoading ? (
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
                ) : reviewData.content?.length > 0 ? (
                    reviewData.content.map((review, index) => (
                        <div key={index} className="flex flex-col p-4 bg-white border rounded shadow font-Lexend_Regular ">
                            <p><strong>S.No:</strong> {(currentPage - 1) * rowsPerPage + index + 1}</p>
                            <p>
                                <strong>{selectedEventData?.teamCreationAllowed ? "Team Name" : "Email"}: </strong>
                                {review.team?.name || review.user?.email}
                            </p>
                            <p><strong>Challenge Description:</strong> {review.challenge.questionDescription}</p>
                            <p><strong>Flag:</strong> {review.challenge.flags?.map(f => f.flag).join(", ")}</p>
                            <p><strong>User Solution:</strong> {review.solution}</p>
                            <p><strong>Submission Time:</strong> {formatSubmissionDate(review.submissionDateTime)}</p>
                            <div className="flex gap-2 mt-2">
                                <button
                                    className="px-3 py-1 text-white rounded bg-slate-800"
                                    onClick={() => handleReviewStatus(selectedEvent, review.id, true)}
                                >
                                    Correct
                                </button>
                                <button
                                    className="px-3 py-1 text-white rounded bg-slate-800"
                                    onClick={() => handleReviewStatus(selectedEvent, review.id, false)}
                                >
                                    Incorrect
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="p-2 text-center text-gray-500 bg-white border rounded shadow font-Lexend_Regular">No review available.</p>
                )
                ) : (
                    <p className="p-2 text-center text-gray-500 bg-white border rounded shadow font-Lexend_Regular">No event selected yet. Please select an event.</p>
                )}
            </div>
        </div>
    );
};


export default MarkForReviewTable;
