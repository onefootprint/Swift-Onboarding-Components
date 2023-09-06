import { customRender, screen } from '@onefootprint/test-utils';
import React from 'react';

import {
  defaultPlaybookValuesKYB,
  defaultPlaybookValuesKYC,
  Kind,
} from '@/playbooks/utils/machine/types';

import type { DataCollectionWithContextProps } from './data-collection.test.config';
import DataCollectionWithContext from './data-collection.test.config';

const renderDataCollection = ({
  startingValues,
  kind,
}: DataCollectionWithContextProps) => {
  customRender(
    <DataCollectionWithContext kind={kind} startingValues={startingValues} />,
  );
};
describe('<DataCollection />', () => {
  it('should show investor profile questions in KYC', async () => {
    renderDataCollection({ kind: Kind.KYC });
    expect(screen.getByText('Investor profile questions')).toBeInTheDocument();
  });

  it('should not show investor profile questions in KYB', async () => {
    renderDataCollection({
      kind: Kind.KYB,
      startingValues: {
        ...defaultPlaybookValuesKYC,
        businessInformation: defaultPlaybookValuesKYB.businessInformation,
      },
    });
    expect(
      screen.queryByText('Investor profile questions'),
    ).not.toBeInTheDocument();
  });

  it('should show BO info alert for KYB', async () => {
    renderDataCollection({
      kind: Kind.KYB,
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
    renderDataCollection({ kind: Kind.KYC });
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(
      screen.queryByText(
        'Only a beneficial owner can verify a business. A beneficial owner is anyone who owns at least 25% of the business.',
      ),
    ).not.toBeInTheDocument();
  });
});
