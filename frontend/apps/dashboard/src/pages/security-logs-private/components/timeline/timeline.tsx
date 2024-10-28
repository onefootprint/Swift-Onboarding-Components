import type { AccessEvent } from '@onefootprint/types';

const Timeline = ({ accessEvents }: { accessEvents: AccessEvent[] }) => {
  return (
    <div>
      {accessEvents.map(accessEvent => (
        <div key={accessEvent.id}>{JSON.stringify(accessEvent)}</div>
      ))}
    </div>
  );
};

export default Timeline;
