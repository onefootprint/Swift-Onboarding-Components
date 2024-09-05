import { customRender, screen } from '@onefootprint/test-utils';
import type { Entity } from '@onefootprint/types';

import Row from './row';
import {
  entityFailedFixture,
  entityInProgressFixture,
  entityIncompleteFixture,
  entityManualReviewFixture,
  entityOnWatchlistFixture,
  entityPassedFixture,
  entityVaultOnlyFixture,
  withLabel,
} from './row.test.config';

describe('User table row <Row />', () => {
  beforeEach(() => {
    withLabel();
  });

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

  it('should show the FP token', () => {
    renderRow(entityPassedFixture);
    expect(screen.getByText('fp_bid_VXND11zUVRYQKKUxbUN3KD')).toBeInTheDocument();
  });

  describe('when the user is verified', () => {
    it('should show as "Pass"', () => {
      renderRow(entityPassedFixture);
      expect(screen.getByText('Pass')).toBeInTheDocument();
    });
  });

  describe('when the user could not be verified', () => {
    it('should show "Fail"', () => {
      renderRow(entityFailedFixture);
      expect(screen.getByText('Fail')).toBeInTheDocument();
    });
  });

  describe('when the user has no KYC status', () => {
    it('should show "None"', () => {
      renderRow(entityVaultOnlyFixture);
      expect(screen.getByText('None')).toBeInTheDocument();
    });
  });

  describe('when the user status is incomplete', () => {
    it('should show "Incomplete"', () => {
      renderRow(entityIncompleteFixture);
      expect(screen.getByText('Incomplete')).toBeInTheDocument();
    });
  });

  describe('when the user status is in progress', () => {
    it('should show "In progress"', () => {
      renderRow(entityInProgressFixture);
      expect(screen.getByText('In progress')).toBeInTheDocument();
    });
  });

  describe('when the user is on watchlist', () => {
    it('should show "Watchlist"', () => {
      renderRow(entityOnWatchlistFixture);
      expect(screen.getByText('Watchlist')).toBeInTheDocument();
    });
  });

  describe('when the user is on manual review', () => {
    it('should show "Manual review"', () => {
      renderRow(entityManualReviewFixture);
      expect(screen.getByText('Manual review')).toBeInTheDocument();
    });
  });
});
