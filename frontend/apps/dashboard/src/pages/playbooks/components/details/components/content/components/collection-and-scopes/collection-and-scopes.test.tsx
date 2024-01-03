import { customRender, screen } from '@onefootprint/test-utils';
import React from 'react';

import type { CollectionAndScopesProps } from './collection-and-scopes';
import CollectionAndScopes from './collection-and-scopes';
import playbookFixture from './collection-and-scopes.test.config';

const renderCollectionAndScopes = ({ playbook }: CollectionAndScopesProps) => {
  customRender(<CollectionAndScopes playbook={playbook} />);
};

describe('<CollectionAndScopes />', () => {
  it('should render the default tabs', () => {
    renderCollectionAndScopes({ playbook: playbookFixture });

    const dataCollection = screen.getByRole('tab', { name: 'Data collection' });
    expect(dataCollection).toBeInTheDocument();

    const scopes = screen.getByRole('tab', { name: 'Authorized scopes' });
    expect(scopes).toBeInTheDocument();

    const aml = screen.getByRole('tab', { name: 'AML monitoring' });
    expect(aml).toBeInTheDocument();

    const rules = screen.getByRole('tab', { name: 'Rules' });
    expect(rules).toBeInTheDocument();
  });
});
