import { customRender, screen } from '@onefootprint/test-utils';
import {
  CollectedKycDataOption,
  SupportedIdDocTypes,
} from '@onefootprint/types';
import React from 'react';

import { PlaybookKind } from '@/playbooks/utils/machine/types';

import type { PersonalScopesWithContextProps } from './person.test.config';
import PersonalScopesWithContext from './person.test.config';

const renderPersonalScopes = ({
  startingPersonalValues,
  investorProfile,
  meta,
}: PersonalScopesWithContextProps) => {
  customRender(
    <PersonalScopesWithContext
      investorProfile={investorProfile}
      meta={meta}
      startingPersonalValues={startingPersonalValues}
    />,
  );
};
describe('<PersonalScopes />', () => {
  it('should show email and phone as required and disabled because they are always authorized', () => {
    renderPersonalScopes({
      startingPersonalValues: { [CollectedKycDataOption.usLegalStatus]: false },
    });

    const email = screen.getByRole('checkbox', { name: 'Email' });
    expect(email).toBeInTheDocument();
    expect(email).toBeDisabled();

    const phone = screen.getByRole('checkbox', { name: 'Phone number' });
    expect(phone).toBeInTheDocument();
    expect(phone).toBeDisabled();
  });

  it('should not show phone for no phone flows', () => {
    renderPersonalScopes({
      startingPersonalValues: {
        phone_number: false,
      },
    });

    const phone = screen.queryByRole('checkbox', { name: 'Phone number' });
    expect(phone).not.toBeInTheDocument();
  });

  it('should show name, date of birth, and address by default', () => {
    renderPersonalScopes({
      startingPersonalValues: { [CollectedKycDataOption.usLegalStatus]: false },
    });

    const name = screen.getByRole('checkbox', { name: 'Full name' });
    expect(name).toBeInTheDocument();

    const dob = screen.getByRole('checkbox', { name: 'Date of birth' });
    expect(dob).toBeInTheDocument();

    const address = screen.getByRole('checkbox', { name: 'Address' });
    expect(address).toBeInTheDocument();
  });

  it('should not show SSN if not collecting', () => {
    renderPersonalScopes({ startingPersonalValues: { ssn: false } });

    const ssn = screen.queryByRole('checkbox', { name: 'SSN' });
    expect(ssn).not.toBeInTheDocument();
  });

  it('should show SSN (Full) if collecting', () => {
    renderPersonalScopes({
      startingPersonalValues: {
        ssn: true,
        ssnKind: CollectedKycDataOption.ssn9,
      },
    });

    const ssn = screen.getByRole('checkbox', { name: 'SSN (Full)' });
    expect(ssn).toBeInTheDocument();
  });

  it('should show SSN (Last 4) if collecting', () => {
    renderPersonalScopes({
      startingPersonalValues: {
        ssn: true,
        ssnKind: CollectedKycDataOption.ssn4,
      },
    });

    const ssn = screen.getByRole('checkbox', { name: 'SSN (Last 4)' });
    expect(ssn).toBeInTheDocument();
  });

  it('should show SSN (Last 4) enabled by default', () => {
    renderPersonalScopes({
      startingPersonalValues: {
        ssn: true,
        ssnKind: CollectedKycDataOption.ssn4,
      },
    });

    const ssn = screen.getByRole('checkbox', { name: 'SSN (Last 4)' });
    expect(ssn).toBeChecked();
  });

  it('should show SSN Full enabled by default', () => {
    renderPersonalScopes({
      startingPersonalValues: {
        ssn: true,
        ssnKind: CollectedKycDataOption.ssn9,
      },
    });

    const ssn = screen.getByRole('checkbox', { name: 'SSN (Full)' });
    expect(ssn).toBeChecked();
  });

  it('should not show usLegalStatus if not collecting', () => {
    renderPersonalScopes({
      startingPersonalValues: { [CollectedKycDataOption.usLegalStatus]: false },
    });

    const usLegalStatus = screen.queryByRole('checkbox', {
      name: 'Legal status in the U.S.',
    });
    expect(usLegalStatus).not.toBeInTheDocument();
  });

  it('should show usLegalStatus if collecting', () => {
    renderPersonalScopes({
      startingPersonalValues: { [CollectedKycDataOption.usLegalStatus]: true },
    });

    const usLegalStatus = screen.getByRole('checkbox', {
      name: 'Legal status in the U.S.',
    });
    expect(usLegalStatus).toBeInTheDocument();
  });

  it('should not show investor profile if not collecting', () => {
    renderPersonalScopes({ investorProfile: false });

    const investorProfile = screen.queryByRole('checkbox', {
      name: 'Investor profile',
    });
    expect(investorProfile).not.toBeInTheDocument();
  });

  it('should not show investor profile if KYB', () => {
    renderPersonalScopes({
      investorProfile: true,
      meta: {
        kind: PlaybookKind.Kyb,
      },
    });

    const investorProfile = screen.queryByRole('checkbox', {
      name: 'Investor profile',
    });
    expect(investorProfile).not.toBeInTheDocument();
  });

  it('should show investor profile if collecting', () => {
    renderPersonalScopes({ investorProfile: true });

    const investorProfile = screen.getByRole('checkbox', {
      name: 'Investor profile questions',
    });
    expect(investorProfile).toBeInTheDocument();
  });

  it('should show ID doc if collecting', () => {
    renderPersonalScopes({
      startingPersonalValues: {
        idDoc: true,
        idDocKind: [SupportedIdDocTypes.driversLicense],
      },
    });

    const idDoc = screen.getByRole('checkbox', {
      name: 'ID Document & Selfie',
    });
    expect(idDoc).toBeInTheDocument();
  });

  it('should not show ID doc if collecting', () => {
    renderPersonalScopes({
      startingPersonalValues: {
        idDoc: false,
      },
    });

    const idDoc = screen.queryByRole('checkbox', {
      name: 'ID Document & Selfie',
    });
    expect(idDoc).not.toBeInTheDocument();
  });

  it('should not US residents section if none of the options exist', () => {
    renderPersonalScopes({
      startingPersonalValues: {
        idDoc: false,
        ssn: false,
        ssnKind: undefined,
        [CollectedKycDataOption.usLegalStatus]: false,
      },
    });

    const usResidents = screen.queryByText('U.S. residents');
    expect(usResidents).not.toBeInTheDocument();
  });

  it('should render US residents section if at least one of the options exist', () => {
    renderPersonalScopes({
      startingPersonalValues: {
        idDoc: false,
        ssn: true,
        ssnKind: CollectedKycDataOption.ssn9,
        [CollectedKycDataOption.usLegalStatus]: false,
      },
    });

    const usResidents = screen.queryByText('U.S. residents');
    expect(usResidents).toBeInTheDocument();
  });
});
