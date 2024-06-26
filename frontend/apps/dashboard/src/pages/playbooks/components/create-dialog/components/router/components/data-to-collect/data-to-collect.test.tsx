import { customRender, screen } from '@onefootprint/test-utils';
import React from 'react';

import { PlaybookKind, defaultPlaybookValuesKYB, defaultPlaybookValuesKYC } from '@/playbooks/utils/machine/types';

import type { DataCollectionWithContextProps } from './data-to-collect.test.config';
import DataCollectionWithContext from './data-to-collect.test.config';

const renderDataToCollect = ({ startingValues, kind }: DataCollectionWithContextProps) => {
  customRender(<DataCollectionWithContext kind={kind} startingValues={startingValues} />);
};

describe('<DataToCollect />', () => {
  it('should show investor profile questions in KYC', async () => {
    renderDataToCollect({ kind: PlaybookKind.Kyc });
    expect(screen.getByText('Investor profile questions')).toBeInTheDocument();
  });

  it('should not show investor profile questions in KYB', async () => {
    renderDataToCollect({
      kind: PlaybookKind.Kyb,
      startingValues: {
        ...defaultPlaybookValuesKYC,
        businessInformation: defaultPlaybookValuesKYB.businessInformation,
      },
    });
    expect(screen.queryByText('Investor profile questions')).not.toBeInTheDocument();
  });

  it('should show BO info alert for KYB', async () => {
    renderDataToCollect({
      kind: PlaybookKind.Kyb,
      startingValues: {
        ...defaultPlaybookValuesKYC,
        businessInformation: defaultPlaybookValuesKYB.businessInformation,
      },
    });
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Only a beneficial owner can verify a business. A beneficial owner is anyone who owns at least 25% of the business.',
      ),
    ).toBeInTheDocument();
  });

  it('should not show BO info alert for KYC', async () => {
    renderDataToCollect({ kind: PlaybookKind.Kyc });
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(
      screen.queryByText(
        'Only a beneficial owner can verify a business. A beneficial owner is anyone who owns at least 25% of the business.',
      ),
    ).not.toBeInTheDocument();
  });
});
