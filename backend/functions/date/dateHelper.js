class DateHelper {
    static validate(dateString) {
        const [day, month] = dateString.split('/').map(Number);
        if (isNaN(day) || isNaN(month)) return false;

        const date = new Date();
        date.setFullYear(new Date().getFullYear());
        date.setMonth(month - 1);
        date.setDate(day);

        if (date.getDate() === day && date.getMonth() === month - 1) {
            return `${date.getDate()}/${date.getMonth() + 1}`;
        } else {
            return false;
        }
    }

    static isPastDate(dateString) {
        const [day, month] = dateString.split('/').map(Number);
        const currentDateString = this.getCurrent();
        const [currentDay, currentMonth] = currentDateString.split('/').map(Number);

        if (month < currentMonth || (month === currentMonth && day < currentDay)) {
            return true;
        }
        return false;
    }

    static sum(dateString, daysToSum) {
        let [day, month] = dateString.split('/').map(Number);

        const date = new Date();
        date.setFullYear(new Date().getFullYear());
        date.setMonth(month - 1);
        date.setDate(day);
        date.setDate(date.getDate() + daysToSum);

        return `${date.getDate()}/${date.getMonth() + 1}`;
    }

    static getCurrent() {
        const date = new Date();
        return `${date.getDate()}/${date.getMonth() + 1}`;
    }
}

module.exports = DateHelper;
