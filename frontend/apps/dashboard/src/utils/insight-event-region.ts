import type { InsightEvent } from '@onefootprint/types';

const getRegionForInsightEvent = (event: InsightEvent) =>
  event.city && event.region ? `${decodeURIComponent(event.city)}, ${event.region}` : event.city || event.region;

export default getRegionForInsightEvent;
