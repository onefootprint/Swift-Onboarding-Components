import {
  createUseRouterSpy,
  customRender,
  screen,
  waitFor,
} from '@onefootprint/test-utils';
import React from 'react';

import Details from './details';
import {
  entityFixture,
  withEntity,
  withEntityError,
} from './details.test.config';

const useRouterSpy = createUseRouterSpy();

describe('<Details />', () => {
  beforeEach(() => {
    useRouterSpy({
      pathname: `/businesses/${entityFixture.id}`,
      query: {
        id: entityFixture.id,
      },
    });
  });

  const renderDetails = () => {
    customRender(<Details />);
  };

  const renderDetailsAndWaitData = async () => {
    renderDetails();

    await waitFor(() => {
      const content = screen.getByTestId('entity-content');
      expect(content).toBeInTheDocument();
    });
  };

  describe('when the request to fetch the proxy configs succeeds', () => {
    beforeEach(() => {
      withEntity();
    });

    it('should show a breadcrumb, with an option to return to the list pages', async () => {
      await renderDetailsAndWaitData();

      const breadcrumb = screen.getByLabelText('Business details breadcrumb');
      expect(breadcrumb).toBeInTheDocument();

      const listLink = screen.getByRole('link', { name: 'Businesses' });
      expect(listLink).toBeInTheDocument();
      expect(listLink.getAttribute('href')).toEqual('/businesses');
    });

    it('should show a header with the business status, start and id', async () => {
      await renderDetailsAndWaitData();

      const header = screen.getByRole('banner', { name: 'Business info' });
      expect(header).toBeInTheDocument();

      const status = screen.getByText('Verified');
      expect(status).toBeInTheDocument();

      const start = screen.getByText('3/27/23, 2:43 PM');
      expect(start).toBeInTheDocument();

      const id = screen.getByText('fp_bid_VXND11zUVRYQKKUxbUN3KD');
      expect(id).toBeInTheDocument();
    });
  });

  describe('when the request to fetch the entity fails', () => {
    beforeEach(() => {
      withEntityError();
    });

    it('should show an error message', async () => {
      renderDetails();

      await waitFor(() => {
        const feedback = screen.getByText('Something went wrong');
        expect(feedback).toBeInTheDocument();
      });
    });
  });
});
