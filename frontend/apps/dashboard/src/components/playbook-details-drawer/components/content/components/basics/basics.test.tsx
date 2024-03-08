import { customRender, screen, userEvent } from '@onefootprint/test-utils';
import React from 'react';
import { asAdminUser, asUserWithScope, resetUser } from 'src/config/tests';

import type { BasicsProps } from './basics';
import Basics from './basics';
import onboardingConfigFixture from './basics.test.config';

const renderBasics = ({ playbook = onboardingConfigFixture }: BasicsProps) => {
  customRender(<Basics playbook={playbook} />);
};

describe('<InfoSection />', () => {
  beforeEach(() => {
    asAdminUser();
  });

  afterAll(() => {
    resetUser();
  });

  it('should render edit button and no form when not editing', () => {
    renderBasics({ playbook: onboardingConfigFixture });
    expect(screen.getByText('Edit Playbook name')).toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('should render expected basic information when not editing', () => {
    renderBasics({ playbook: onboardingConfigFixture });
    expect(screen.getByText('Type')).toBeInTheDocument();
    expect(screen.getByText('KYC')).toBeInTheDocument();
    expect(screen.getByText('Playbook name')).toBeInTheDocument();
    expect(screen.getByText('Test playbook')).toBeInTheDocument();
    expect(screen.getByText('Publishable key')).toBeInTheDocument();
    expect(
      screen.getByText('ob_config_pk_9VSl6Z7Ax9IQRIFkihw4lm'),
    ).toBeInTheDocument();
  });

  it('should render form with expected values when editing', async () => {
    renderBasics({ playbook: onboardingConfigFixture });

    const edit = screen.getByRole('button', { name: 'Edit Playbook name' });
    await userEvent.click(edit);

    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
    expect(screen.getByText('Playbook name')).toBeInTheDocument();
  });

  it('should not render basic information while ediitng', async () => {
    renderBasics({ playbook: onboardingConfigFixture });

    const edit = screen.getByRole('button', { name: 'Edit Playbook name' });
    await userEvent.click(edit);

    expect(screen.queryByText('Type')).not.toBeInTheDocument();
    expect(screen.queryByText('KYC')).not.toBeInTheDocument();
    expect(screen.getAllByText('Playbook name').length).toEqual(1);
    expect(screen.queryByText('Publishable key')).not.toBeInTheDocument();
    expect(
      screen.queryByText('ob_config_pk_9VSl6Z7Ax9IQRIFkihw4lm'),
    ).not.toBeInTheDocument();
  });

  describe('when the user does not have permission to edit', () => {
    beforeEach(() => {
      asUserWithScope([]);
    });

    it('should disable the edit button', () => {
      renderBasics({
        playbook: onboardingConfigFixture,
      });

      const edit = screen.getByText('Edit Playbook name');
      expect(edit).toBeDisabled();
    });
  });
});
