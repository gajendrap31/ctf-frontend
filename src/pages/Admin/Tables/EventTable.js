import { MdArrowDropUp, MdArrowDropDown } from "react-icons/md";
import { BsPencil } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import SortableHeader from "./SortableHeader";

export default function EventTableData({
    events,
    eventImages,
    sortBy,
    sortDirection,
    setSortBy,
    setSortDirection,
    handleSort,
    currentPage,
    setCurrentPage,
    rowsPerPage,
    formatEventDate,
    isPast,
    isUpcoming,
    handleImageClick,
    onUpdate,
    onDelete,
    onAssignChallenges,
    isLoading
}) {
    return (
        <div className="w-full">
            {/* Desktop Table */}
            <EventTable
                events={events}
                eventImages={eventImages}
                sortBy={sortBy}
                sortDirection={sortDirection}
                handleSort={handleSort}
                currentPage={currentPage}
                rowsPerPage={rowsPerPage}
                formatEventDate={formatEventDate}
                isPast={isPast}
                isUpcoming={isUpcoming}
                handleImageClick={handleImageClick}
                onUpdate={onUpdate}
                onDelete={onDelete}
                onAssignChallenges={onAssignChallenges}
                isLoading={isLoading}
            />

            {/* Mobile Cards */}
            <MobileEventCards
                events={events?.content || []}
                eventImages={eventImages}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                rowsPerPage={rowsPerPage}
                sortBy={sortBy}
                sortDirection={sortDirection}
                setSortBy={setSortBy}
                setSortDirection={setSortDirection}
                onUpdate={onUpdate}
                onDelete={onDelete}
                onAssign={onAssignChallenges}
                isPast={isPast}
                isUpcoming={isUpcoming}
                formatEventDate={formatEventDate}
                handleImageClick={handleImageClick}
                isLoading={isLoading}
            />
        </div>
    );
}

