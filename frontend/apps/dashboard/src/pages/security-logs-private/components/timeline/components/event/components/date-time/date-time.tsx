import { format } from 'date-fns';

type DateTimeProps = {
  timestamp: string;
};

const DateTime = ({ timestamp }: DateTimeProps) => {
  return <div>{format(timestamp, 'MMM d, yyyy h:mm:ss a')}</div>;
};

export default DateTime;
