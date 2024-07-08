type CompareTableContent = {
  featureId: string;
  footprint: boolean;
  alloy?: boolean;
  plaid?: boolean;
  onfido?: boolean;
  persona?: boolean;
};

const compareTableContent: CompareTableContent[] = [
  {
    featureId: 'kyc',
    footprint: true,
    alloy: true,
    plaid: true,
    onfido: true,
    persona: true,
  },
  {
    featureId: 'kyb',
    footprint: true,
    alloy: true,
    persona: true,
  },
  {
    featureId: 'dynamic-doc-scan',
    footprint: true,
    persona: true,
    plaid: true,
    onfido: true,
  },
  {
    featureId: 'frontend-flow',
    footprint: true,
    persona: true,
    plaid: true,
    onfido: true,
  },
  {
    featureId: 'behavioral-location-fraud',
    footprint: true,
    persona: true,
    plaid: true,
  },
  {
    featureId: 'customizable-elements',
    footprint: true,
  },
  {
    featureId: 'synthetic-fraud',
    footprint: true,
    alloy: true,
  },
  {
    featureId: 'bank-compliance-dashboard',
    footprint: true,
    alloy: true,
  },
  {
    featureId: 'custom-doc-upload',
    footprint: true,
  },
  {
    featureId: 'app-clip-doc-scan',
    footprint: true,
  },
  {
    featureId: 'passkey-auth',
    footprint: true,
  },
  {
    featureId: 'secure-data-vaulting',
    footprint: true,
  },
  {
    featureId: 'secure-data-proxying',
    footprint: true,
  },
];

export default compareTableContent;
