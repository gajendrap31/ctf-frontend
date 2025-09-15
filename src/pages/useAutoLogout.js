// useAutoLogout.js
import { useEffect, useRef } from 'react';

const useAutoLogout = (showLogoutModal, timeout = 29 * 60 * 1000) => {
  const timerRef = useRef(null);

  const resetTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(showLogoutModal, timeout);
  };

  useEffect(() => {
    const events = ['touchstart', 'keydown', 'click', 'scroll'];

    events.forEach((event) => {
      window.addEventListener(event, resetTimer);
    });

    resetTimer();

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);
};

export default useAutoLogout;
