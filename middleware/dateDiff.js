function dateDifference(postDate) {
    const currentDate = new Date();

    const seconds = Math.floor((currentDate - postDate) / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(seconds / (60 * 60));
    const days = Math.floor(seconds / (60 * 60 * 24));
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    var dateText = '';
    if (years > 0) {
        dateText = `${years} year${years > 1 ? 's':''} ago`;
    } else if (months > 0) {
        dateText = `${months} month${months > 1 ? 's':''} ago`;
    } else if (days > 0) {
        dateText = `${days} day${days > 1 ? 's':''} ago`;
    } else if (hours > 0) {
        dateText = `${hours} hour${hours > 1 ? 's':''} ago`;
    } else if (minutes > 0) {
        dateText = `${minutes} minute${minutes > 1 ? 's':''} ago`;
    } else {
        dateText = `${seconds} second${seconds > 1 ? 's':''} ago`;
    }
    return dateText;
}

module.exports = dateDifference;