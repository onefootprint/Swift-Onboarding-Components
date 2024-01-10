import type { ButtonProps } from '@onefootprint/ui';

import { Plans } from './plans-table-types';

const PlansDetails = [
  {
    title: Plans.startup,
    id: Plans.startup,
    price: {
      monthly: 500,
      yearly: 5000,
    },
    features: [
      'kyc',
      'id-doc',
      'manual-review',
      'passkeys',
      'sms-otp',
      'aml-monitoring',
      'pii',
      'compute-environment',
      'encryption',
    ],
    buttonLabel: 'cta',
    buttonVariant: 'secondary' as ButtonProps['variant'],
  },
  {
    title: Plans.growth,
    id: Plans.growth,
    price: {
      monthly: 1750,
      yearly: 20000,
    },
    features: [
      'behavioral-risks',
      'audit-logs',
      'step-up',
      'kyb',
      'rules-engine',
      'international',
      'pci-compliant',
      'manual-review',
      'custom-data-vaulting',
      'itin-verification',
      'eCBSV',
    ],
    buttonLabel: 'cta',
    buttonVariant: 'primary' as ButtonProps['variant'],
  },
  {
    title: Plans.enterprise,
    id: Plans.enterprise,
    price: undefined,
    features: [
      'rbac-iam',
      'app-clip',
      'device-attestation',
      'Localization',
      'complete-auth',
      'compliance-view',
      'customization',
      'white-glove-support',
      'custom-alerts',
      'kyc',
      'waterfall',
      'saml-sso',
      'sna',
      'SFTP',
    ],
    buttonLabel: 'cta',
    buttonVariant: 'secondary' as ButtonProps['variant'],
  },
];

export default PlansDetails;
