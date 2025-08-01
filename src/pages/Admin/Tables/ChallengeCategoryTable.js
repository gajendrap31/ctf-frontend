import { MdArrowDropUp, MdArrowDropDown } from "react-icons/md";

const ChallengeCategoryTable = ({
    challengesCategory,
    sortBy,
    sortDirection,
    setSortBy,
    setSortDirection,
    currentPage,
    setCurrentPage,
    rowsPerPage,
    handleSort,
    setUpdateId,
    setUpdateName,
    setUpdateDescription,
    setShowCategoryUpdateModal,
    setSelectedForDeleteCategoryId,
    setShowCategoryDeleteModal,
    isLoading,
}) => {

    const fields = [
        { label: "S.No.", value: 0 },
        { label: "Category Name", value: 1 },
        { label: "Description", value: 2 },
       
    ];

    const handleSortChange = (e) => {
        const { name, value } = e.target;
        setCurrentPage(1)
        if (name === "sortBy") setSortBy(Number(value));
        if (name === "sortDirection") setSortDirection(value);
    };
    // Skeleton loader
    const renderSkeleton = (rows = 5) => {
        return [...Array(rows)].map((_, idx) => (
            <tr key={idx} className="border-b-2 animate-pulse h-9">
                {Array(4).fill(0).map((_, colIdx) => (
                    <td key={colIdx} className="px-2">
                        <div className="w-3/4 h-4 rounded bg-slate-200"></div>
                    </td>
                ))}
            </tr>
        ));
    };

    return (
        <div className="w-full">
            {/* Desktop Table View */}
            <div className="hidden overflow-x-auto sm:block">
                <table className="w-full text-sm bg-white rounded-lg font-Lexend_Regular">
                    <thead>
                        <tr className="h-10 border-b-2 bg-slate-200">
                            {["S.No.", "Category Name", "Description"].map((label, i) => (
                                <th
                                    key={i}
                                    className={`text-start px-2 py-2 cursor-pointer ${i === 0 ? "rounded-tl-lg" : ""
                                        }`}
                                    onClick={() => handleSort(i)}
                                >
                                    <div className="flex items-center">
                                        <p>{label}</p>
                                        <div className="flex flex-col ml-1 -space-y-3 leading-none">
                                            <MdArrowDropUp
                                                size={20}
                                                className={
                                                    sortBy === i && sortDirection === "ASC"
                                                        ? "text-black"
                                                        : "text-gray-400"
                                                }
                                            />
                                            <MdArrowDropDown
                                                size={20}
                                                className={
                                                    sortBy === i && sortDirection === "DESC"
                                                        ? "text-black"
                                                        : "text-gray-400"
                                                }
                                            />
                                        </div>
                                    </div>
                                </th>
                            ))}
                            <th className="px-2 py-2 rounded-tr-lg text-start">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            renderSkeleton()
                        ) : challengesCategory?.content?.length > 0 ? (
                            challengesCategory.content.map((category, index) => (
                                <tr key={index} className="h-10 text-gray-700 border-b-2">
                                    <td className="px-2 ">{(currentPage - 1) * rowsPerPage + index + 1}</td>
                                    <td className="px-2 ">{category.name}</td>
                                    <td className="px-2 ">
                                        {category.description}
                                    </td>
                                    <td className="flex flex-col px-2 py-2 space-y-1 text-gray-500 xl:space-y-0 xl:space-x-2 xl:flex-row">
                                        <button
                                            className="px-2 py-1 text-white rounded bg-slate-800"
                                            onClick={() => {
                                                setUpdateId(category.id);
                                                setUpdateName(category.name);
                                                setUpdateDescription(category.description);
                                                setShowCategoryUpdateModal(true);
                                            }}
                                        >
                                            Update
                                        </button>
                                        <button
                                            className="px-2 py-1 text-white rounded bg-slate-800"
                                            onClick={() => {
                                                setSelectedForDeleteCategoryId(category.id);
                                                setShowCategoryDeleteModal(true);
                                            }}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="py-4 text-center text-gray-500">
                                    No category data available.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Mobile Card View */}
            <div className="block space-y-4 sm:hidden font-Lexend_Regular">
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
                    [...Array(3)].map((_, idx) => (
                        <div key={idx} className="p-4 space-y-2 bg-white rounded shadow animate-pulse">
                            <div className="w-1/4 h-4 rounded bg-slate-200"></div>
                            <div className="w-1/2 h-4 rounded bg-slate-200"></div>
                            <div className="w-3/4 h-4 rounded bg-slate-200"></div>
                            <div className="flex space-x-2">
                                <div className="w-20 h-8 rounded bg-slate-200"></div>
                                <div className="w-20 h-8 rounded bg-slate-200"></div>
                            </div>
                        </div>
                    ))
                ) : challengesCategory?.content?.length > 0 ? (
                    challengesCategory.content.map((category, index) => (
                        <div
                            key={index}
                            className="flex flex-col p-4 text-gray-700 bg-white border rounded-lg shadow font-Lexend_Regular"
                        >
                            <p className="text-sm font-Lexend_SemiBold">S.No.: {(currentPage - 1) * rowsPerPage + index + 1}</p>
                            <p className=""><span className="font-Lexend_SemiBold">Name:</span> {category.name}</p>
                            <p className=""><span className="font-Lexend_SemiBold">Description:</span> {category.description}</p>
                            <div className="flex pt-2 space-x-2">
                                <button
                                    className="px-3 py-1 text-white rounded bg-slate-800"
                                    onClick={() => {
                                        setUpdateId(category.id);
                                        setUpdateName(category.name);
                                        setUpdateDescription(category.description);
                                        setShowCategoryUpdateModal(true);
                                    }}
                                >
                                    Update
                                </button>
                                <button
                                    className="px-3 py-1 text-white rounded bg-slate-800"
                                    onClick={() => {
                                        setSelectedForDeleteCategoryId(category.id);
                                        setShowCategoryDeleteModal(true);
                                    }}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="py-4 text-center text-gray-500">No category data available.</div>
                )}
            </div>
        </div>
    );
};

export default ChallengeCategoryTable;
