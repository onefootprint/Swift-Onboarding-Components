import { customRender, screen } from '@onefootprint/test-utils';
import React from 'react';

import CollectionAndScopes, {
  type CollectionAndScopesProps,
} from './collection-and-scopes';
import playbookFixture from './collection-and-scopes.test.config';

const renderCollectionAndScopes = ({ playbook }: CollectionAndScopesProps) => {
  customRender(<CollectionAndScopes playbook={playbook} />);
};

describe('<CollectionAndScopes />', () => {
  it('should render two tabs', () => {
    renderCollectionAndScopes({ playbook: playbookFixture });
    expect(
      screen.getByRole('tab', { name: 'Data collection' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('tab', { name: 'Authorized scopes' }),
    ).toBeInTheDocument();
  });
});
