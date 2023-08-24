import { customRender, screen } from '@onefootprint/test-utils';
import { CollectedKycDataOption } from '@onefootprint/types';
import React from 'react';

import DisplayValue, { DisplayValueProps } from './display-value';

const renderDisplayValues = ({ attributes, field }: DisplayValueProps) =>
  customRender(<DisplayValue attributes={attributes} field={field} />);

describe('<DisplayValue />', () => {
  it('should show checkmark if field is in attributes', () => {
    renderDisplayValues({
      attributes: [
        'ssn',
        CollectedKycDataOption.name,
        CollectedKycDataOption.email,
      ],
      field: CollectedKycDataOption.name,
    });
    expect(screen.getByTestId('check-icon')).toBeInTheDocument();
  });

  it('should show close icon if field is not attributes', () => {
    renderDisplayValues({
      attributes: [
        'ssn',
        CollectedKycDataOption.name,
        CollectedKycDataOption.email,
      ],
      field: CollectedKycDataOption.fullAddress,
    });
    expect(screen.getByTestId('close-icon')).toBeInTheDocument();
  });
});
