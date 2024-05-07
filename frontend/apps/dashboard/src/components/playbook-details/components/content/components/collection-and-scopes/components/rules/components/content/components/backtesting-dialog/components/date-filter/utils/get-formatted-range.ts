import { format } from 'date-fns';

import type { DateFilterRange } from '../../../backtesting-dialog.types';

const getFormattedRange = (range: DateFilterRange): string => {
  const { startDate, endDate } = range;
  if (!startDate || !endDate) {
    return '';
  }

  const startText =
    startDate.getFullYear() === endDate.getFullYear()
      ? format(startDate, 'MMM dd')
      : format(startDate, 'MMM dd, yyyy');
  const endText = format(endDate, 'MMM dd, yyyy');

  return `${startText} \u2013 ${endText}`;
};

export default getFormattedRange;
