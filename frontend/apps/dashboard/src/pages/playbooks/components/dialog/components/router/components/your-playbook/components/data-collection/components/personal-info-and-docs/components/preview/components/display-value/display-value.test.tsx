import { customRender, screen } from '@onefootprint/test-utils';
import {
  CollectedKycDataOption,
  SupportedIdDocTypes,
} from '@onefootprint/types';
import React from 'react';

import {
  defaultValuesKYC,
  PersonalInformationAndDocs,
} from '../../../../../../../../your-playbook.types';
import DisplayValue from './display-value';

type DisplayValueProps = {
  field: keyof PersonalInformationAndDocs;
  personalInfoAndDocs: Partial<PersonalInformationAndDocs>;
};

const renderDisplayValue = ({
  field,
  personalInfoAndDocs,
}: DisplayValueProps) => {
  customRender(
    <DisplayValue
      field={field as keyof PersonalInformationAndDocs}
      personalInfoAndDocs={{
        ...defaultValuesKYC.personalInformationAndDocs,
        ...personalInfoAndDocs,
      }}
    />,
  );
};

describe('<DisplayValue />', () => {
  it('should render details for address', () => {
    renderDisplayValue({
      field: CollectedKycDataOption.fullAddress,
      personalInfoAndDocs: {
        [CollectedKycDataOption.fullAddress]: true,
      },
    });
    expect(
      screen.getByText('Address line, Zip code, City, State'),
    ).toBeInTheDocument();
  });

  it("should render 'Full' for full SSN", () => {
    renderDisplayValue({
      field: 'ssnKind',
      personalInfoAndDocs: {
        ssn: true,
        ssnKind: CollectedKycDataOption.ssn9,
      },
    });
    expect(screen.getByText('Full')).toBeInTheDocument();
  });

  it("should render 'Last 4' for partial SSN", () => {
    renderDisplayValue({
      field: 'ssnKind',
      personalInfoAndDocs: {
        ssn: true,
        ssnKind: CollectedKycDataOption.ssn4,
      },
    });
    expect(screen.getByText('Last 4')).toBeInTheDocument();
  });

  it('should render close icon for no SSN', () => {
    renderDisplayValue({
      field: 'ssn',
      personalInfoAndDocs: {
        ssn: false,
      },
    });
    expect(screen.getByTestId('close-icon')).toBeInTheDocument();
  });

  it('should display single ID doc kind properly', () => {
    renderDisplayValue({
      field: 'idDocKind',
      personalInfoAndDocs: {
        idDoc: true,
        idDocKind: [SupportedIdDocTypes.driversLicense],
      },
    });
    expect(screen.getByText("Driver's license")).toBeInTheDocument();
  });

  it('should display multiple ID docs properly', () => {
    renderDisplayValue({
      field: 'idDocKind',
      personalInfoAndDocs: {
        idDoc: true,
        idDocKind: [
          SupportedIdDocTypes.driversLicense,
          SupportedIdDocTypes.passport,
          SupportedIdDocTypes.idCard,
        ],
      },
    });
    expect(
      screen.getByText("Driver's license, Passport, Identity card"),
    ).toBeInTheDocument();
  });

  it('should render check icon for included property', () => {
    renderDisplayValue({
      field: CollectedKycDataOption.nationality,
      personalInfoAndDocs: {
        [CollectedKycDataOption.nationality]: true,
      },
    });
    expect(screen.getByTestId('check-icon')).toBeInTheDocument();
  });
});
