import { customRender, screen } from '@onefootprint/test-utils';
import {
  CollectedKycDataOption,
  SupportedIdDocTypes,
} from '@onefootprint/types';
import React from 'react';

import { Kind } from '@/playbooks/utils/machine/types';

import PersonalScopesWithContext, {
  PersonalScopesWithContextProps,
} from './personal-scopes.test.config';

const renderPersonalScopes = ({
  startingPersonalValues,
  investorProfile,
  kind,
}: PersonalScopesWithContextProps) => {
  customRender(
    <PersonalScopesWithContext
      startingPersonalValues={startingPersonalValues}
      investorProfile={investorProfile}
      kind={kind}
    />,
  );
};
describe('<PersonalScopes />', () => {
  it('should show email and phone as required and disabled because they are always authorized', () => {
    renderPersonalScopes({ startingPersonalValues: { nationality: false } });
    const email = screen.getByRole('checkbox', { name: 'Email' });
    expect(email).toBeInTheDocument();
    expect(email).toBeDisabled();
    const phone = screen.getByRole('checkbox', { name: 'Phone number' });
    expect(phone).toBeInTheDocument();
    expect(phone).toBeDisabled();
  });

  it('should show name, date of birth, and address by default', () => {
    renderPersonalScopes({ startingPersonalValues: { nationality: false } });
    const name = screen.getByRole('checkbox', { name: 'Full name' });
    expect(name).toBeInTheDocument();
    const dob = screen.getByRole('checkbox', { name: 'Date of birth' });
    expect(dob).toBeInTheDocument();
    const address = screen.getByRole('checkbox', { name: 'Address' });
    expect(address).toBeInTheDocument();
  });

  it('should not show SSN if not collecting', () => {
    renderPersonalScopes({ startingPersonalValues: { ssn: false } });
    expect(
      screen.queryByRole('checkbox', { name: 'SSN' }),
    ).not.toBeInTheDocument();
  });

  it('should show SSN (Full) if collecting', () => {
    renderPersonalScopes({
      startingPersonalValues: {
        ssn: true,
        ssnKind: CollectedKycDataOption.ssn9,
      },
    });
    expect(
      screen.getByRole('checkbox', { name: 'SSN (Full)' }),
    ).toBeInTheDocument();
  });

  it('should show SSN (Last 4) if collecting', () => {
    renderPersonalScopes({
      startingPersonalValues: {
        ssn: true,
        ssnKind: CollectedKycDataOption.ssn4,
      },
    });
    expect(
      screen.getByRole('checkbox', { name: 'SSN (Last 4)' }),
    ).toBeInTheDocument();
  });

  it('should not show nationality if not collecting', () => {
    renderPersonalScopes({ startingPersonalValues: { nationality: false } });
    const nationality = screen.queryByRole('checkbox', {
      name: 'Legal status in the U.S.',
    });
    expect(nationality).not.toBeInTheDocument();
  });

  it('should show nationality if collecting', () => {
    renderPersonalScopes({ startingPersonalValues: { nationality: true } });
    const nationality = screen.getByRole('checkbox', {
      name: 'Legal status in the U.S.',
    });
    expect(nationality).toBeInTheDocument();
  });

  it('should not show investor profile if not collecting', () => {
    renderPersonalScopes({ investorProfile: false });
    const investorProfile = screen.queryByRole('checkbox', {
      name: 'Investor profile',
    });
    expect(investorProfile).not.toBeInTheDocument();
  });

  it('should not show investor profile if KYB', () => {
    renderPersonalScopes({ investorProfile: true, kind: Kind.KYB });
    const investorProfile = screen.queryByRole('checkbox', {
      name: 'Investor profile',
    });
    expect(investorProfile).not.toBeInTheDocument();
  });

  it('should show investor profile if collecting', () => {
    renderPersonalScopes({ investorProfile: true });
    const investorProfile = screen.getByRole('checkbox', {
      name: 'Investor profile',
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
});
