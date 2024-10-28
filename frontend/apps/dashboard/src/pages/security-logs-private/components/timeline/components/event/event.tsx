import type { AccessEvent } from '@onefootprint/types';
import DateTime from './components/date-time';
import PrincipalActor from './components/principal-actor';

const Event = ({ accessEvent }: { accessEvent: AccessEvent }) => {
  const { principal, timestamp, insightEvent } = accessEvent;
  return (
    <div>
      <DateTime timestamp={timestamp} />
      <PrincipalActor principal={principal} insightEvent={insightEvent} />
    </div>
  );
};

export default Event;
