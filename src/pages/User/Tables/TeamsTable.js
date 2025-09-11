import React from "react";
import { useNavigate } from "react-router-dom";
import SortableHeader from "./SortableHeader";

export const TeamTableData = ({
    teams,
    currentPage,
    setCurrentPage,
    rowsPerPage,
    sortBy,
    setSortBy,
    sortDirection,
    setSortDirection,
    handleSort,
    handleMembersClick,
    selectedEventData,
    currentEventData,
    userDetails,
    teamRequestData = [],
    teamInvitationData = [],
    handleRequest,
    handleRejectRequest,
    handleAcceptInvitation,
    handleDeleteInvitation,
    isLoading
}) => {
    return (
        <div>
            {/* Desktop view */}
            <TeamTable
                teams={teams}
                currentPage={currentPage}
                rowsPerPage={rowsPerPage}
                sortBy={sortBy}
                sortDirection={sortDirection}
                handleSort={handleSort}
                handleMembersClick={handleMembersClick}
                selectedEventData={selectedEventData}
                currentEventData={currentEventData}
                userDetails={userDetails}
                teamRequestData={teamRequestData}
                teamInvitationData={teamInvitationData}
                handleRequest={handleRequest}
                handleRejectRequest={handleRejectRequest}
                handleAcceptInvitation={handleAcceptInvitation}
                handleDeleteInvitation={handleDeleteInvitation}
                isLoading={isLoading}
            />

            {/* Mobile view */}
            <MobileTeamCards
                teams={teams}
                setCurrentPage={setCurrentPage}
                sortBy={sortBy}
                setSortBy={setSortBy}
                sortDirection={sortDirection}
                setSortDirection={setSortDirection}
                selectedEventData={selectedEventData}
                currentEventData={currentEventData}
                handleMembersClick={handleMembersClick}
                userDetails={userDetails}
                teamRequestData={teamRequestData}
                teamInvitationData={teamInvitationData}
                handleRequest={handleRequest}
                handleRejectRequest={handleRejectRequest}
                handleAcceptInvitation={handleAcceptInvitation}
                handleDeleteInvitation={handleDeleteInvitation}
                isLoading={isLoading}
            />
        </div>
    );
};

/* -------------------------------------------------------------------------- */

