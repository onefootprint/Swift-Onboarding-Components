import type { DocumentUpload } from '@onefootprint/types';
import { format } from 'date-fns';

const getTimestampRange = (uploads: DocumentUpload[]) => {
  const timestamps = uploads.map(upload => new Date(upload.timestamp).getTime());
  const earliest = new Date(Math.min(...timestamps));
  const latest = new Date(Math.max(...timestamps));

  const earliestDate = format(earliest, 'MM/dd/yy');
  const latestDate = format(latest, 'MM/dd/yy');
  const earliestTime = format(earliest, 'h:mma');
  const latestTime = format(latest, 'h:mma');

  if (earliestDate === latestDate) {
    return earliestTime === latestTime
      ? `${earliestDate} ${earliestTime}`
      : `${earliestDate} ${earliestTime} - ${latestTime}`;
  }
  return `${earliestDate} ${earliestTime} - ${latestDate} ${latestTime}`;
};

export default getTimestampRange;
