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

    it('Should show just Manual review when endpt has not loaded', async () => {
      renderAssumeBanner();
      mockRequest({
        method: 'get',
        path: '/entities',
        response: { data: [] },
      });

      await waitFor(() => {
        expect(screen.getByText('Manual reviews (0)')).toBeInTheDocument();
      });
    });

    it('Should show Manual Review w/ number when entities/requires_manual_review returns non-empty list', async () => {
      renderAssumeBanner();
      mockRequest({
        method: 'get',
        path: '/entities',
        response: {
          data: [{ testattr: 'testvalue' }, { testattr2: 'testvalue2' }],
        },
      });

      await waitFor(() => {
        expect(screen.getByText('Manual reviews (2)')).toBeInTheDocument();
      });
    });

    it('Should show /manual-review href', () => {
      renderAssumeBanner();
      mockRequest({
        method: 'get',
        path: '/entities',
        response: { data: [] },
      });

      const manualReview = screen.getByRole('tab', {
        name: 'Manual reviews',
      }) as HTMLAnchorElement;
      expect(manualReview.href.endsWith('/manual-review')).toBeTruthy();
    });
  });
});