const TeamTable = ({
    teams,
    currentPage,
    rowsPerPage,
    sortBy,
    sortDirection,
    handleSort,
    handleMembersClick,
    selectedEventData,
    currentEventData,
    userDetails,
    teamRequestData,
    teamInvitationData,
    handleRequest,
    handleRejectRequest,
    handleAcceptInvitation,
    handleDeleteInvitation,
    isLoading
}) => {
    const navigate = useNavigate();
    const isMemberExist = teams?.content?.some(team =>
        team.members?.some(member => member.user.id === userDetails.id)
    );
    const columns = [
        { label: "S.No.", index: 0, sortable: true },
        { label: "Team Name", index: 1, sortable: true },
        { label: "Captain", index: 2, sortable: true },
        { label: "Members", index: 3, sortable: false },
        ...(currentEventData?.id && !isMemberExist
            ? [{ label: "Action", index: 4, sortable: false }]
            : '')
    ];

    const renderAction = (team) => {
        const isMember = team.members?.some(
            (m) => m.user.id === userDetails.id
        );
        const request = teamRequestData.find(
            (r) => r.user?.id === userDetails.id && r.team.id === team.id
        );
        const invited = teamInvitationData.some(
            (inv) => inv.user?.id === userDetails.id && inv.team.id === team.id
        );

        if (isMember) {
            return null
            // return (
            //     <button
            //         className="px-3 py-1 text-white bg-blue-600 rounded"
            //         onClick={() => navigate("/my-team")}
            //     >
            //         My Team
            //     </button>
            // );
        }

        if (request) {
            return (
                <button
                    className="px-3 py-1 text-white bg-gray-950 rounded"
                    onClick={() => handleRejectRequest(team.id)}
                >
                    Delete Request
                </button>
            );
        }

        if (invited) {
            return (
                <div className="flex flex-wrap gap-2">
                    <button
                        className="px-3 py-1 text-white bg-gray-950 rounded"
                        onClick={() => handleAcceptInvitation(team.id)}
                    >
                        Accept
                    </button>
                    <button
                        className="px-3 py-1 text-white bg-gray-950 rounded"
                        onClick={() => handleDeleteInvitation(team.id)}
                    >
                        Reject
                    </button>
                </div>
            );
        }

        if (isMemberExist) return null;

        return (
            <button
                className="px-3 py-1 text-white bg-gray-950 rounded"
                onClick={() => handleRequest(team.id)}
            >
                Request
            </button>
        );
    };


    const isMember = (team) => team.members?.some(
        (m) => m.user.id === userDetails.id
    );

    const activeEvent = currentEventData?.id ? currentEventData : selectedEventData?.id ? selectedEventData : null;
    if (currentEventData?.id && !currentEventData?.teamCreationAllowed) {
        return (
            <div className="hidden p-6 m-4 text-center bg-white rounded-lg sm:block">
                <div>
                    <p className="mb-2 text-3xl text-gray-700 font-Lexend_SemiBold">
                        You've joined a solo event.
                    </p>
                    <p className="text-base text-gray-500 font-Lexend_Regular">
                        Team creation is not available for this event.
                    </p>
                </div>
            </div>
        );
    }

    // Skeleton row for loading state
    const renderSkeletonRow = (count = 5) => {
        return [...Array(count)].map((_, idx) => (
            <tr key={idx} className="border-b animate-pulse">
                {Array(4).fill(0).map((_, colIdx) => (
                    <td key={colIdx} className="px-3 py-2">
                        <div className="w-3/4 h-4 bg-gray-300 rounded"></div>
                    </td>
                ))}
            </tr>
        ));
    };
    return (
        <div className="hidden pt-4 overflow-x-auto sm:block">
            <table className="w-full bg-white rounded-lg font-Lexend_Regular">
                <thead>
                    <tr className="h-10 border-b-2 bg-slate-200">
                        {columns.map((col, i) => {
                            const thClasses = `${i === 0 ? "rounded-tl-md" : ""} ${i === columns.length - 1 ? "rounded-tr-md" : ""
                                }`;
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
                    {(() => {

                        if (!activeEvent) {
                            return (
                                <tr>
                                    <td colSpan="5" className="py-3 text-center text-gray-700">
                                        Event has not been selected yet. Please select an event.
                                    </td>
                                </tr>
                            );
                        }

                        if (activeEvent?.name && !activeEvent.teamCreationAllowed) {
                            return (
                                <tr>
                                    <td colSpan="5" className="py-3 text-center text-gray-700">
                                        Team creation is <strong>not allowed</strong> for this event.
                                    </td>
                                </tr>
                            );
                        }
                        if (isLoading) {
                            return renderSkeletonRow()
                        }
                        if (teams?.content?.length > 0) {
                            return teams.content.map((team, idx) => (
                                <tr key={team.id} className="text-gray-700 border-b-2 h-9">
                                    <td className="ps-3">
                                        {(currentPage - 1) * rowsPerPage + idx + 1}
                                    </td>
                                    <td className="ps-3">{team.name}</td>
                                    <td className="ps-3">{team.captain?.fullName}</td>
                                    <td className="ps-3">
                                        {isMember(team) ? <> {currentEventData?.id ? <button
                                            className="px-3 py-1 text-white bg-blue-600 rounded"
                                            onClick={() => navigate("/my-team")}
                                        >
                                            My Team
                                        </button> : <button
                                            onClick={() => handleMembersClick(team.members)}
                                            className={`${isMember(team) ? 'bg-blue-500' : 'bg-gray-950'} text-white px-3 py-1 rounded`}
                                        >
                                            View My Team  ({team.members?.length || 0})
                                        </button>}</> :
                                            <button
                                                onClick={() => handleMembersClick(team.members)}
                                                className={`${isMember(team) ? 'bg-blue-500' : 'bg-gray-950'} text-white px-3 py-1 rounded`}
                                            >
                                                View ({team.members?.length || 0})
                                            </button>}
                                    </td>
                                    {currentEventData?.id && !isMemberExist && <td className="ps-3">
                                        {renderAction(team)}
                                    </td>}
                                </tr>
                            ));
                        }

                        return (
                            <tr>
                                <td colSpan="5" className="py-3 text-center text-gray-700">
                                    No teams available.
                                </td>
                            </tr>
                        );
                    })()}
                </tbody>

            </table>
        </div>
    );
};

/* -------------------------------------------------------------------------- */

const MobileTeamCards = ({
    teams,
    selectedEventData,
    currentEventData,
    handleMembersClick,
    userDetails,
    teamRequestData,
    teamInvitationData,
    handleRequest,
    handleRejectRequest,
    handleAcceptInvitation,
    handleDeleteInvitation,
    setCurrentPage,
    sortBy,
    setSortBy,
    sortDirection,
    setSortDirection,
    isLoading
}) => {
    const navigate = useNavigate();
    const renderActionText = (team) => {
        const isMember = team.members?.some(
            (m) => m.user.id === userDetails.id
        );
        const request = teamRequestData.find(
            (r) => r.user?.id === userDetails.id && r.team.id === team.id
        );
        const invited = teamInvitationData.some(
            (inv) => inv.user?.id === userDetails.id && inv.team.id === team.id
        );

        if (isMember) return "You are a member ✔️";
        if (request) return "Request sent ⏳";
        if (invited) return "Invitation pending 📩";
        return null;
    };


    const isMemberExist = teams?.content?.some(team =>
        team.members?.some(member => member.user.id === userDetails.id)
    );
    const renderAction = (team) => {
        const isMember = team.members?.some(
            (m) => m.user.id === userDetails.id
        );
        const request = teamRequestData.find(
            (r) => r.user?.id === userDetails.id && r.team.id === team.id
        );
        const invited = teamInvitationData.some(
            (inv) => inv.user?.id === userDetails.id && inv.team.id === team.id
        );

        if (isMember) {
            return (
                <button
                    className="px-3 py-1 text-white bg-blue-600 rounded"
                    onClick={() => navigate("/my-team")}
                >
                    My Team
                </button>
            );
        }

        if (request) {
            return (
                <button
                    className="px-3 py-1 text-white bg-gray-950 rounded"
                    onClick={() => handleRejectRequest(team.id)}
                >
                    Delete Request
                </button>
            );
        }

        if (invited) {
            return (
                <div className="flex flex-wrap gap-2">
                    <button
                        className="px-3 py-1 text-white bg-gray-950 rounded"
                        onClick={() => handleAcceptInvitation(team.id)}
                    >
                        Accept
                    </button>
                    <button
                        className="px-3 py-1 text-white bg-gray-950 rounded"
                        onClick={() => handleDeleteInvitation(team.id)}
                    >
                        Reject
                    </button>
                </div>
            );
        }
        if (isMemberExist) return null;

        return (
            <button
                className="px-3 py-1 text-white bg-gray-950 rounded"
                onClick={() => handleRequest(team.id)}
            >
                Request
            </button>
        );
    };


    const isMember = (team) => team.members?.some(
        (m) => m.user.id === userDetails.id
    );

    const activeEvent = currentEventData?.id ? currentEventData : selectedEventData?.id ? selectedEventData : null;
    if (currentEventData?.id && !currentEventData?.teamCreationAllowed) {
        return (
            <div className="text-center bg-white rounded-lg sm:hidden">
                <div className="">
                    <p className="text-3xl text-gray-700 font-Lexend_SemiBold">
                        You've joined a solo event.
                    </p>
                    <p className="text-base text-gray-500 font-Lexend_Regular">
                        Team creation is not available for this event.
                    </p>
                </div>
            </div>
        );
    }
    const fields = [
        { label: "S.No.", value: 0 },
         { label: "Team Name", value: 1 },
        { label: "Captain", value:2 },

    ];


    const handleSortChange = (e) => {
        const { name, value } = e.target;
        setCurrentPage(1)
        if (name === "sortBy") setSortBy(Number(value));
        if (name === "sortDirection") setSortDirection(value);
    };
    return (
        <div className="pt-4 space-y-4 text-gray-700 sm:hidden font-Lexend_Regular">
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
            {(() => {

                if (!activeEvent) {
                    return (
                        <div>
                            <p className="py-3 text-center text-gray-700 bg-white border rounded">
                                Event has not been selected yet. Please select an event.
                            </p>
                        </div>
                    );
                }

                if (activeEvent?.name && !activeEvent.teamCreationAllowed) {
                    return (
                        <div>
                            <p className="py-3 text-center text-gray-700 bg-white border rounded">
                                Team creation is <strong>not allowed</strong> for this event.
                            </p>
                        </div>
                    );
                }
                if (isLoading) {
                    return (
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
                    )
                }
                if (teams?.content?.length > 0) {
                    return teams?.content?.map((team, idx) => (
                        <div key={team.id} className="p-4 bg-white border rounded shadow">
                            <p className="mb-1 text-lg font-bold">
                                #{idx + 1} - {team.name}
                            </p>
                            <p>
                                <strong>Captain:</strong> {team.captain?.fullName}
                            </p>
                            <button
                                className={`mt-3  ${isMember(team) ? 'bg-blue-600' : 'bg-gray-950'} text-white px-3 py-1 rounded`}
                                onClick={() => handleMembersClick(team.members)}
                            >
                                {isMember(team) ? 'View My Team Members' : 'View Members'} ({team.members?.length || 0})
                            </button>

                            {/* Inline status/action */}
                            <p className="mt-2 italic">{renderActionText(team)}</p>
                            {currentEventData?.id && <div className="">
                                {renderAction(team)}
                            </div>}
                        </div>
                    ))
                }

                return (
                    <div>
                        <p className="py-3 text-center text-gray-700 bg-white rounded">
                            No teams available.
                        </p>
                    </div>
                );
            })()}

        </div>
    );
};
