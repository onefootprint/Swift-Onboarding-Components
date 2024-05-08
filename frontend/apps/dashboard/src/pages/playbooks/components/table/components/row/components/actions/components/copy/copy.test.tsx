import {
  createUseRouterSpy,
  customRender,
  screen,
  userEvent,
  waitFor,
} from '@onefootprint/test-utils';
import React from 'react';
import {
  asAdminUser,
  asAdminUserRestrictedToSandbox,
  resetUser,
} from 'src/config/tests';

import { type CopyProps } from './copy';
import {
  authRolesFixture,
  CopyWithButton,
  playbookFixture,
  withAssumeRole,
  withAuthRoles,
  withModes,
  withPlaybookCopy,
  withPlaybookCopyError,
} from './copy.test.config';

const useRouterSpy = createUseRouterSpy();

describe('<Copy />', () => {
  beforeEach(() => {
    useRouterSpy({
      pathname: '/playbooks',
    });
    withModes();
    withAuthRoles();
    withAssumeRole();
  });

  beforeEach(() => {
    asAdminUser();
  });

  afterEach(() => {
    resetUser();
  });

  const renderCopy = async ({
    playbook = playbookFixture,
  }: Partial<CopyProps> = {}) => {
    customRender(<CopyWithButton playbook={playbook} />);
    await userEvent.click(screen.getByRole('button', { name: 'Open' }));

    await waitFor(() => {
      const modal = screen.getByRole('dialog', { name: 'Copying playbook' });
      expect(modal).toBeInTheDocument();
    });

    await waitFor(() => {
      const form = screen.getByTestId('copy-playbook-form');
      expect(form).toBeInTheDocument();
    });
  };

  it('should initialize the name with the playbook name + (copy)', async () => {
    await renderCopy();

    const nameInput = screen.getByDisplayValue('People verification (copy)');
    expect(nameInput).toBeInTheDocument();
  });

  it('should display a select with the list of tenants', async () => {
    await renderCopy();

    const select = screen.getByRole('combobox', { name: 'Tenant' });
    expect(select).toBeInTheDocument();

    authRolesFixture.forEach(({ name }) => {
      const option = screen.getByRole('option', { name });
      expect(option).toBeInTheDocument();
    });
  });

  describe('when there is only one tenant', () => {
    beforeEach(() => {
      withAuthRoles([]);
    });

    it('should hide the tenant select', async () => {
      await renderCopy();

      const select = screen.queryByRole('combobox', { name: 'Tenant' });
      expect(select).not.toBeInTheDocument();
    });
  });

  describe('when the user is restricted to create live ob configs', () => {
    beforeEach(() => {
      asAdminUserRestrictedToSandbox();
    });

    it('should disable the "Live" option', async () => {
      await renderCopy();

      const tenantWithoutPermission = screen.getByRole('option', {
        name: 'Retro Bank',
      });
      await userEvent.click(tenantWithoutPermission);

      const liveOption = screen.getByRole('button', { name: 'Live' });
      expect(liveOption).toBeDisabled();
    });
  });

  describe('when the user is not restricted to create live ob configs', () => {
    it("should enable the 'Live' option", async () => {
      await renderCopy();

      const tenantWithPermission = screen.getByRole('option', {
        name: 'Footprint Live',
      });
      await userEvent.click(tenantWithPermission);

      const liveOption = screen.getByRole('button', { name: 'Live' });
      expect(liveOption).toBeEnabled();
    });
  });

  describe('when copying a playbook', () => {
    describe('when the request fails', () => {
      beforeEach(() => {
        withPlaybookCopyError();
      });

      it('should display an error message', async () => {
        await renderCopy();

        const cta = screen.getByRole('button', { name: 'Copy to target' });
        await userEvent.click(cta);

        await waitFor(() => {
          const errorMessage = screen.getByText('Something went wrong');
          expect(errorMessage).toBeInTheDocument();
        });
      });
    });

    describe('when the request succeeds', () => {
      beforeEach(() => {
        asAdminUser();
        withPlaybookCopy();
      });

      it('should display a success message', async () => {
        const pushMockFn = jest.fn();
        useRouterSpy({
          pathname: '/playbooks',
          push: pushMockFn,
        });

        await renderCopy();

        const cta = screen.getByRole('button', { name: 'Copy to target' });
        await userEvent.click(cta);

        await waitFor(() => {
          const toastTitle = screen.getByText('Playbook copied successfully');
          expect(toastTitle).toBeInTheDocument();
        });

        await waitFor(() => {
          const toastDescription = screen.getByText(
            'Playbook has been copied Acme organization, to the Sandbox environment.',
          );
          expect(toastDescription).toBeInTheDocument();
        });
      });

      it('should redirect to the playbook page when clicking on the toast cta', async () => {
        const pushMockFn = jest.fn();
        useRouterSpy({
          pathname: '/playbooks',
          push: pushMockFn,
        });

        await renderCopy();

        const cta = screen.getByRole('button', { name: 'Copy to target' });
        await userEvent.click(cta);

        const toastCta = await screen.findByRole('button', {
          name: 'Go to copied playbook',
        });
        await userEvent.click(toastCta);

        await waitFor(() => {
          expect(pushMockFn).toHaveBeenCalledWith({
            pathname: '/switch-org',
            query: {
              mode: 'live',
              redirect_url:
                '/playbooks/ob_config_id_7TU1EGLHwjoioStPuRyWpm_copy',
              tenant_id: 'org_e2FHVfOM5Hd3Ce492o5Aat',
            },
          });
        });
      });
    });
  });
});
