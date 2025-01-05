export const getCurrentTime = () => {
  const utcTime = new Date();
  const mylocalTime = utcTime.toLocaleString('en-Us', {
    timeZone: 'Asia/kolkata',
  });
  return mylocalTime;
};
