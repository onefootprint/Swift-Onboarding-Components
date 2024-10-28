import type { AccessEvent } from '@onefootprint/types';
import DateTime from './components/date-time';

const Event = ({ accessEvent }: { accessEvent: AccessEvent }) => {
  return (
    <div>
      <DateTime timestamp={accessEvent.timestamp} />
      <div>{accessEvent.id}</div>
    </div>
  );
};

export default Event;
