function timeAgo(dateTimeStr) {
    if (!dateTimeStr) return '';

    const [dateStr, timeStr] = dateTimeStr.split(' ');
    const [year, month, day] = dateStr.split('-').map(Number);
    const [hours, minutes, seconds] = timeStr.split(':').map(Number);

    const dateObj = new Date(year, month - 1, day, hours, minutes, seconds);
    if (isNaN(dateObj.getTime())) return ''; // Checking for an incorrect date

    const now = new Date();
    const diff = now - dateObj; // Time difference in milliseconds

    const secondsDiff = Math.floor(diff / 1000);
    const minutesDiff = Math.floor(secondsDiff / 60);
    const hoursDiff = Math.floor(minutesDiff / 60);
    const daysDiff = Math.floor(hoursDiff / 24);

    if (daysDiff > 0) {
        return `${daysDiff} days ago`;
    } else if (hoursDiff > 0) {
        return `${hoursDiff} hours ago`;
    } else if (minutesDiff > 0) {
        return `${minutesDiff} minutes ago`;
    } else {
        return `${secondsDiff} seconds ago`;
    }
}

module.exports = {
    timeAgo
};
