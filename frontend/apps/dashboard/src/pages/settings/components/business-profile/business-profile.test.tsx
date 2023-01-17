import {
  createUseRouterSpy,
  customRender,
  screen,
  waitFor,
} from '@onefootprint/test-utils';
import React from 'react';

import BusinessProfile from './business-profile';
import {
  withOrganization,
  withOrganizationError,
} from './business-profile.test.config';

const useRouterSpy = createUseRouterSpy();

describe('<BusinessProfile />', () => {
  beforeEach(() => {
    useRouterSpy({
      pathname: '/settings',
    });
  });

  const renderBusinessProfile = () => {
    customRender(<BusinessProfile />);
  };

  describe('when the request fails', () => {
    beforeAll(() => {
      withOrganizationError();
    });

    it('should show a spinner and then an error message', async () => {
      renderBusinessProfile();

      await waitFor(() => {
        const loading = screen.getByTestId('business-profile-loading');
        expect(loading).toBeInTheDocument();
      });

      await waitFor(() => {
        const error = screen.getByText('Something went wrong');
        expect(error).toBeInTheDocument();
      });
    });
  });

  describe('when the request succeeds', () => {
    beforeAll(() => {
      withOrganization();
    });

    it('should show the org name, logo and website', async () => {
      renderBusinessProfile();

      await waitFor(() => {
        const name = screen.getByText('Footprint');
        expect(name).toBeInTheDocument();
      });

      await waitFor(() => {
        const website = screen.getByText('https://onefootprint.com');
        expect(website).toBeInTheDocument();
      });

      await waitFor(() => {
        const website = screen.getByText('https://onefootprint.com');
        expect(website).toBeInTheDocument();
      });

      await waitFor(() => {
        const logo = screen.getByRole('img', { name: 'Footprint' });
        expect(logo).toHaveAttribute(
          'src',
          'https://onefootprint.com/logo.png',
        );
      });
    });
  });
});
