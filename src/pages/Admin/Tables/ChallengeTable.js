import { MdArrowDropUp, MdArrowDropDown } from 'react-icons/md';
import { FaPen, FaFileUpload } from 'react-icons/fa';
import { FaFilePen, } from "react-icons/fa6";
import SortableHeader from './SortableHeader';
const ChallengeTable = ({
  challenges,
  sortBy,
  sortDirection,
  setSortBy,
  setSortDirection,
  handleSort,
  currentPage,
  setCurrentPage,
  rowsPerPage,
  getChallengeFileById,
  setUpdateFileChallengeId,
  setUpdateFile,
  setExistingFileName,
  setExistingFileUrl,
  setNewFile,
  setIsFileModalOpen,
  setUpdateFlagChallengeId,
  setUpdateFlags,
  setIsFlagModalOpen,
  setUpdateChallengeId,
  setUpdateCategoryId,
  setUpdateChallengeDifficulty,
  setUpdateChallengeName,
  setUpdateQuestionDescription,
  setUpdateHint,
  setUpdateMaxMarks,
  setShowChallengeUpdateModal,
  setSelectedForDeleteChallengeId,
  setShowChallengeDeleteModal,
  isLoading
}) => {

  const headers = [
    { label: "S.No.", index: 0, sortable: true },
    { label: "Category Name", index: 1, sortable: true },
    { label: "Difficulty", index: 2, sortable: true },
    { label: "Name", index: 3, sortable: true },
    { label: "Question Description", index: 4, sortable: true },
    { label: "File", index: 7, sortable: false },
    { label: "Hint", index: 5, sortable: true },
    { label: "Max Marks", index: 6, sortable: true },
    { label: "Flags", index: 8, sortable: false },
    { label: "Action", index: 9, sortable: false },
  ];

  const fields = [
    { label: "S.No.", value: 0 },
    { label: "Category Name", value: 1 },
    { label: "Difficulty", value: 2 },
    { label: "Name", value: 3 },
    { label: "Question Description", value: 4 },
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
        {Array(10).fill(0).map((_, colIdx) => (
          <td key={colIdx} className="px-3 py-2">
            <div className="w-3/4 h-4 bg-gray-300 rounded"></div>
          </td>
        ))}
      </tr>
    ));
  };
  return (
    <div className="pt-4 overflow-x-auto">
      {/* Desktop Table */}
      <div className="hidden sm:block">
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
            {isLoading ? (
              renderSkeletonRow()
            ) : challenges?.content?.length > 0 ? (
              challenges?.content?.map((challenge, index) => (
                <tr key={index} className="text-sm text-gray-700 border-b-2 h-9">
                  <td className="text-center ps-1 ">{(currentPage - 1) * rowsPerPage + index + 1}</td>
                  <td className="ps-1 ">{challenge.challengeCategory?.name}</td>
                  <td className="text-center ps-1 ">{challenge.difficulty}</td>
                  <td className="ps-1 ">{challenge.name}</td>
                  <td className="ps-1 ">{challenge.questionDescription}</td>
                  <td className="text-center ps-1">
                    <div className="flex items-center justify-center h-full">
                      {challenge.challengeFilePresent ? (
                        <FaFilePen
                          size={24}
                          className="text-gray-700 cursor-pointer hover:text-gray-600"
                          title="Edit File"
                          onClick={async () => {
                            setIsFileModalOpen(true);
                            setUpdateFileChallengeId(challenge.id);
                            const fileData = await getChallengeFileById(challenge.id);
                            if (fileData) {
                              setUpdateFile(fileData.fileUrl);
                              setExistingFileName(fileData.fileName);
                              setExistingFileUrl(fileData.fileUrl);
                              setNewFile(null);
                            }
                          }}
                        />
                      ) : (
                        <FaFileUpload
                          size={24}
                          className="text-gray-700 cursor-pointer hover:text-gray-600"
                          title="Upload File"
                          onClick={() => {
                            setIsFileModalOpen(true);
                            setUpdateFileChallengeId(challenge.id);
                            setUpdateFile();
                            setExistingFileName();
                            setExistingFileUrl();
                            setNewFile(null);
                          }}
                        />
                      )}
                    </div>
                  </td>
                  <td className="text-center ps-1">{challenge.hint || <p>N/A</p>}</td>
                  <td className="text-center ps-1">{challenge.maxMarks}</td>
                  <td className="ps-1 pe-3">
                    <div className="flex items-center justify-between w-full">
                      <div className="flex flex-wrap gap-1">
                        {challenge.flags?.map((flag, idx) => (
                          <span key={flag.id}>{flag.flag}{idx < challenge.flags.length - 1 && ', '}</span>
                        ))}
                      </div>
                      <button
                        onClick={() => {
                          setUpdateFlagChallengeId(challenge.id);
                          setUpdateFlags(challenge.flags);
                          setIsFlagModalOpen(true);
                        }}
                        className="ml-2 text-gray-700 hover:text-gray-600"
                        title="Edit all flags"
                      >
                        <FaPen className="inline-block" />
                      </button>
                    </div>
                  </td>
                  <td className="">
                    <div className="flex flex-col p-2 space-y-2">
                      <button
                        className="px-2 py-1 text-white rounded bg-slate-800"
                        onClick={() => {
                          setUpdateChallengeId(challenge.id);
                          setUpdateCategoryId(challenge.challengeCategory.id);
                          setUpdateChallengeDifficulty(challenge.difficulty);
                          setUpdateChallengeName(challenge.name);
                          setUpdateQuestionDescription(challenge.questionDescription);
                          setUpdateHint(challenge.hint);
                          setUpdateMaxMarks(challenge.maxMarks);
                          setShowChallengeUpdateModal(true);
                        }}
                      >
                        Update
                      </button>
                      <button
                        className="px-2 py-1 text-white rounded bg-slate-800"
                        onClick={() => {
                          setSelectedForDeleteChallengeId(challenge.id);
                          setShowChallengeDeleteModal(true);
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="10" className="text-center text-gray-500 ps-1">No challenges available.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="space-y-4 text-gray-700 sm:hidden">
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
        ) : challenges?.content?.length > 0 ? (
          challenges?.content?.map((challenge, index) => (
            <div key={index} className="p-4 bg-white border rounded-lg shadow-sm font-Lexend_Regular ">
              <div className="text-sm font-Lexend_SemiBold">S.No.: {(currentPage - 1) * rowsPerPage + index + 1}</div>
              <div><span className='font-Lexend_SemiBold'>Category:</span> {challenge.challengeCategory?.name}</div>
              <div><span className='font-Lexend_SemiBold'>Difficulty:</span> {challenge.difficulty}</div>
              <div><span className='font-Lexend_SemiBold'>Name:</span> {challenge.name}</div>
              <div><span className='font-Lexend_SemiBold'>Question Description: </span>{challenge.questionDescription}</div>

              <div><span className='font-Lexend_SemiBold'>Hint:</span> {challenge.hint || 'N/A'}</div>
              <div><span className='font-Lexend_SemiBold'>Max Marks:</span> {challenge.maxMarks}</div>
              <div className="text-sm">
                <span className='font-Lexend_SemiBold'>Flags:</span> {challenge.flags?.map((flag, i) => (
                  <span key={flag.id}>{flag.flag}{i < challenge.flags.length - 1 && ', '}</span>
                ))}
                <button
                  onClick={() => {
                    setUpdateFlagChallengeId(challenge.id);
                    setUpdateFlags(challenge.flags);
                    setIsFlagModalOpen(true);
                  }}
                  className="ml-2 text-gray-700 hover:text-gray-600"
                  title="Edit flags"
                >
                  <FaPen size={16} />
                </button>
              </div>

              <div className="flex gap-2 mt-2">
                <button
                  className="px-2 py-1 text-white rounded bg-slate-800"
                  onClick={() => {
                    setUpdateChallengeId(challenge.id);
                    setUpdateCategoryId(challenge.challengeCategory.id);
                    setUpdateChallengeDifficulty(challenge.difficulty);
                    setUpdateChallengeName(challenge.name);
                    setUpdateQuestionDescription(challenge.questionDescription);
                    setUpdateHint(challenge.hint);
                    setUpdateMaxMarks(challenge.maxMarks);
                    setShowChallengeUpdateModal(true);
                  }}
                >
                  Update
                </button>
                <button
                  className="px-2 py-1 text-white rounded bg-slate-800"
                  onClick={() => {
                    setSelectedForDeleteChallengeId(challenge.id);
                    setShowChallengeDeleteModal(true);
                  }}
                >
                  Delete
                </button>
                <div className="flex items-center gap-2 ">
                  {challenge.challengeFilePresent ? (
                    <div
                      size={20}
                      title="Edit File"
                      onClick={async () => {
                        setIsFileModalOpen(true);
                        setUpdateFileChallengeId(challenge.id);
                        const fileData = await getChallengeFileById(challenge.id);
                        if (fileData) {
                          setUpdateFile(fileData.fileUrl);
                          setExistingFileName(fileData.fileName);
                          setExistingFileUrl(fileData.fileUrl);
                          setNewFile(null);
                        }
                      }}
                      className="p-1 text-white rounded cursor-pointer bg-slate-800"
                    >View or Update File </div>
                  ) : (
                    <div
                      size={20}
                      title="Upload File"
                      onClick={() => {
                        setIsFileModalOpen(true);
                        setUpdateFileChallengeId(challenge.id);
                        setUpdateFile();
                        setExistingFileName();
                        setExistingFileUrl();
                        setNewFile(null);
                      }}
                      className="p-1 text-white rounded cursor-pointer bg-slate-800 hover:text-gray-600"
                    >Upload File</div>
                  )}
                </div>
              </div>

            </div>
          ))
        ) : (
          <p className="text-center text-gray-500">No challenges available.</p>
        )}
      </div>
    </div>
  );
};

export default ChallengeTable;