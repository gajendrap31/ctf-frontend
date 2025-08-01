// useAutoLogout.js
import { useEffect, useRef } from 'react';

const useAutoLogout = (logoutCallback, timeout = 30 * 60 * 1000) => {
  const timerRef = useRef(null);

  const resetTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(logoutCallback, timeout);
  };

  useEffect(() => {
    const events = ['mousemove', 'keydown', 'click', 'scroll'];

    // Attach event listeners
    events.forEach((event) => {
      window.addEventListener(event, resetTimer);
    });

    // Initialize timer
    resetTimer();

    return () => {
      // Cleanup
      events.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);
};

export default useAutoLogout;
