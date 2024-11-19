export type Aml = {
  enhancedAml: boolean;
};

export type VerificationChecksFormData = {
  runKyb: boolean;
  runKyc: boolean;
  kybKind: 'ein' | 'full';
  aml: Aml;
};
