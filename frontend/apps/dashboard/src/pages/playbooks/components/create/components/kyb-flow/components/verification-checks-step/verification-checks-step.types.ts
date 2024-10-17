export type Aml = {
  enhancedAml: boolean;
  ofac: boolean;
  pep: boolean;
  adverseMedia: boolean;
  hasOptionSelected?: boolean;
};

export type VerificationChecksFormData = {
  runKyb: boolean;
  runKyc: boolean;
  kybKind: 'ein' | 'full';
  aml: Aml;
};
