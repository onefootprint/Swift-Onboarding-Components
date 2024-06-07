import { customRender, screen } from '@onefootprint/test-utils';
import type { OnboardingConfig } from '@onefootprint/types';
import React from 'react';

import CollectionAndScopes from './collection-and-scopes';
import playbookFixture from './collection-and-scopes.test.config';

const renderCollectionAndScopes = (playbook: OnboardingConfig) => {
  customRender(<CollectionAndScopes playbook={playbook} isTabsDisabled={false} toggleDisableHeading={jest.fn()} />);
};

describe('<CollectionAndScopes />', () => {
  it('should render the default tabs', () => {
    renderCollectionAndScopes(playbookFixture);

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
