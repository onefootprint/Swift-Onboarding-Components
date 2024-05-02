import {
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
import { CopyWithButton, playbookFixture } from './copy.test.config';

describe('<Copy />', () => {
  const renderCopy = async ({
    playbook = playbookFixture,
  }: Partial<CopyProps> = {}) => {
    customRender(<CopyWithButton playbook={playbook} />);
    await userEvent.click(screen.getByRole('button', { name: 'Open' }));

    await waitFor(() => {
      const modal = screen.getByRole('dialog', { name: 'Copying playbook' });
      expect(modal).toBeInTheDocument();
    });
  };

  afterEach(() => {
    resetUser();
  });

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
    beforeEach(() => {
      asAdminUser();
    });

    it("should enable the 'Live' option", async () => {
      await renderCopy();

      const liveOption = screen.getByRole('button', { name: 'Live' });
      expect(liveOption).toBeEnabled();
    });
  });
});
