type CompareTableContent = {
  featureId: string;
  footprint: boolean;
  alloy: boolean;
  plaid: boolean;
  onfido: boolean;
};

const compareTableContent: CompareTableContent[] = [
  {
    featureId: 'database-kyc',
    footprint: true,
    alloy: true,
    plaid: true,
    onfido: true,
  },
  {
    featureId: 'tokenization',
    footprint: true,
    alloy: false,
    plaid: true,
    onfido: true,
  },
  {
    featureId: 'document-kyc',
    footprint: true,
    alloy: false,
    plaid: true,
    onfido: false,
  },
  {
    featureId: 'customizable-ui',
    footprint: true,
    alloy: true,
    plaid: false,
    onfido: false,
  },
  {
    featureId: 'fraud-detection',
    footprint: true,
    alloy: false,
    plaid: false,
    onfido: false,
  },
  {
    featureId: 'step-ups',
    footprint: true,
    alloy: false,
    plaid: false,
    onfido: false,
  },
  {
    featureId: 'device-insights',
    footprint: true,
    alloy: false,
    plaid: false,
    onfido: false,
  },
  {
    featureId: 'custom-documents-uploads',
    footprint: true,
    alloy: false,
    plaid: false,
    onfido: false,
  },
  {
    featureId: 'data-vault',
    footprint: true,
    alloy: false,
    plaid: false,
    onfido: false,
  },
  {
    featureId: 'data-proxy',
    footprint: true,
    alloy: false,
    plaid: false,
    onfido: false,
  },
  {
    featureId: 'seamless-integration',
    footprint: true,
    alloy: true,
    plaid: false,
    onfido: true,
  },
];

export default compareTableContent;
