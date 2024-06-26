const currentDate = () => {
    const today = new Date();
    const currentDay = today.getDay(); // Sunday is 0, Monday is 1, ..., Friday is 5, Saturday is 6
    const cutoffHour = 12;

    // If the day is from Monday to Friday and the current time is before 12 PM, set the date to today
    if (currentDay >= 1 && currentDay <= 5 && today.getHours() < cutoffHour) {
        today.setHours(10, 0, 0, 0);
        return today;
    }

    // If the day is from Monday to Thursday and the current time is after 12 PM, set the date to tomorrow
    if (currentDay >= 1 && currentDay <= 4 && today.getHours() >= cutoffHour) {
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        tomorrow.setHours(10, 0, 0, 0);
        return tomorrow;
    }

    // Check if it's Friday after 12 PM, Saturday, or Sunday
    if (currentDay === 5 && today.getHours() >= cutoffHour) {
        // If it's Friday after 12 PM, set the date to Monday
        const nextMonday = new Date(today);
        nextMonday.setDate(today.getDate() + 3);  // Add 3 days (Friday, Saturday, Sunday)
        nextMonday.setHours(10, 0, 0, 0);
        return nextMonday;
    } else if (currentDay === 6 || currentDay === 0) {
        // If it's Saturday or Sunday, set the date to the next Monday
        const daysUntilMonday = (currentDay === 6) ? 1 : 0;
        const nextMonday = new Date(today);
        nextMonday.setDate(today.getDate() + 1 + daysUntilMonday); // Add 1 or 2 days
        nextMonday.setHours(10, 0, 0, 0);
        return nextMonday;
    }
}

module.exports = currentDate;