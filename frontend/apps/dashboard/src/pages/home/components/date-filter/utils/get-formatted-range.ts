import { format } from 'date-fns';

const getFormattedRange = (start: Date, end: Date): string => {
  const startText = format(start, 'MMM d');
  const endText = format(end, 'MMM d');

  return `${startText} \u2013 ${endText}`;
};

export default getFormattedRange;
