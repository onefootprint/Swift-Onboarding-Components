export type RiskSignal = {
  id: string;
  severity: 'low' | 'medium' | 'high';
  scope: string;
  note: string;
  noteDetails: string;
};
