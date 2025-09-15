// LogoutModal.js
import React, { useEffect, useState } from 'react';

const LogoutModal = ({ isOpen, onConfirm, onCancel, countdown = 60 }) => {
  const [timeLeft, setTimeLeft] = useState(countdown);

  useEffect(() => {
    if (!isOpen) return;

    setTimeLeft(countdown); // reset on open
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onConfirm(); // auto logout when time runs out
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, countdown, onConfirm]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center mx-2 z-50">
      <div className="bg-white p-6 rounded-2xl shadow-2xl max-w-md animate-fadeIn">
        <h2 className="text-2xl font-bold text-gray-800 mb-3 text-center">
          ⚠️ Idle Warning
        </h2>
        <p className="text-gray-600 text-center mb-6">
          You’ve been inactive.<br/>You will be logged out in{" "}
          <span className="font-semibold text-red-500">{timeLeft}</span> seconds.
        </p>

        <div className="flex justify-center">
          <button
            className="bg-slate-900 hover:bg-slate-800 transition px-5 py-2.5 rounded-lg text-white font-medium"
            onClick={onCancel}
          >
            Stay Logged In
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutModal;
