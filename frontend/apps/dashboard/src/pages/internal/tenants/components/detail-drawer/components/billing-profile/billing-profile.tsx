import type { TenantDetail } from '@onefootprint/types';
import { Stack } from '@onefootprint/ui';
import React from 'react';
import { Field, Fieldset } from 'src/components';

type BillingProfileProps = {
  tenant: TenantDetail;
};

const BillingProfile = ({ tenant }: BillingProfileProps) => {
  const bp = tenant.billingProfile;

  const kyc = [
    {
      title: 'KYC',
      content: bp?.kyc,
    },
    {
      title: 'One-click KYC',
      content: bp?.oneClickKyc,
    },
    {
      title: 'KYC Waterfall (second vendor)',
      content: bp?.kycWaterfallSecondVendor,
    },
    {
      title: 'KYC Waterfall (third vendor)',
      content: bp?.kycWaterfallThirdVendor,
    },
  ];

  const otherVerifications = [
    {
      title: 'ID documents',
      content: bp?.idDocs,
    },
    {
      title: 'KYB',
      content: bp?.kyb,
    },
  ];

  const vaulting = [
    {
      title: 'Monthly PII',
      content: bp?.pii,
    },
    {
      title: 'Hot vaults',
      content: bp?.hotVaults,
    },
    {
      title: 'Hot proxy vaults',
      content: bp?.hotProxyVaults,
    },
    {
      title: 'Monthly vaults with PCI',
      content: bp?.vaultsWithPci,
    },
    {
      title: 'Monthly vaults with Non-PCI',
      content: bp?.vaultsWithNonPci,
    },
  ];

  const watchlist = [
    {
      title: 'Monthly Watchlist',
      content: bp?.watchlist,
    },
    {
      title: 'Adverse media (per user)',
      content: bp?.adverseMediaPerUser,
    },
    {
      title: 'Continuous monitoring (per year)',
      content: bp?.continuousMonitoringPerYear,
    },
  ];

  const other = [
    {
      title: 'Monthly minimum',
      content: bp?.monthlyMinimum,
    },
  ];

  const sections = [
    {
      title: 'KYC',
      fields: kyc,
    },
    {
      title: 'Other verifications',
      fields: otherVerifications,
    },
    {
      title: 'Vaulting',
      fields: vaulting,
    },
    {
      title: 'Watchlist monitoring',
      fields: watchlist,
    },
    {
      title: 'Other',
      fields: other,
    },
  ];

  const priceDisplay = (value?: string) => (value ? `${value} cents` : '-');

  return (
    <Stack direction="column">
      {sections.map(section => (
        <Fieldset title={section.title} key={section.title}>
          <Stack direction="column" gap={5}>
            {section.fields.map(f => (
              <Field label={f.title} key={f.title}>
                {priceDisplay(f.content)}
              </Field>
            ))}
          </Stack>
        </Fieldset>
      ))}
    </Stack>
  );
};

export default BillingProfile;
