import { customRender, screen } from '@onefootprint/test-utils';
import { CollectedKycDataOption } from '@onefootprint/types';
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

  it('should render document if document string included in mustCollectData', () => {
    renderCollectionAndScopes({
      playbook: {
        ...playbookFixture,
        mustCollectData: [
          'document.passport,drivers_license,id_card.none.require_selfie',
        ],
      },
    });
    expect(screen.getByText('ID document scan')).toBeInTheDocument();
    expect(screen.getByText('Identity card and')).toBeInTheDocument();
    expect(screen.getByText('2 more')).toBeInTheDocument();
  });

  it('should render selfie even if no document or selfie option', () => {
    renderCollectionAndScopes({
      playbook: {
        ...playbookFixture,
        mustCollectData: [],
      },
    });
    expect(screen.getByText('Selfie')).toBeInTheDocument();
  });

  it('should render SSN even if none included in mustCollectData', () => {
    renderCollectionAndScopes({
      playbook: {
        ...playbookFixture,
        mustCollectData: [],
      },
    });
    expect(screen.getByText('SSN')).toBeInTheDocument();
  });

  it('should render nationality for backwards compatibility when the legacy obc collects it', async () => {
    renderCollectionAndScopes({
      playbook: {
        ...playbookFixture,
        mustCollectData: [CollectedKycDataOption.nationality],
      },
    });
    expect(screen.getByText('Nationality')).toBeInTheDocument();
    expect(screen.getByText('Legal status in the U.S.')).toBeInTheDocument();
  });

  it('should not render nationality if the obc does not collect it', async () => {
    renderCollectionAndScopes({
      playbook: {
        ...playbookFixture,
        mustCollectData: [CollectedKycDataOption.usLegalStatus],
      },
    });
    expect(screen.queryByText('Nationality')).not.toBeInTheDocument();
    expect(screen.getByText('Legal status in the U.S.')).toBeInTheDocument();
  });
});
