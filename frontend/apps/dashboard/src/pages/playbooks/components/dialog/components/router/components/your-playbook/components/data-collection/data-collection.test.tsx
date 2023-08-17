import { customRender, screen } from '@onefootprint/test-utils';
import React from 'react';

import {
  defaultValuesKYB,
  defaultValuesKYC,
  Kind,
} from '../../your-playbook.types';
import DataCollectionWithContext, {
  DataCollectionWithContextProps,
} from './data-collection.test.config';

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
        ...defaultValuesKYC,
        businessInformation: defaultValuesKYB.businessInformation,
      },
    });
    expect(
      screen.queryByText('Investor profile questions'),
    ).not.toBeInTheDocument();
  });
});
