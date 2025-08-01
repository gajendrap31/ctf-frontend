import React, { useState, useRef, useMemo, useEffect } from 'react';
import JoditEditor from 'jodit-react';
import Sidebar from '../Sidebar';
import Navbar from '../Navbar';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import { url } from '../../Authentication/Utility';
import AuthService from '../../Authentication/AuthService';
import { useNavigate } from 'react-router-dom';
import Select from "react-select";
import EventSelector from './EventSelector';

function AdminInstruction({ userDetails, placeholder }) {
  const [open, setOpen] = useState(true);
  const editor = useRef(null);
  const token = useMemo(() => localStorage.getItem('Token'), []);
  const navigate = useNavigate();
 const editorContentRef = useRef('');
  const [selectedEvent, setSelectedEvent] = useState('');
  const [instructionData, setInstructionData] = useState();

  useEffect(() => {
    const handleResize = () => setOpen(window.innerWidth >= 1280);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const token = AuthService.getToken();
    if (!AuthService.isTokenValid(token)) navigate('/');
  }, [navigate]);

  const axiosInstance = axios.create({
    baseURL: url,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    withCredentials: true,
  });

  const fetchEventInstructions = async () => {
    try {
      const response = await axiosInstance.get(`/admin/event/${selectedEvent}/instructions`);
      const content = response.data.instructions || '';
      editorContentRef.current = content;
      setInstructionData(response.data);
    } catch (error) {
      toast.error('Failed to fetch instructions');
    }
  };

 useEffect(() => {
  if (selectedEvent) {
    fetchEventInstructions();
  } else {
    setInstructionData(undefined);
    editorContentRef.current = '';
  }
}, [selectedEvent]);


  const saveInstructions = async () => {
    if (!selectedEvent) {
      toast.error('Please select an event to save instructions!');
      return;
    }
    try {
      const res = await axiosInstance.post(`/admin/event/${selectedEvent}/instructions`, {
        instructions: editorContentRef.current,
      });
      toast.success(res?.data || 'Instructions saved successfully!');
      fetchEventInstructions();
    } catch (error) {
      toast.error(error.response?.data || 'Failed to save instructions. Please try again.');
    }
  };

  const handleUpdateInstructions = async () => {
    try {
      const res = await axiosInstance.put(`/admin/event/${selectedEvent}/instructions`, {
        instructions: editorContentRef.current,
      });
      toast.success(res?.data || 'Instructions updated successfully!');
      fetchEventInstructions();
    } catch (error) {
      toast.error(error.response?.data || 'Failed to update instructions. Please try again.');
    }
  };
 
  return (
    <div className="flex">
      <Sidebar open={open} name={userDetails.username} setValue={setOpen} />
      <div className="flex flex-col w-full text-sm">
        <Navbar name={userDetails.name} setValue={setOpen} />
        <ToastContainer />
        <div className={`text-gray-900 flex-1 w-full ${open ? 'pl-0 lg:pl-72' : ''}`}>

          <div className="flex items-center justify-center p-3 py-2 m-4 bg-gray-100 rounded">
            <p className="px-8 py-1 text-2xl text-gray-800 rounded font-Lexend_Bold">Add Instructions for the Event </p>
          </div>
          <div className="flex flex-col p-4 mx-4 border rounded-lg h-fu">

            {/* Event Selection */}
            <div className="flex items-center justify-between pb-3">
              <div className="z-20 flex flex-col items-center w-full gap-2 sm:flex-row font-Lexend_Regular">

                <EventSelector
                  selectedEvent={selectedEvent}
                  setSelectedEvent={setSelectedEvent}
                />
              </div>
            </div>

            {/* Instruction Editor */}
            <div className="z-10 flex flex-col w-full p-4 bg-white border rounded-lg ">
              <JoditEditor
                ref={editor}
                value={editorContentRef.current}
                config={{
                  readonly: false,
                  placeholder: placeholder || 'Start typing your instructions...',
                  minHeight: 500
                }}
                tabIndex={1}
                onChange={(newContent) => {
                  editorContentRef.current = newContent;
                }}
                className="h-full bg-gray-700"
              />

            </div>

            {/* Save/Update Button */}
            <div className="mt-4">
              {!instructionData ? (
                <button
                  onClick={saveInstructions}
                  className="px-6 py-2 text-white transition bg-gray-800 rounded shadow hover:bg-gray-700 font-Lexend_Regular"
                >
                  Save Instruction
                </button>
              ) : (
                <button
                  onClick={handleUpdateInstructions}
                  className="px-6 py-2 text-white transition bg-gray-800 rounded shadow hover:bg-gray-700 font-Lexend_Regular"
                >
                  Update Instruction
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminInstruction;
