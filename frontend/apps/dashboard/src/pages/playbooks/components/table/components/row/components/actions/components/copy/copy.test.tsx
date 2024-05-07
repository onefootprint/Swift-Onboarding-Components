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
  asAdminUserInSandbox,
  asAdminUserRestrictedToSandbox,
  resetUser,
} from 'src/config/tests';

import { type CopyProps } from './copy';
import {
  CopyWithButton,
  playbookFixture,
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

  describe('when the user is restricted to create live ob configs', () => {
    beforeEach(() => {
      asAdminUserRestrictedToSandbox();
    });

    it('should disable the "Live" option', async () => {
      await renderCopy();

      const liveOption = screen.getByRole('button', { name: 'Live' });
      expect(liveOption).toBeDisabled();
    });
  });

  describe('when the user is not restricted to create live ob configs', () => {
    it("should enable the 'Live' option", async () => {
      await renderCopy();

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
          const successMessage = screen.getByText(
            'Playbook copied successfully',
          );
          expect(successMessage).toBeInTheDocument();
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
            pathname: '/playbooks/ob_config_id_7TU1EGLHwjoioStPuRyWpm_copy',
          });
        });
      });

      describe('when the user copies a playbook to a different mode', () => {
        beforeEach(() => {
          asAdminUserInSandbox();
        });

        it('should show a toast with a message about the mode switch', async () => {
          await renderCopy();

          const mode = screen.getByRole('button', { name: 'Live' });
          await userEvent.click(mode);

          const cta = screen.getByRole('button', { name: 'Copy to target' });
          await userEvent.click(cta);

          const toastCta = await screen.findByRole('button', {
            name: 'Go to copied playbook',
          });
          await userEvent.click(toastCta);

          await waitFor(() => {
            const toast = screen.getByText('Changed to Live');
            expect(toast).toBeInTheDocument();
          });
        });
      });
    });
  });
});
