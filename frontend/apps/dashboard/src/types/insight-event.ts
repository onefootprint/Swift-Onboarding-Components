export type InsightEvent = {
  city?: string;
  country?: string;
  ipAddress?: string;
  latitude?: number;
  longitude?: number;
  metroCode?: string;
  postalCode?: string;
  region?: string;
  regionName?: string;
  timeZone?: string;
  timestamp: string;
  userAgent?: string;
};

export const getRegionForInsightEvent = (event: InsightEvent) =>
  event.city && event.region
    ? `${event.city}, ${event.region}`
    : event.city || event.region;
