export type Page =
  | 'additional-info-required'
  | 'transfer'
  | 'kyc-data'
  | 'kyb-data'
  | 'id-doc'
  | 'liveness'
  | 'authorize';

export type SDKIntegrationProps = {
  fpAuthToken: string;
  page: Page;
};
