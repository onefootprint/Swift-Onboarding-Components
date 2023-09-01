import { customRender, screen, userEvent } from '@onefootprint/test-utils';
import {
  CollectedKycDataOption,
  SupportedIdDocTypes,
} from '@onefootprint/types';
import React from 'react';

import {
  defaultPlaybookValuesKYC,
  PersonalInformationAndDocs,
} from '@/playbooks/utils/machine/types';

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
        ...defaultPlaybookValuesKYC.personalInformationAndDocs,
        ...personalInfoAndDocs,
      }}
    />,
  );
};

describe('<DisplayValue />', () => {
  it('should render details for shown address normally', () => {
    renderDisplayValue({
      field: CollectedKycDataOption.address,
      personalInfoAndDocs: {
        [CollectedKycDataOption.address]: true,
      },
    });
    expect(screen.getByTestId('check-icon')).toBeInTheDocument();
  });

  it('should render details for non-shown address normally', () => {
    renderDisplayValue({
      field: CollectedKycDataOption.address,
      personalInfoAndDocs: {
        [CollectedKycDataOption.address]: false,
      },
    });
    expect(screen.getByTestId('close-icon')).toBeInTheDocument();
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

  it('should display 2 ID docs properly', () => {
    renderDisplayValue({
      field: 'idDocKind',
      personalInfoAndDocs: {
        idDoc: true,
        idDocKind: [
          SupportedIdDocTypes.driversLicense,
          SupportedIdDocTypes.passport,
        ],
      },
    });
    expect(screen.getByText("Driver's license, Passport")).toBeInTheDocument();
  });

  it('should display 3 ID docs properly', () => {
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

  it('should display 4 ID docs properly', async () => {
    renderDisplayValue({
      field: 'idDocKind',
      personalInfoAndDocs: {
        idDoc: true,
        idDocKind: [
          SupportedIdDocTypes.driversLicense,
          SupportedIdDocTypes.passport,
          SupportedIdDocTypes.idCard,
          SupportedIdDocTypes.residenceDocument,
        ],
      },
    });
    expect(
      screen.getByText("Driver's license, Passport, and"),
    ).toBeInTheDocument();

    const twoMore = screen.getByText('2 more');
    expect(twoMore).toBeInTheDocument();
    await userEvent.hover(twoMore);
    const tooltip = screen.getByRole('tooltip', {
      name: 'Identity card, Residence card',
    });
    expect(tooltip).toBeInTheDocument();
  });

  it('should display 5 ID docs properly', async () => {
    renderDisplayValue({
      field: 'idDocKind',
      personalInfoAndDocs: {
        idDoc: true,
        idDocKind: [
          SupportedIdDocTypes.driversLicense,
          SupportedIdDocTypes.passport,
          SupportedIdDocTypes.idCard,
          SupportedIdDocTypes.residenceDocument,
          SupportedIdDocTypes.workPermit,
        ],
      },
    });
    expect(
      screen.getByText("Driver's license, Passport, and"),
    ).toBeInTheDocument();

    const threeMore = screen.getByText('3 more');
    expect(threeMore).toBeInTheDocument();
    await userEvent.hover(threeMore);
    const tooltip = screen.getByRole('tooltip', {
      name: 'Identity card, Residence card, Work permit',
    });
    expect(tooltip).toBeInTheDocument();
  });

  it('should display all 6 ID docs properly', async () => {
    renderDisplayValue({
      field: 'idDocKind',
      personalInfoAndDocs: {
        idDoc: true,
        idDocKind: [
          SupportedIdDocTypes.driversLicense,
          SupportedIdDocTypes.passport,
          SupportedIdDocTypes.idCard,
          SupportedIdDocTypes.residenceDocument,
          SupportedIdDocTypes.workPermit,
          SupportedIdDocTypes.visa,
        ],
      },
    });
    expect(
      screen.getByText("Driver's license, Passport, and"),
    ).toBeInTheDocument();

    const fourMore = screen.getByText('4 more');
    expect(fourMore).toBeInTheDocument();
    await userEvent.hover(fourMore);
    const tooltip = screen.getByRole('tooltip', {
      name: 'Identity card, Residence card, Work permit, Visa',
    });
    expect(tooltip).toBeInTheDocument();
  });

  it('should render check icon for included property', () => {
    renderDisplayValue({
      field: CollectedKycDataOption.usLegalStatus,
      personalInfoAndDocs: {
        [CollectedKycDataOption.usLegalStatus]: true,
      },
    });
    expect(screen.getByTestId('check-icon')).toBeInTheDocument();
  });

  it('should render close icon for selfie if id doc is false', () => {
    renderDisplayValue({
      field: 'selfie',
      personalInfoAndDocs: {
        idDoc: false,
      },
    });
    expect(screen.getByTestId('close-icon')).toBeInTheDocument();
  });

  it('should render close icon for selfie if id doc is true but id doc kind is empty', () => {
    renderDisplayValue({
      field: 'selfie',
      personalInfoAndDocs: {
        idDoc: true,
        idDocKind: [],
      },
    });
    expect(screen.getByTestId('close-icon')).toBeInTheDocument();
  });

  it('should render check icon for selfie if id doc is true, id doc kind is non-empty, and selfie is true', () => {
    renderDisplayValue({
      field: 'selfie',
      personalInfoAndDocs: {
        idDoc: true,
        idDocKind: [SupportedIdDocTypes.driversLicense],
        selfie: true,
      },
    });
    expect(screen.getByTestId('check-icon')).toBeInTheDocument();
  });
});
