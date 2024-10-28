import { customRender, mockRequest, screen, userEvent, waitFor } from '@onefootprint/test-utils';
import type { Organization } from '@onefootprint/types';
import mockRouter from 'next-router-mock';
import { asAdminUser, asUserWithScope, resetUser } from 'src/config/tests';

import DomainAccess from './domain-access';
import {
  orgAllowDomainFixture,
  orgDomainAlreadyClaimed,
  orgEnabledAllowDomainAccessFixture,
} from './domain-access.test.config';

describe('<DomainAccess />', () => {
  beforeEach(() => {
    mockRouter.setCurrentUrl('/settings?tab=domain-access');
    mockRouter.query = {
      tab: 'domain-access',
    };
    mockRequest({
      method: 'get',
      path: '/org',
      response: { data: {} },
    });
    mockRequest({
      method: 'patch',
      path: '/org',
      response: { data: {} },
    });
  });

  afterAll(() => {
    resetUser();
  });

  const renderDomainAccess = (org: Organization) => {
    customRender(<DomainAccess org={org} />);
  };

  describe('when the component gets rendered with allow domain access org', () => {
    it('when domain access is enabled, toggle should flip', async () => {
      asAdminUser();
      renderDomainAccess(orgAllowDomainFixture);

      const domainAccessComponent = screen.getByText('Allow domain access');
      expect(domainAccessComponent).toBeInTheDocument();

      const lockClosed = screen.getByTestId('lock-closed');
      expect(lockClosed).toBeInTheDocument();

      const toggle = screen.getByRole('switch') as HTMLButtonElement;
      await userEvent.click(toggle);
      await waitFor(() => {
        expect(toggle).toBeChecked();
      });
    });

    it('when no permission to toggle, toggle is disabled', async () => {
      resetUser();
      asUserWithScope([]);
      renderDomainAccess(orgEnabledAllowDomainAccessFixture);

      const lockOpen = screen.getByTestId('lock-open');
      expect(lockOpen).toBeInTheDocument();

      const toggle = screen.getByRole('switch') as HTMLInputElement;
      expect(toggle).toBeDisabled();

      await userEvent.hover(toggle);
      await waitFor(() => {
        const tooltip = screen.getByRole('tooltip', {
          name: "You're not allowed to toggle domain access",
        });
        expect(tooltip).toBeInTheDocument();
      });
    });

    it('when domain is already claimed, toggle is disabled', async () => {
      resetUser();
      asUserWithScope([]);
      renderDomainAccess(orgDomainAlreadyClaimed);

      const lockOpen = screen.getByTestId('lock-closed');
      expect(lockOpen).toBeInTheDocument();

      const toggle = screen.getByRole('switch') as HTMLInputElement;
      expect(toggle).toBeDisabled();

      await userEvent.hover(toggle);
      await waitFor(() => {
        const tooltip = screen.getByRole('tooltip', {
          name: 'Domain access for footprint.com has already been claimed. Please contact your admin to invite you to the existing organization.',
        });
        expect(tooltip).toBeInTheDocument();
      });
    });
  });
});
