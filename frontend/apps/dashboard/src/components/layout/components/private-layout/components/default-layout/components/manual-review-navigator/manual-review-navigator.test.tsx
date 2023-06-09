import {
  createUseRouterSpy,
  customRender,
  mockRequest,
  screen,
  waitFor,
} from '@onefootprint/test-utils';
import React from 'react';

import ManualReviewNavigator from './manual-review-navigator';

const useRouterSpy = createUseRouterSpy();

describe('<ManualReviewNavigator />', () => {
  const renderAssumeBanner = () => customRender(<ManualReviewNavigator />);

  describe('Functions as expected', () => {
    useRouterSpy({ pathname: '/entities' });

    it('Show just Manual review when endpt has not loaded', () => {
      renderAssumeBanner();
      mockRequest({
        method: 'get',
        path: '/entities',
        response: { data: [] },
      });

      expect(screen.queryByText('Manual review • 0')).not.toBeInTheDocument();
      expect(screen.getByText('Manual review')).toBeInTheDocument();
    });

    it('Show Manual Review w/ number when entities/requires_manual_review returns non-empty list', async () => {
      renderAssumeBanner();
      mockRequest({
        method: 'get',
        path: '/entities',
        response: {
          data: [{ testattr: 'testvalue' }, { testattr2: 'testvalue2' }],
        },
      });

      await waitFor(() => {
        expect(screen.getByText('Manual review • 2')).toBeInTheDocument();
      });
    });

    it('Shows /manual-review href', () => {
      renderAssumeBanner();
      mockRequest({
        method: 'get',
        path: '/entities',
        response: { data: [] },
      });

      const manualReview = screen.getByRole('tab', {
        name: 'Manual review',
      }) as HTMLAnchorElement;
      expect(manualReview.href.endsWith('/manual-review')).toBeTruthy();
    });
  });
});
