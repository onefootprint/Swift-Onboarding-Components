import {
  createUseRouterSpy,
  customRender,
  screen,
} from '@onefootprint/test-utils';
import React from 'react';
import { UserStoreProvider } from 'src/hooks/use-user-store';

import AuditTrail from './audit-trail';
import {
  withAnnotations,
  withLiveness,
  withMetadata,
  withRiskSignals,
  withTimeline,
} from './audit-trail.test.config';

const useRouterSpy = createUseRouterSpy();

const footprintUserId = 'fp_id_yCZehsWNeywHnk5JqL20u';

describe('<AuditTrail />', () => {
  beforeAll(() => {
    useRouterSpy({
      pathname: `/users/detail`,
      query: {
        footprint_user_id: footprintUserId,
      },
    });
    withMetadata(footprintUserId);
    withRiskSignals(footprintUserId);
    withAnnotations(footprintUserId);
    withLiveness(footprintUserId);
    withTimeline(footprintUserId);
  });

  const renderAuditTrail = () =>
    customRender(
      <UserStoreProvider>
        <AuditTrail />
      </UserStoreProvider>,
    );

  it('renders container and title correctly', () => {
    useRouterSpy({
      pathname: '/users/detail',
      query: {
        footprint_user_id: footprintUserId,
      },
    });

    renderAuditTrail();
    expect(screen.getByText('Audit trail')).toBeInTheDocument();
    // This id is used to scroll the audit trail into view from the ManualReviewBanner
    expect(document.getElementById('audit-trail')).toBeDefined();
  });
});
