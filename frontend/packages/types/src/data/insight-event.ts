export type InsightEvent = {
  city: string | null;
  country: string | null;
  ipAddress: string | null;
  latitude: number | null;
  longitude: number | null;
  metroCode: string | null;
  postalCode: string | null;
  region: string | null;
  regionName: string | null;
  timeZone: string | null;
  userAgent: string | null;
  timestamp: string;
  sessionId?: string;
};
