// SortableHeader.js
import { MdArrowDropUp, MdArrowDropDown } from "react-icons/md";

const SortableHeader = ({ label, index, sortBy, sortDirection, onSort, className }) => (
  <th scope="col" className={`text-start ps-3 cursor-pointer ${className}`} onClick={() => onSort(index)}>
    <div className="flex items-center space-x-2">
      <p>{label}</p>
      <div className="flex flex-col leading-none -space-y-3">
        <MdArrowDropUp
          size={20}
          className={sortBy === index && sortDirection === "ASC" ? "text-black" : "text-gray-400"}
        />
        <MdArrowDropDown
          size={20}
          className={sortBy === index && sortDirection === "DESC" ? "text-black" : "text-gray-400"}
        />
      </div>
    </div>
  </th>
);

export default SortableHeader;
