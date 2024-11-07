export type TrackingProps = {
  utmCampaign?: string;
  utmContent?: string;
  utmMedium?: string;
  utmSource?: string;
  utmTerm?: string;
};

export const defaultTracking = {
  utmCampaign: undefined,
  utmContent: undefined,
  utmMedium: undefined,
  utmSource: undefined,
  utmTerm: undefined,
};

export type TrackingStorageState = {
  data: TrackingProps;
  update: (data: Partial<TrackingProps>) => void;
  reset: () => void;
};
