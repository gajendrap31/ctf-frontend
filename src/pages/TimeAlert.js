import React, { useEffect, useState } from 'react';

function TimeAlert() {
  const [dateTime, setDateTime] = useState('');
  const [timeZone, setTimeZone] = useState('');

  useEffect(() => {
    const now = new Date();

    // Format date & time
    const formatted = now.toLocaleString(); // e.g. "4/8/2025, 11:42:15 AM"

    // Get time zone name
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;

    setDateTime(formatted);
    setTimeZone(tz);
  }, []);

  return (
    <div className="p-4 text-gray-800">
      <p><strong>Current Date & Time:</strong> {dateTime}</p>
      <p><strong>Time Zone:</strong> {timeZone}</p>
    </div>
  );
}

export default TimeAlert;
