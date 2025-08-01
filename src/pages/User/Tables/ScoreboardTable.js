// ScoreBoardTable.js
import SortableHeader from "./SortableHeader";

export default function ScoreBoardTableData({
    selectedEventData,
    scoreData,
    currentPage,
    setCurrentPage,
    rowsPerPage,
    sortBy,
    setSortBy,
    sortDirection,
    setSortDirection,
    handleSort,
    isLoading,
}) {
    return (
        <div>
            {/* Desktop Table View */}
            <ScoreBoardTable
                selectedEventData={selectedEventData}
                scoreData={scoreData}
                currentPage={currentPage}
                rowsPerPage={rowsPerPage}
                sortBy={sortBy}
                sortDirection={sortDirection}
                handleSort={handleSort}
                isLoading={isLoading}
            />
            <ScoreboardMobileCards
                selectedEventData={selectedEventData}
                scoreData={scoreData}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                rowsPerPage={rowsPerPage}
                sortBy={sortBy}
                setSortBy={setSortBy}
                sortDirection={sortDirection}
                setSortDirection={setSortDirection}
                handleSort={handleSort}
                isLoading={isLoading}
            />
        </div>
    );
};

export const ScoreBoardTable = ({
    selectedEventData,
    scoreData,
    currentPage,
    rowsPerPage,
    sortBy,
    sortDirection,
    handleSort,
    isLoading,
}) => {
    const columns = [
        { label: "S.No.", index: 0 },
        { label: selectedEventData?.teamCreationAllowed ? "Team Name" : "Name", index: 1 },
        { label: selectedEventData?.teamCreationAllowed ? "Captain Email" : "Email", index: 2 },
        { label: "Score", index: 3 },
        { label: "Rank", index: 4 },
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
        <div className="hidden pt-2 overflow-x-auto sm:block">
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
                    {selectedEventData.id ? (
                        isLoading ? (
                            renderSkeletonRow()
                        ) : scoreData?.content?.length > 0 ? (
                            scoreData.content.map((score, index) => (
                                <tr key={score.id || index} className="text-gray-700 border-b-2 h-9">
                                    <td className="py-2 ps-3">{(currentPage - 1) * rowsPerPage + index + 1}</td>
                                    <td className="py-2 ps-3">{score.team?.name || score.user?.fullName || "Unknown"}</td>
                                    <td className="py-2 ps-3">{score.team?.captain?.email || score.user?.email || "N/A"}</td>
                                    <td className="py-2 ps-3">{score.score ?? "N/A"}</td>
                                    <td className="py-2 ps-3">{score.rank ?? "N/A"}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="py-3 text-center text-gray-700">No score available.</td>
                            </tr>
                        )
                    ) : (
                        <tr>
                            <td colSpan="5" className="py-3 text-center text-gray-700 ">
                                Event has not been selected yet. Please select an event.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

// ScoreboardMobileCards.js
export const ScoreboardMobileCards = ({
    selectedEventData,
    scoreData,
    currentPage,
    setCurrentPage,
    sortBy,
    setSortBy,
    sortDirection,
    setSortDirection,
    rowsPerPage,
    isLoading,
}) => {
     const fields = [
        { label: "S.No.", value: 0 },
        { label: selectedEventData?.teamCreationAllowed ? "Team Name" : "Name", value: 1},
        { label: selectedEventData?.teamCreationAllowed ? "Captain Email" : "Email", value: 2 },
        { label: "Score", value: 3 },
        { label: "Rank",value: 4 },
       
    ];
    
      

    const handleSortChange = (e) => {
        const { name, value } = e.target;
        setCurrentPage(1)
        if (name === "sortBy") setSortBy(Number(value));
        if (name === "sortDirection") setSortDirection(value);
    };
    return (
        <div className="block mt-4 space-y-4 sm:hidden font-Lexend_Regular ">
             {selectedEventData?.id && <div className="font-Lexend_Regular">
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
            {selectedEventData?.id ? (
                isLoading ? (
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
                ) : scoreData?.content?.length > 0 ? (
                    scoreData.content.map((score, index) => (
                        <div key={score.id || index} className="flex flex-col p-4 bg-white border rounded shadow">
                            <p className="font-Lexend_SemiBold ">
                                {(currentPage - 1) * rowsPerPage + index + 1}. {selectedEventData?.teamCreationAllowed ? score.team?.name : score.user?.fullName || "Unknown"}
                            </p>
                            <p className="">
                                {selectedEventData?.teamCreationAllowed ? (
                                    <>
                                        <strong>Captain Email:</strong> {score.team?.captain?.email || "N/A"}
                                    </>
                                ) : (
                                    <>
                                        <strong>Email:</strong> {score.user?.email || "N/A"}
                                    </>
                                )}
                            </p>

                            <p className=""><strong>Score:</strong> {score.score ?? "N/A"}</p>
                            <p className=""><strong>Rank:</strong> {score.rank ?? "N/A"}</p>

                        </div>
                    ))
                ) : (
                    <p className="py-2 text-center text-gray-500 bg-white border rounded-lg">No score available.</p>
                )
            ) : (
                <p className="py-2 text-center text-gray-500 bg-white border rounded-lg">No event selected yet. Please select an event.</p>
            )}
        </div>
    );
};

