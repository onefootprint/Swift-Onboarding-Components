import {
  createUseRouterSpy,
  customRender,
  screen,
} from '@onefootprint/test-utils';
import React from 'react';

import AuditTrail from './audit-trail';
import { withTimeline } from './audit-trail.test.config';

const useRouterSpy = createUseRouterSpy();

const footprintUserId = 'fp_id_yCZehsWNeywHnk5JqL20u';

describe('<AuditTrail />', () => {
  beforeAll(() => {
    useRouterSpy({
      pathname: `/users/detail?footprint_user_id=${footprintUserId}`,
      query: {
        footprint_user_id: footprintUserId,
      },
    });
    withTimeline(footprintUserId);
  });

  const renderAuditTrail = () => customRender(<AuditTrail />);

  it('renders container and title correctly', () => {
    useRouterSpy({
      pathname:
        '/users/detailusers/detail?footprint_user_id=fp_id_yCZehsWNeywHnk5JqL20u',
      query: {
        footprint_user_id: 'fp_id_yCZehsWNeywHnk5JqL20u',
      },
    });

    renderAuditTrail();
    expect(screen.getByText('Audit trail')).toBeInTheDocument();
    // This id is used to scroll the audit trail into view from the ManualReviewBanner
    expect(document.getElementById('audit-trail')).toBeDefined();
  });
});
