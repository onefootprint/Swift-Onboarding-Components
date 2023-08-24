import { customRender, screen } from '@onefootprint/test-utils';
import { CollectedKycDataOption } from '@onefootprint/types';
import React from 'react';

import AuthorizedScopes, { AuthorizedScopesProps } from './authorized-scopes';

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
      canAccessData: [CollectedKycDataOption.fullAddress],
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
    expect(screen.getByText('SSN (Last 4 digits)')).toBeInTheDocument();
  });

  it('should render legal status if included', () => {
    renderAuthorizedScopes({
      canAccessData: [CollectedKycDataOption.nationality],
    });
    expect(screen.getByText('Legal status in the U.S.')).toBeInTheDocument();
  });
});
