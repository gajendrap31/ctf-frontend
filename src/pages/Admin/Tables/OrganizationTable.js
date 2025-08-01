import SortableHeader from "./SortableHeader";
const OrganizationTable = ({
  organizationData,
  rowsPerPage,
  currentPage,
  setCurrentPage,
  isLoading,
  sortBy,
  sortDirection,
  setSortBy,
  setSortDirection,
  handleSort,
  setUpdateOrganizationId,
  setUpdateOrganizationName,
  setUpdateOrganizationPlace,
  setUpdateOrganizationType,
  setUpdateOrganizationState,
  setShowOrganizationUpdateModal,
  setSelectedForDeleteOrganizationId,
  setShowOrganizationDeleteModal,
}) => {
  const columns = [
    { label: "S.No.", index: 0, sortable: true },
    { label: "Organisation Name", index: 1, sortable: true },
    { label: "Place", index: 2, sortable: true },
    { label: "State or Union Territory", index: 3, sortable: true },
    { label: "Type", index: 4, sortable: true },
    { label: "Action", index: 5, sortable: false },
  ];

   const fields = [
        { label: "S.No.", value: 0 },
        { label: "Name", value: 1 },
        { label: "Place", value: 2 },
        { label: "State or Union Territory", value: 3 },
        { label: "Type", value: 4 },
       
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
        {Array(6).fill(0).map((_, colIdx) => (
          <td key={colIdx} className="px-3 py-2">
            <div className="w-3/4 h-4 bg-gray-300 rounded"></div>
          </td>
        ))}
      </tr>
    ));
  };
  return (
    <div>
      {/* Table View */}
      <div className="hidden overflow-x-auto sm:block">
        <table className="w-full h-full bg-white rounded-lg font-Lexend_Regular">
          <thead className="rounded-t-lg">
            <tr className="h-10 border-b-2 rounded-t-lg bg-slate-200">
              {columns.map((col, i) => {
                const isFirst = i === 0;
                const isLast = i === columns.length - 1;

                const thClasses = `
                  ${isFirst ? "rounded-tl-lg" : ""}
                  ${isLast ? "rounded-tr-lg" : ""}
                `.trim();

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
                  <th key={col.index} className={`text-start ps-1 ${thClasses}`}>
                    {col.label}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="rounded-b-lg">
            {isLoading ? (
              renderSkeletonRow()
            ) : organizationData.content?.length > 0 ? (
              organizationData.content.map((organization, index) => (
                <tr key={index} className="text-gray-700 border-b-2 h-9">
                  <td className="ps-4">{(currentPage - 1) * rowsPerPage + index + 1}. </td>
                  <td className="ps-1">{organization.name}</td>
                  <td className="ps-1">{organization.place}</td>
                  <td className="ps-1">{organization.stateAndUT?.name}</td>
                  <td className="ps-1">
                    {organization.organisationType}
                  </td>
                  <td className="flex flex-col px-2 py-2 space-x-0 space-y-2 xl:flex-row xl:space-y-0 xl:space-x-2">
                    <button
                      className="px-2 py-1 text-white rounded bg-slate-800"
                      onClick={() => {
                        setUpdateOrganizationId(organization.id);
                        setUpdateOrganizationName(organization.name);
                        setUpdateOrganizationPlace(organization.place);
                        setUpdateOrganizationType(organization.organisationType);
                        setUpdateOrganizationState(organization.stateAndUT.id)
                        setShowOrganizationUpdateModal(true);
                      }}
                    >
                      Update
                    </button>
                    <button
                      className="px-2 py-1 text-white rounded bg-slate-800"
                      onClick={() => {
                        setSelectedForDeleteOrganizationId(organization.id);
                        setShowOrganizationDeleteModal(true);
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center text-gray-500 ps-1">
                  No organization available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="block space-y-4 sm:hidden ">
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
        ) : organizationData.content?.length > 0 ? (
          organizationData.content.map((organization, index) => (
            <div key={organization.id} className="flex flex-col p-4 text-gray-700 bg-white border rounded shadow">
              <p className="font-Lexend_SemiBold">
                {(currentPage - 1) * rowsPerPage + index + 1}. . {organization.name}
              </p>
              <p><strong>Place:</strong> {organization.place}</p>
              <p><strong>{organization.stateAndUT.type || "State or UT"}:</strong> {organization.stateAndUT.name || "N/A"}</p>
              <p>
                <strong>Type:</strong> { organization.organisationType}
              </p>
              <div className="flex gap-2 mt-2">
                <button
                  className="px-3 py-1 text-white rounded bg-slate-800"
                  onClick={() => {
                    setUpdateOrganizationId(organization.id);
                    setUpdateOrganizationName(organization.name);
                    setUpdateOrganizationPlace(organization.place);
                    setUpdateOrganizationType(organization.organisationType);
                    setShowOrganizationUpdateModal(true);
                  }}
                >
                  Update
                </button>
                <button
                  className="px-3 py-1 text-white rounded bg-slate-800"
                  onClick={() => {
                    setSelectedForDeleteOrganizationId(organization.id);
                    setShowOrganizationDeleteModal(true);
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500">No organization available.</p>
        )}
      </div>
    </div>
  );
};

export default OrganizationTable;