export function EventTable({
    events,
    eventImages,
    sortBy,
    sortDirection,
    handleSort,
    currentPage,
    rowsPerPage,
    formatEventDate,
    isPast,
    isUpcoming,
    handleImageClick,
    onUpdate,
    onDelete,
    onAssignChallenges,
    isLoading
}) {

    const columns = [
        { label: "S.No.", index: 0, sortable: true },
        { label: "", index: 11, sortable: false },
        { label: "Event Name", index: 1, sortable: true },
        { label: "Event Description", index: 2, sortable: true },
        { label: "Max Attempt", index: 3, sortable: true },
        { label: "Event Start Time", index: 4, sortable: true },
        { label: "Event End Time", index: 5, sortable: true },
        { label: "Registration Start Time", index: 6, sortable: true },
        { label: "Registration End Time", index: 7, sortable: true },
        { label: "Action", index: 10, sortable: false },
    ]

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
        <div className="hidden overflow-x-auto sm:block" >
            <table className="w-full text-sm bg-white rounded-lg table-auto font-Lexend_Regular">
                <thead className="bg-slate-100">
                    <tr className="h-10 border-b-2 bg-slate-200 border-s-4 border-s-slate-200">
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
                    {isLoading ? (
                        renderSkeletonRow()
                    ) : events.content?.length > 0 ? (
                        events.content.map((event, index) => (
                            <tr
                                key={index}
                                className={`border-b-2 text-gray-700 ${event.live ? "border-s-4 border-s-green-400" : ""} ${isPast(event.endDateTime) ? "border-s-4 border-s-orange-600" : ""} ${!event.live && isUpcoming(event.startDateTime) ? "border-s-4 border-s-blue-400" : ""}`}
                            >
                                <td className="text-center ps-1">
                                    {(currentPage - 1) * rowsPerPage + index + 1}
                                </td>
                                <td className="w-20 h-12 me-2">
                                    <div
                                        className="relative w-16 h-12 cursor-pointer group"
                                        onClick={() => handleImageClick(eventImages[event.id] || "/ctf_logo.png", event)}
                                    >
                                        <img
                                            className="object-cover w-16 h-12 border border-gray-300 rounded"
                                            src={eventImages[event.id] || "/ctf_logo.png"}
                                            alt="Event logo"
                                            loading="lazy"
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center transition-opacity bg-black rounded opacity-0 bg-opacity-40 group-hover:opacity-100">
                                            <BsPencil className="w-5 h-5 text-white" />
                                        </div>
                                    </div>
                                </td>
                                <td className="ps-1">{event.name}</td>
                                <td className="ps-1">{event.description}</td>
                                <td className="text-center ps-1">{event.maxAttempt}</td>
                                <td className="ps-1">{formatEventDate(event.startDateTime)}</td>
                                <td className="ps-1">{formatEventDate(event.endDateTime)}</td>
                                <td className="ps-1">{formatEventDate(event.registrationStartDateTime)}</td>
                                <td className="ps-1">{formatEventDate(event.registrationEndDateTime)}</td>

                                <td className="flex flex-col px-2 py-2 space-y-2 text-gray-500 2xl:flex-row 2xl:space-y-0 2xl:space-x-2">
                                    <button
                                        className="h-12 px-2 text-white rounded bg-slate-800"
                                        onClick={() => onUpdate(event)}
                                    >
                                        Update
                                    </button>
                                    <button
                                        className="h-12 px-2 text-white rounded bg-slate-800"
                                        onClick={() => onDelete(event)}
                                    >
                                        Delete
                                    </button>
                                    <button
                                        className="px-2 text-white rounded bg-slate-800"
                                        onClick={() => onAssignChallenges(event)}
                                    >
                                        Assign <br /> Challenges
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="9" className="text-center text-gray-500 ps-1">
                                No Events available.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

// import { formatEventDate, isPast, isUpcoming } from "@/lib/dateUtils";


export const MobileEventCards = ({
    events = [],
    setCurrentPage,
    sortBy,
    setSortBy,
    sortDirection,
    setSortDirection,
    eventImages,
    onUpdate,
    onDelete,
    onAssign,
    isPast,
    isUpcoming,
    formatEventDate,
    handleImageClick,
    isLoading
}) => {

    const fields = [
        { label: "S.No.", value: 0 },
        { label: "Event Name", value: 1 },
        { label: "Event Description", value: 2 },
        { label: "Max Attempt", value: 3 },
        { label: "Event Start Time", value: 4 },
        { label: "Event End Time", value: 5 },
        { label: "Registration Start Time", value: 6 },
        { label: "Registration End Time", value: 7 },

    ];

    const handleSortChange = (e) => {
        const { name, value } = e.target;
        setCurrentPage(1)
        if (name === "sortBy") setSortBy(Number(value));
        if (name === "sortDirection") setSortDirection(value);
    };

    if (!events.length) {
        return <p className="py-4 text-center text-gray-500 sm:hidden">No events available.</p>;
    }

    return (
        <div className="flex flex-col gap-2 sm:hidden">
            <div className="font-Lexend_Regular">
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
            ) : events.map((event, index) => {
                const cardBorder = event.live ? "border-green-400" : isPast(event.endDateTime) ? "border-orange-600" :
                    isUpcoming(event.startDateTime) ? "border-blue-400" : "border-gray-200";

                return (
                    <div
                        key={index}
                        className={`border-s-2 ${cardBorder} bg-white rounded-lg shadow-md p-4 space-y-2 font-Lexend_Regular border`}
                    >
                        <div className="flex items-center gap-3">
                            <div className="relative w-16 h-12" onClick={() => handleImageClick(eventImages[event.id] || "/ctf_logo.png", event)}>
                                <img
                                    src={eventImages[event.id] || "/ctf_logo.png"}
                                    alt="Event"
                                    className="object-cover w-16 h-12 border rounded"

                                />
                                <div className="absolute inset-0 flex items-center justify-center transition-opacity bg-black rounded opacity-0 bg-opacity-40 hover:opacity-100">
                                    <BsPencil className="w-5 h-5 text-white" />
                                </div>
                            </div>
                            <div className="flex-1">
                                <p className="text-lg font-semibold">{event.name}</p>
                                <p className="text-sm text-gray-600">{event.description}</p>
                            </div>
                        </div>

                        <div className="text-sm text-gray-700">

                            <p><span className="font-medium">Max Attempt:</span> {event.maxAttempt}</p>
                            <p><span className="font-medium">Start:</span> {formatEventDate(event.startDateTime)}</p>
                            <p><span className="font-medium">End:</span> {formatEventDate(event.endDateTime)}</p>
                            <p><span className="font-medium">Registration Start:</span> {formatEventDate(event.registrationStartDateTime)}</p>
                            <p><span className="font-medium">Registration End:</span> {formatEventDate(event.registrationEndDateTime)}</p>
                        </div>

                        <div className="flex items-center justify-center gap-2 pt-2 sm:flex-row">
                            <button
                                className="px-4 py-2 text-white rounded bg-slate-800"
                                onClick={() => onUpdate(event)}
                            >
                                Update
                            </button>
                            <button
                                className="px-4 py-2 text-white rounded bg-slate-800"
                                onClick={() => onDelete(event)}
                            >
                                Delete
                            </button>
                            <button
                                className="px-4 py-2 text-white rounded bg-slate-800"
                                onClick={() => onAssign(event)}
                            >
                                Assign Challenges
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};


