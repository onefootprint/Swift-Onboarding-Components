import { customRender, screen } from '@onefootprint/test-utils';
import {
  CollectedKycDataOption,
  SupportedIdDocTypes,
} from '@onefootprint/types';
import React from 'react';

import { PersonalInformationAndDocs } from '../../../../your-playbook.types';
import PreviewWithContext from './preview.test.config';

const renderForm = (startingValues: Partial<PersonalInformationAndDocs>) => {
  customRender(<PreviewWithContext startingValues={startingValues} />);
};

describe('<Preview />', () => {
  it("should show SSN only once when we aren't showing", () => {
    renderForm({ ssn: false });
    expect(screen.getAllByText('SSN').length).toBe(1);
  });

  it('should show SSN only once when we are showing', () => {
    renderForm({ ssn: true, ssnKind: CollectedKycDataOption.ssn9 });
    expect(screen.getAllByText('SSN').length).toBe(1);
  });

  it("should show ID doc only once when we aren't showing", () => {
    renderForm({ idDoc: false });
    expect(screen.getAllByText('ID document scan').length).toBe(1);
  });

  it('should show ID doc only once when we are showing', () => {
    renderForm({
      idDoc: true,
      idDocKind: [
        SupportedIdDocTypes.idCard,
        SupportedIdDocTypes.driversLicense,
      ],
    });
    expect(screen.getAllByText('ID document scan').length).toBe(1);
  });
});
