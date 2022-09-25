import { InsightEvent } from '@onefootprint/types';

const getRegionForInsightEvent = (event: InsightEvent) =>
  event.city && event.region
    ? `${event.city}, ${event.region}`
    : event.city || event.region;

export default getRegionForInsightEvent;
