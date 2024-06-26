import { customRender, screen } from '@onefootprint/test-utils';
import { CollectedKybDataOption } from '@onefootprint/types';
import React from 'react';

import type { BusinessInformation } from '@/playbooks/utils/machine/types';
import { defaultBusinessInformation } from '@/playbooks/utils/machine/types';

import DisplayValue from './display-value';

type DisplayValueProps = {
  field: keyof BusinessInformation;
  businessInformation: Partial<BusinessInformation>;
};

const renderDisplayValue = ({ field, businessInformation }: DisplayValueProps) => {
  customRender(
    <DisplayValue
      field={field as keyof BusinessInformation}
      businessInformation={{
        ...defaultBusinessInformation,
        ...businessInformation,
      }}
    />,
  );
};

describe('<DisplayValue />', () => {
  it('should render close icon for non included property', () => {
    renderDisplayValue({
      field: CollectedKybDataOption.phoneNumber,
      businessInformation: {
        [CollectedKybDataOption.phoneNumber]: false,
      },
    });
    expect(screen.getByTestId('close-icon')).toBeInTheDocument();
  });

  it('should render check icon for included property', () => {
    renderDisplayValue({
      field: CollectedKybDataOption.phoneNumber,
      businessInformation: {
        [CollectedKybDataOption.phoneNumber]: true,
      },
    });
    expect(screen.getByTestId('check-icon')).toBeInTheDocument();
  });
});
