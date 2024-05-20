import type { ButtonProps } from '@onefootprint/ui';

import { Plans } from './plans-table-types';

const PlansDetails = [
  {
    title: Plans.startup,
    id: Plans.startup,
    price: {
      monthly: undefined,
      yearly: undefined,
    },
    features: [
      {
        translation: 'kyc',
        soon: false,
      },
      {
        translation: 'id-doc',
        soon: false,
      },
      {
        translation: 'manual-review',
        soon: false,
      },
      {
        translation: 'passkeys',
        soon: false,
      },
      {
        translation: 'audit-logs',
        soon: false,
      },
      {
        translation: 'sms-otp',
        soon: false,
      },
      {
        translation: 'pii',
        soon: false,
      },
      {
        translation: 'compute-environment',
        soon: false,
      },
      {
        translation: 'encryption',
        soon: false,
      },
    ],
    buttonLabel: 'cta',
    buttonVariant: 'secondary' as ButtonProps['variant'],
  },
  {
    title: Plans.growth,
    id: Plans.growth,
    price: undefined,
    features: [
      {
        translation: 'behavioral-risks',
        soon: false,
      },
      {
        translation: 'step-up',
        soon: false,
      },
      {
        translation: 'kyb',
        soon: false,
      },
      {
        translation: 'customization',
        soon: false,
      },
      {
        translation: 'rules-engine',
        soon: false,
      },
      {
        translation: 'international',
        soon: false,
      },
      {
        translation: 'pci-compliant',
        soon: false,
      },
      {
        translation: 'manual-review',
        soon: false,
      },
      {
        translation: 'custom-data-vaulting',
        soon: false,
      },
      {
        translation: 'aml-monitoring',
        soon: false,
      },
      {
        translation: 'itin-verification',
        soon: true,
      },
      {
        translation: 'eCBSV',
        soon: true,
      },
    ],
    buttonLabel: 'cta',
    buttonVariant: 'primary' as ButtonProps['variant'],
  },
  {
    title: Plans.enterprise,
    id: Plans.enterprise,
    price: undefined,
    features: [
      {
        translation: 'rbac-iam',
        soon: false,
      },
      {
        translation: 'app-clip',
        soon: false,
      },
      {
        translation: 'device-attestation',
        soon: false,
      },
      {
        translation: 'localization',
        soon: false,
      },
      {
        translation: 'complete-auth',
        soon: false,
      },
      {
        translation: 'compliance-view',
        soon: false,
      },
      {
        translation: 'white-glove-support',
        soon: false,
      },
      {
        translation: 'custom-alerts',
        soon: false,
      },
      {
        translation: 'kyc',
        soon: false,
      },
      {
        translation: 'waterfall',
        soon: false,
      },
      {
        translation: 'saml-sso',
        soon: false,
      },
      {
        translation: 'sna',
        soon: true,
      },
      {
        translation: 'SFTP',
        soon: true,
      },
    ],
    buttonLabel: 'cta',
    buttonVariant: 'secondary' as ButtonProps['variant'],
  },
];

export default PlansDetails;
