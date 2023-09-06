import { customRender, screen } from '@onefootprint/test-utils';
import type { Entity } from '@onefootprint/types';
import React from 'react';

import Row from './row';
import {
  entityFailed,
  entityIncomplete,
  entityOnWatchlist,
  entityPassed,
  entityVaultOnly,
} from './row.test.config';

describe('User table row <Row />', () => {
  const renderRow = (entity: Entity) =>
    customRender(
      <table>
        <tbody>
          <tr>
            <Row entity={entity} />
          </tr>
        </tbody>
      </table>,
    );

  it('should show FP token', () => {
    renderRow(entityPassed);
    expect(
      screen.getByText('fp_bid_VXND11zUVRYQKKUxbUN3KD'),
    ).toBeInTheDocument();
  });

  it('should show Verified when the user is verified', () => {
    renderRow(entityPassed);
    expect(screen.getByText('Verified')).toBeInTheDocument();
  });

  it('should show Failed when the user could not be verified', () => {
    renderRow(entityFailed);
    expect(screen.getByText('Failed')).toBeInTheDocument();
  });

  it('should show None when the user has no KYC status', () => {
    renderRow(entityVaultOnly);
    expect(screen.getByText('None')).toBeInTheDocument();
  });

  it('should show Incomplete when the user status is incomplete', () => {
    renderRow(entityIncomplete);
    expect(screen.getByText('Incomplete')).toBeInTheDocument();
  });

  it('should show watchlist fail icon if the user is in watchlist', () => {
    renderRow(entityOnWatchlist);
    const watchlistFailIcon = screen.getByTestId('watchlistFailIcon');
    expect(watchlistFailIcon).toBeInTheDocument();
  });
});
