import { subMonths } from 'date-fns';

import type { DateFilterRange } from '../../../backtesting-dialog.types';

const DEFAULT_DATE_RANGE: DateFilterRange = {
  startDate: subMonths(new Date(), 1),
  endDate: new Date(),
};

export default DEFAULT_DATE_RANGE;
