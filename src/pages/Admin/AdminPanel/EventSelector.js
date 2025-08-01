import { AsyncPaginate } from "react-select-async-paginate";
import { useRef } from "react";
import { useMemo } from "react";
import { useState, useEffect } from "react";
import { url } from '../../Authentication/Utility';
import axios from "axios";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
const EventSelector = ({ selectedEvent, setSelectedEvent }) => {

    const [isLoading, setIsLoading] = useState(false);
    const cachedOptions = useRef([]); // stores last MAX_OPTIONS only
    const lastSearchTerm = useRef("");
    const token = useMemo(() => localStorage.getItem('Token'), []);
    const axiosInstance = axios.create({
        baseURL: url,
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": 'application/json',
        },
        withCredentials: true,
    });

    const MAX_OPTIONS = 20
  
    const loadOptions = async (inputValue, _, { page }) => {
        try {
            setIsLoading(true);

            if (inputValue !== lastSearchTerm.current) {
                cachedOptions.current = [];
                lastSearchTerm.current = inputValue;
                page = 1;
            }

            const response = await axiosInstance.get("/admin/event/list", {
                params: {
                    page: page - 1,
                    size: 20,
                    searchTerm: inputValue,
                },
            });
            const newOptions = response.data?.content?.map((event) => ({
                value: event.id,
                label: event.name,
                color: event.live
                    ? "#10B981"
                    : event.teamSubmissions || event.userSubmissions
                        ? "oklch(64.6% 0.222 41.116)"
                        : event.upcoming ?
                            "oklch(54.6% 0.245 262.881)"
                            : "oklch(27.8% 0.033 256.848)"
                ,
            })) || [];

           
            const allOptions = [...cachedOptions.current, ...newOptions];
            const uniqueOptions = Array.from(new Map(allOptions.map(opt => [opt.value, opt])).values());
            cachedOptions.current = uniqueOptions.slice(-MAX_OPTIONS);
            return {
                options: cachedOptions.current,
                hasMore: !response.data.last,
                additional: { page: page + 1 },
            };
        } catch (error) {
            toast.error(`${error.response?.data || "Error fetching events"}`);
            return { options: [], hasMore: false };
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const fetchSelectedEvent = async () => {
            const exists = cachedOptions.current.find(opt => opt.value === selectedEvent);
            if (!exists && selectedEvent) {
                try {
                    const response = await axiosInstance.get(`/admin/event/${selectedEvent}`);
                    const event = response.data;
                    const selectedOpt = {
                        value: event.id,
                        label: event.name,
                        color: event.live
                            ? "#10B981"
                            : event.teamSubmissions || event.userSubmissions
                                ? "#374151"
                                : "#9CA3AF",
                    };
                    cachedOptions.current = [...cachedOptions.current, selectedOpt];
                } catch (error) {
                   
                }
            }
        };

        if (selectedEvent) {
            fetchSelectedEvent();
        }
    }, [selectedEvent]);

    return (
        <AsyncPaginate
            className="text-gray-600 sm:min-w-96 min-w-72"
            classNamePrefix="event-select"
            value={
                selectedEvent
                    ? cachedOptions.current.find((opt) => opt.value === selectedEvent) || null
                    : null
            }
            loadOptions={loadOptions}
            onChange={(selectedOption) => {
                setSelectedEvent(selectedOption?.value || null);
            }}
            placeholder="Select Event"
            isClearable
            isLoading={isLoading}
            additional={{ page: 1 }}
            styles={{
                control: (provided, state) => ({
                    ...provided,
                    borderColor: state.isFocused ? "#6b7280" : "#d1d5db",
                    boxShadow: state.isFocused ? "0 0 0 2px rgba(107, 114, 128, 0.3)" : "none",
                    "&:hover": {
                        borderColor: "#6b7280",
                    },
                }),
                singleValue: (provided, { data }) => ({
                    ...provided,
                    color: data.color,
                }),
                option: (provided, { data, isSelected }) => ({
                    ...provided,
                    color: data.color,
                    backgroundColor: isSelected ? "#e5e7eb" : "transparent",
                    "&:hover": {
                        backgroundColor: "#f3f4f6",
                    },
                }),
            }}
        />
    );
};

export default EventSelector