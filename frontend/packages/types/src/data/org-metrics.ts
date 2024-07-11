export type OrgMetricsResponse = {
  user: OrgMetrics;
  business: OrgMetrics;
};

export type OrgMetrics = {
  newVaults: number;
  totalOnboardings: number;
  passOnboardings: number;
  failOnboardings: number;
  incompleteOnboardings: number;
};
