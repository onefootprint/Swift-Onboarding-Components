import { customRender, screen, userEvent, waitFor } from '@onefootprint/test-utils';
import type { OnboardingConfig } from '@onefootprint/types';
import { asAdminUser, asUserWithScope, resetUser } from 'src/config/tests';

import Header from './header';
import onboardingConfigFixture from './header.test.config';

const renderHeader = (playbook: OnboardingConfig = onboardingConfigFixture) => {
  customRender(<Header playbook={playbook} isDisabled={false} />);
};

describe('<InfoSection />', () => {
  beforeEach(() => {
    asAdminUser();
  });

  afterAll(() => {
    resetUser();
  });

  it('should render edit button and no form when not editing', () => {
    renderHeader(onboardingConfigFixture);
    expect(screen.getByText('Edit playbook name')).toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('should render expected basic information when not editing', () => {
    renderHeader(onboardingConfigFixture);
    expect(screen.getByText('KYC')).toBeInTheDocument();
    expect(screen.getByText('Test playbook')).toBeInTheDocument();
    expect(screen.getByText('ob_config_pk_9VSl6Z7Ax9IQRIFkihw4lm')).toBeInTheDocument();
  });

  it('should render form with expected values when editing', async () => {
    renderHeader(onboardingConfigFixture);

    const edit = screen.getByRole('button', { name: 'Edit playbook name' });
    await userEvent.click(edit);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
    expect(screen.getByText('Playbook name')).toBeInTheDocument();
  });

  describe('when the user does not have permission to edit', () => {
    beforeEach(() => {
      asUserWithScope([]);
    });

    it('should show a tooltip and disallow editing', async () => {
      renderHeader(onboardingConfigFixture);

      const edit = screen.getByText('Edit playbook name');
      await userEvent.hover(edit);
      const notAllowedText = await screen.findAllByText("You're not allowed to edit Playbooks");
      expect(notAllowedText.length).toBeGreaterThan(0);

      await userEvent.click(edit);
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });
  });
});
