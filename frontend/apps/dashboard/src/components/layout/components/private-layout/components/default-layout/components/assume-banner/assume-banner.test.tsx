import { customRender, mockRequest, screen, userEvent } from '@onefootprint/test-utils';
import mockRouter from 'next-router-mock';
import { asAssumedUser, asUser } from 'src/config/tests';

jest.mock('next/router', () => jest.requireActual('next-router-mock'));

import AssumeBanner from './assume-banner';

describe('<AssumeBanner />', () => {
  const renderAssumeBanner = () => customRender(<AssumeBanner />);

  beforeEach(() => {
    mockRouter.setCurrentUrl('/users');
    mockRequest({
      path: '/private/access_requests',
      method: 'get',
      response: {
        data: [],
      },
    });
  });

  describe('when assuming a tenant', () => {
    beforeEach(() => {
      asAssumedUser();
    });

    it('should show the banner', () => {
      renderAssumeBanner();
      const banner = screen.getByRole('alert');
      expect(banner).toBeInTheDocument();
    });

    it('should open dialog when requesting edit mode', async () => {
      renderAssumeBanner();

      const requestEditButton = screen.getByRole('button', { name: 'Request edit mode' });
      expect(requestEditButton).toBeInTheDocument();
      await userEvent.click(requestEditButton);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Request edit grant')).toBeInTheDocument();
    });
  });

  describe('when not assuming a tenant', () => {
    beforeEach(() => {
      asUser();
    });

    it('should not show the banner', () => {
      renderAssumeBanner();
      const banner = screen.queryByRole('alert');
      expect(banner).not.toBeInTheDocument();
    });
  });
});
