import { Tooltip } from "react-tooltip";
import SortableHeader from "./SortableHeader";

const SubmissionTable = ({
  eventData,
  selectedEvent,
  submissionData,
  sortBy,
  setSortBy,
  sortDirection,
  setSortDirection,
  handleSort,
  handleMarkForReview,
  currentPage,
  setCurrentPage,
  rowsPerPage,
  formatSubmissionDate,
  loadingReview,
  isLoading,
}) => {
  const columns = [
    { label: "S.No.", index: 0, sortable: true },
    { label: "Challenge Description", index: 1, sortable: true },
    { label: "Solution", index: 2, sortable: true },
    { label: "Submission Time", index: 3, sortable: true },
    { label: "Status", index: 4, sortable: true },
    { label: "Score", index: 5, sortable: true },
    { label: eventData?.live ? "Action" : "Review", index: 6, sortable: false },
  ];

  const renderReviewButton = (submission) => {
    const isLive = eventData?.live;
    if (!isLive) {
      return submission.status
        ? submission.reviewComplete && <p>Review Completed</p>
        : <p>{submission.reviewComplete ? "Review Completed" : submission.review ? "Review Pending" : "Not Marked for Review"}</p>;
    }
    return submission.status
      ? submission.reviewComplete && <p className="w-fit">Review Completed</p>
      : (
        <button
          className="px-2 py-1 text-white bg-gray-800 rounded disabled:bg-gray-600 disabled:cursor-not-allowed"
          onClick={() => handleMarkForReview(submission.id)}
          disabled={submission.review || submission.reviewComplete || loadingReview}
        >
          {submission.reviewComplete
            ? "Review Completed"
            : submission.review
              ? "Review Pending"
              : "Mark for Review"}
        </button>
      );
  };

  const renderEmptyState = (message) => (
    <div className="py-2 text-center text-gray-500 bg-white border rounded-lg">{message}</div>
  );

  const fields = [
    { label: "S.No.", value: 0 },
    { label: "Challenge Description", value: 1 },
    { label: "Solution", value: 2 },
    { label: "Submission Time", value: 3 },
    { label:  "Status", value: 4 },
    { label: "Score", value: 5 },
    
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

  // Desktop view
  const renderDesktopTable = () => {


    return (
      <div className="overflow-x-auto">
        <table className="w-full bg-white rounded-lg">
          <thead>
            <tr className="h-10 border-b-2 bg-slate-200">
              {columns.map((col, i) => {
                const isFirst = i === 0;
                const isLast = i === columns.length - 1;
                const thClasses = `ps-1 ${isFirst ? "rounded-tl-md" : ""} ${isLast ? "rounded-tr-md pe-3" : ""}`;
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
            ) : !(selectedEvent || eventData.id) ?
              <tr className="text-gray-700 border-b-2 h-9">
                <td colSpan="7" className="py-3 text-center text-gray-700">
                  Event has not been selected yet. Please select an event.
                </td>
              </tr> : !submissionData?.content?.length ?
                <tr className="text-gray-700 border-b-2 h-9">
                  <td colSpan={7} className="text-center">Looks like you haven’t submitted any challenges in this event.</td>
                </tr> :
                submissionData.content.map((submission, index) => (
                  <tr key={index} className="text-gray-700 border-b-2 h-9">
                    <td className="ps-3">{(currentPage - 1) * rowsPerPage + index + 1}</td>
                    <td className="ps-3">
                      <span
                        data-tooltip-id={`challenge-tooltip-${index}`}
                        data-tooltip-content={submission.challenge.name}
                        className="cursor-pointer"
                      >
                        {submission.challenge.questionDescription}
                      </span>
                      <Tooltip id={`challenge-tooltip-${index}`} place="top" />
                    </td>
                    <td className="ps-3">{submission.solution}</td>
                    <td className="ps-3">{formatSubmissionDate(submission.submissionDateTime)}</td>
                    <td className="ps-3">
                      <span className={submission.status ? "text-green-500" : "text-red-500"}>
                        {submission.status ? "Correct" : "Incorrect"}
                      </span>
                    </td>
                    <td className="ps-3">{submission.score}</td>
                    <td className="px-3">{renderReviewButton(submission)}</td>
                  </tr>
                ))}

          </tbody>
        </table>
      </div>
    );
  };

  // Mobile view
  const renderMobileCards = () => {

    if (isLoading) {
      return [...Array(3)].map((_, index) => (
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
    }


    if (!eventData.id) {
      return renderEmptyState("No event selected yet. Please select an event.");
    }

    if (!submissionData?.content?.length) {
      return renderEmptyState("No submissions available.");
    }

    return submissionData.content.map((submission, index) => (
      <div key={index} className="p-4 space-y-1 text-gray-700 bg-white border rounded shadow">
        <p className="text-sm font-Lexend_SemiBold">
          #{(currentPage - 1) * rowsPerPage + index + 1} —{" "}
          {eventData.teamCreationAllowed
            ? submission.team?.name
            : submission.user?.email}
        </p>
        <p><strong>Challenge Name:</strong> {submission.challenge.name}</p>
        <p><strong>Challenge Description:</strong> {submission.challenge.questionDescription}</p>
        <p><strong>Solution:</strong> {submission.solution}</p>
        <p><strong>Submission Time:</strong> {formatSubmissionDate(submission.submissionDateTime)}</p>
        <p>
          <strong>Status:</strong>{" "}
          <span className={submission.status ? "text-green-500" : "text-red-500"}>
            {submission.status ? "Correct" : "Incorrect"}
          </span>
        </p>
        <p><strong>Score:</strong> {submission.score}</p>
        <div>{!submission.status && renderReviewButton(submission)}</div>
      </div>
    ));
  };

  return (
    <div>
      <div className="hidden pt-4 sm:block">{renderDesktopTable()}</div>
      <div className="pt-4 space-y-4 sm:hidden font-Lexend_Regular">
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
        {renderMobileCards()}
      </div>
    </div>
  );
};

export default SubmissionTable;
