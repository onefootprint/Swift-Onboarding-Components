export type Aml = {
  enhancedAml: boolean;
  ofac: boolean;
  pep: boolean;
  adverseMedia: boolean;
  hasOptionSelected?: boolean;
};

export type VerificationChecksFormData = {
  aml: Aml;
  runKyc: boolean;
  isNeuroEnabled: boolean;
  isSentilinkEnabled: boolean;
};
