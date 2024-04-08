import { format } from 'date-fns';

const getFormattedRange = (start: Date, end: Date): string => {
  const startText = format(start, 'MMM dd, yyyy');
  const endText = format(end, 'MMM dd, yyyy');

  return `${startText} \u2013 ${endText}`;
};

export default getFormattedRange;
