// server/utils/dateHelpers.js

const getManilaDate = () => {
  // 1. Get current time
  const now = new Date();
  
  // 2. Convert to a string specifically in Manila time
  const manilaTime = now.toLocaleString("en-US", { timeZone: "Asia/Manila" });
  
  // 3. Create a new Date object from that string
  // This "tricks" the system into thinking the current Manila time is the local time
  return new Date(manilaTime);
};

const getTodaysDay = () => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const manilaDate = getManilaDate();
  return days[manilaDate.getDay()];
};

const getCurrentTime = () => {
  const manilaDate = getManilaDate();
  const hours = manilaDate.getHours().toString().padStart(2, '0');
  const minutes = manilaDate.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

module.exports = { getManilaDate, getTodaysDay, getCurrentTime };