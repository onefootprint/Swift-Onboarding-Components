import {
  customRender,
  screen,
  userEvent,
  waitFor,
} from '@onefootprint/test-utils';
import {
  CollectedDocumentDataOption,
  CollectedInvestorProfileDataOption,
  CollectedKycDataOption,
} from '@onefootprint/types';
import React from 'react';

import { Kind } from '@/playbooks/utils/machine/types';

import AuthorizedScopesWithContext, {
  AuthorizedScopesWithContextProps,
} from './authorized-scopes.test.config';

const renderAuthorizedScopes = ({
  kind,
  submissionLoading,
  onSubmit,
}: AuthorizedScopesWithContextProps) => {
  customRender(
    <AuthorizedScopesWithContext
      kind={kind}
      submissionLoading={submissionLoading}
      onSubmit={onSubmit}
    />,
  );
};
describe('<AuthorizedScopes />', () => {
  it('should show BusinessScopes when KYB', () => {
    renderAuthorizedScopes({ kind: Kind.KYB });
    expect(
      screen.getByRole('checkbox', { name: 'All business information' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Beneficial owners')).toBeInTheDocument();
  });

  it('should not show BusinessScopes when KYC', () => {
    renderAuthorizedScopes({ kind: Kind.KYC });
    expect(
      screen.queryByRole('checkbox', { name: 'All business information' }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText('Beneficial owners')).not.toBeInTheDocument();
  });

  it('shows regular "create playbook" button when not loading', () => {
    renderAuthorizedScopes({ kind: Kind.KYC, submissionLoading: false });
    expect(
      screen.getByRole('button', { name: 'Create Playbook' }),
    ).toBeInTheDocument();
  });

  it('shows loading state if mutation is loading', () => {
    renderAuthorizedScopes({ kind: Kind.KYC, submissionLoading: true });
    const createButton = screen.getByRole('progressbar', {
      name: 'Loading...',
    });
    expect(createButton).toBeInTheDocument();
  });

  it('should disable back button if mutation is loading', () => {
    renderAuthorizedScopes({ kind: Kind.KYC, submissionLoading: true });
    const backButton = screen.getByRole('button', {
      name: 'Back',
    });
    expect(backButton).toBeDisabled();
  });

  it('always contains email and phone number in access scopes', async () => {
    const onSubmit = jest.fn();
    renderAuthorizedScopes({ kind: Kind.KYC, onSubmit });

    const submitButton = screen.getByRole('button', {
      name: 'Create Playbook',
    });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        {
          [CollectedKycDataOption.name]: true,
          [CollectedKycDataOption.email]: true,
          [CollectedKycDataOption.phoneNumber]: true,
          [CollectedKycDataOption.dob]: true,
          [CollectedKycDataOption.address]: true,
          [CollectedKycDataOption.ssn4]: true,
          [CollectedKycDataOption.ssn9]: true,
          [CollectedKycDataOption.usLegalStatus]: true,
          [CollectedDocumentDataOption.document]: true,
          [CollectedInvestorProfileDataOption.investorProfile]: true,
          allBusinessData: true,
        },
        expect.anything(),
      );
    });
  });
});
