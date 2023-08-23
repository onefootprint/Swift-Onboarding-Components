import { customRender, screen } from '@onefootprint/test-utils';
import React from 'react';

import { Kind } from '@/playbooks/utils/machine/types';

import AuthorizedScopesWithContext, {
  AuthorizedScopesWithContextProps,
} from './authorized-scopes.test.config';

const renderAuthorizedScopes = ({ kind }: AuthorizedScopesWithContextProps) => {
  customRender(<AuthorizedScopesWithContext kind={kind} />);
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
});
