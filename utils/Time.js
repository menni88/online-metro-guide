const { formatStandardError } = require("./responseModels");



module.exports.getSecondsUntilMidnight=()=>{
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0); 
    const secondsUntilMidnight = Math.floor((midnight - now) / 1000); 
    return secondsUntilMidnight;
}

module.exports.combuteSubscriptionExpiration = (req,date ,duration) => {
    let months;
    switch (duration) {
        case "month":
            months = 1;
            break;
        case "quarter":
            months = 3;
            break;
        case "year":
            months = 12;
            break;
    }
    const expireDate = addMonths(date,months).setHours(0, 0, 0, 0);
    return expireDate;
}


const addMonths = (date, months) => {
    const newDate = new Date(date);
    newDate.setMonth(newDate.getMonth() + months);
    newDate.setHours(0, 0, 0, 0);
    return newDate;
}

module.exports.getTodayTimestamp = () => {
    const now = new Date();
    return `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}`;
  };
  