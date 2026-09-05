import { format, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';

export const getTodayStr = () => format(new Date(), 'yyyy-MM-dd');

export const getMonthDays = (date: Date) => {
  const start = startOfMonth(date);
  const end = endOfMonth(date);
  return eachDayOfInterval({ start, end });
};

export const formatDateStr = (date: Date) => format(date, 'yyyy-MM-dd');

export const getWeekNumber = (date: Date) => {
  const day = date.getDate();
  if (day <= 7) return 1;
  if (day <= 14) return 2;
  if (day <= 21) return 3;
  return 4;
};

export const isFutureDate = (date: string | Date) => {
  const dateStr = typeof date === 'string' ? date : format(date, 'yyyy-MM-dd');
  return dateStr > getTodayStr();
};
