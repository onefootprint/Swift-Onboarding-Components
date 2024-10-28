import type { AccessEvent } from '@onefootprint/types';
import Event from './components/event';

const Timeline = ({ accessEvents }: { accessEvents: AccessEvent[] }) => {
  return (
    <div>
      {accessEvents.map(accessEvent => (
        <Event key={accessEvent.id} accessEvent={accessEvent} />
      ))}
    </div>
  );
};

export default Timeline;
