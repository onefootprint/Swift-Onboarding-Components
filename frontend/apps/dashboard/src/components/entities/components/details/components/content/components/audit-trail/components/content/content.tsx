import type { Timeline } from '@onefootprint/types';

import type { WithEntityProps } from '@/entity/components/with-entity';

import AuditTrailTimeline from './components/audit-trail-timeline';

type ContentProps = WithEntityProps & {
  timeline: Timeline;
};
const Content = ({ timeline, entity }: ContentProps) => <AuditTrailTimeline entity={entity} timeline={timeline} />;

export default Content;
