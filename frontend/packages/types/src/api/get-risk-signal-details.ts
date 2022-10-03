export type RiskSignalDetails = {
  id: string;
  severity: 'low' | 'medium' | 'high';
  scope: string;
  note: string;
  noteDetails: string;
  dataVendor: string;
  relatedSignals: RiskSignalDetails[];
  rawResponse: string;
};
