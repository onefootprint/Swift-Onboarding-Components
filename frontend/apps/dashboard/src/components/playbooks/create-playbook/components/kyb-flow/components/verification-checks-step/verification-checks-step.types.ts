export type VerificationChecksFormData = {
  runKyb: boolean;
  runKyc: boolean;
  kybKind: 'ein' | 'full';
  businessAml: boolean;
};
