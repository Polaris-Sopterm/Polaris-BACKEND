/**
 * 해당 날짜가 월의 몇주차인지 계산
 * @param {Date} journeyDate
 * @returns {{month: number, year: number, weekNo: number}|{month: number, year: number, weekNo}|*|
 * {month: number, year: number, weekNo: number}}
 */
const getWeekOfMonthByIso8601 = (journeyDate) => {
  const year = journeyDate.getFullYear();
  const month = journeyDate.getMonth() + 1;
  const date = journeyDate.getDate();

  const firstDate = new Date(year, month - 1, 1);
  const lastDate = new Date(year, month, 0);

  // 월:1, 화:2, ..., 일:7
  const firstDateDay = firstDate.getDay() === 0 ? 7 : firstDate.getDay();
  const lastDateDay = lastDate.getDay() === 0 ? 7 : lastDate.getDay();

  // 월의 마지막 날이 포함된 주가 목요일을 포함하지 않아 다음 달의 첫째 주가 되는 경우
  if (lastDateDay < 4 && date > lastDate.getDate() - lastDateDay) {
    return { year, month: month + 1, weekNo: 1 };
  }

  // 1일이 목요일 이후인 경우
  if (firstDateDay > 4) {
    // journeyDate의 날짜가 1일을 포함한 주의 마지막 날짜보다 큰 경우
    if (date > 7 - firstDateDay + 1) {
      return {
        year,
        month,
        weekNo: Math.ceil((date + firstDateDay - 1) / 7) - 1,
      };
    }

    // 해당 경우에서 1일을 포함한 주는 전 월의 마지막 주에 해당된다.
    return month === 1
      ? getWeekOfMonthByIso8601(new Date(year - 1, 11, 31))
      : getWeekOfMonthByIso8601(new Date(year, month - 1, 0));
  }

  // 1일이 목요일 이전인 경우
  return { year, month, weekNo: Math.ceil((date + firstDateDay - 1) / 7) };
};

/**
 * 해당 주에 포함된 목요일 날짜 계산
 * @param {number} year
 * @param {number} month
 * @param {number} weekNo
 * @returns {thursdayDate: number, thursdayMonth: number, thursdayYear: number}
 */
const getThursdayFromWeekNo = (year, month, weekNo) => {
  const firstDate = new Date(year, month - 1, 1);

  // 월:1, 화:2, ..., 일:7
  const firstDateDay = firstDate.getDay() === 0 ? 7 : firstDate.getDay();

  const firstThursdayDate = firstDateDay <= 4 ? 1 + (4 - firstDateDay) : 1 - (firstDateDay - 4) + 7;

  return firstThursdayDate + (weekNo - 1) * 7;
};

module.exports = {
  getWeekOfMonthByIso8601,
  getThursdayFromWeekNo,
};
