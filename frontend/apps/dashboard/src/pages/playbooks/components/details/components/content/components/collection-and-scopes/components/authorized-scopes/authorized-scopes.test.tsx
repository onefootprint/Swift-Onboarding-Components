import { customRender, screen } from '@onefootprint/test-utils';
import { CollectedKycDataOption } from '@onefootprint/types';
import React from 'react';

import type { AuthorizedScopesProps } from './authorized-scopes';
import AuthorizedScopes from './authorized-scopes';

const renderAuthorizedScopes = ({ canAccessData }: AuthorizedScopesProps) => {
  customRender(<AuthorizedScopes canAccessData={canAccessData} />);
};

describe('<AuthorizedScopes />', () => {
  it('should render email if included', () => {
    renderAuthorizedScopes({
      canAccessData: [CollectedKycDataOption.email],
    });
    expect(screen.getByText('Email')).toBeInTheDocument();
  });

  it('should render phone number if included', () => {
    renderAuthorizedScopes({
      canAccessData: [CollectedKycDataOption.phoneNumber],
    });
    expect(screen.getByText('Phone number')).toBeInTheDocument();
  });

  it('should render name if included', () => {
    renderAuthorizedScopes({
      canAccessData: [CollectedKycDataOption.name],
    });
    expect(screen.getByText('First & Last name')).toBeInTheDocument();
  });

  it('should render date of birth if included', () => {
    renderAuthorizedScopes({
      canAccessData: [CollectedKycDataOption.dob],
    });
    expect(screen.getByText('Date of birth')).toBeInTheDocument();
  });

  it('should show full address if included', () => {
    renderAuthorizedScopes({
      canAccessData: [CollectedKycDataOption.address],
    });
    expect(screen.getByText('Address')).toBeInTheDocument();
  });

  it('should render document and selfie if included', () => {
    renderAuthorizedScopes({
      canAccessData: [
        'document.passport,drivers_license,id_card.none.require_selfie',
      ],
    });
    expect(screen.getByText('Passport (photo page)')).toBeInTheDocument();
    expect(screen.getByText("Driver's license")).toBeInTheDocument();
    expect(screen.getByText('Identity card')).toBeInTheDocument();
    expect(screen.getByText('Selfie')).toBeInTheDocument();
  });

  it('should not render selfie if not included in document', () => {
    renderAuthorizedScopes({
      canAccessData: ['document.permit,visa,residence_document.none.none'],
    });
    expect(screen.getByText('Work permit')).toBeInTheDocument();
    expect(screen.getByText('Visa')).toBeInTheDocument();
    expect(screen.getByText('Residence card')).toBeInTheDocument();
    expect(screen.queryByText('Selfie')).not.toBeInTheDocument();
  });

  it('should render SSN9 if included', () => {
    renderAuthorizedScopes({
      canAccessData: [CollectedKycDataOption.ssn9],
    });
    expect(screen.getByText('SSN (Full)')).toBeInTheDocument();
  });

  it('should render SSN4 if included', () => {
    renderAuthorizedScopes({
      canAccessData: [CollectedKycDataOption.ssn4],
    });
    expect(screen.getByText('SSN (Last 4)')).toBeInTheDocument();
  });

  it('should render legal status if included', () => {
    renderAuthorizedScopes({
      canAccessData: [CollectedKycDataOption.usLegalStatus],
    });
    expect(screen.getByText('Legal status in the U.S.')).toBeInTheDocument();
  });

  it('should not render US residents section if no SSN, usLegalStatus, or ID doc', () => {
    renderAuthorizedScopes({
      canAccessData: [
        CollectedKycDataOption.name,
        CollectedKycDataOption.dob,
        CollectedKycDataOption.address,
        CollectedKycDataOption.email,
      ],
    });
    expect(screen.queryByText('U.S. residents')).not.toBeInTheDocument();
  });

  it('should render US residents section if SSN, usLegalStatus, or ID doc', () => {
    renderAuthorizedScopes({
      canAccessData: [CollectedKycDataOption.ssn9],
    });

    expect(screen.getByText('U.S. residents')).toBeInTheDocument();
  });
});
