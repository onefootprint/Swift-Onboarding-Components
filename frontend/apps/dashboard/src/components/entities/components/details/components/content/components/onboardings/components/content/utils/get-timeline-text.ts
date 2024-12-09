import { format } from 'date-fns';

const getTimestampText = (ts: string) => format(new Date(ts), 'M/d/yyyy, hh:mm a');

export default getTimestampText;
