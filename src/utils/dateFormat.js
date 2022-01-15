// Converts the date of the joined field of the Author model to a more readable format
const convertDateFormat = (givenDate) => {
    let date = givenDate

    const [day, month, year, hours, minutes, seconds] = [
        date.getDate(),
        date.getMonth() + 1,
        date.getFullYear(),
        date.getHours(),
        date.getMinutes(),
        date.getSeconds()
    ]
    const stringDate = `${day}-${month}-${year} at ${hours}:${minutes}:${seconds}`
    return stringDate
}

module.exports = convertDateFormat