import { customRender, screen } from '@onefootprint/test-utils';
import mockRouter from 'next-router-mock';
import { asAssumedUser, asUser } from 'src/config/tests';

jest.mock('next/router', () => jest.requireActual('next-router-mock'));

import AssumeBanner from './assume-banner';

describe('<AssumeBanner />', () => {
  const renderAssumeBanner = () => customRender(<AssumeBanner />);

  beforeEach(() => {
    mockRouter.setCurrentUrl('/users');
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
