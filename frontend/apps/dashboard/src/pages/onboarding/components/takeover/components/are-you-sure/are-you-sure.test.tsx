import { customRender, screen, userEvent } from '@onefootprint/test-utils';
import AreYouSure from './are-you-sure';
import { oneInProgressOnboardingFixture } from './are-you-sure.test.config';

describe('<AreYouSure />', () => {
  describe('single in-progress onboarding', () => {
    it('renders the cancel button and calls onCancel when clicked', async () => {
      const mockOnCancel = jest.fn();
      customRender(
        <AreYouSure
          isOpen={true}
          inProgressOnboardings={oneInProgressOnboardingFixture}
          onCancel={mockOnCancel}
          onCreateBusinessAccount={jest.fn()}
        />,
      );
      const cancelButton = screen.getByRole('button', { name: 'Cancel' });
      await userEvent.click(cancelButton);
      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    it('renders the create business account button and calls onCreateBusinessAccount when clicked', async () => {
      const mockOnCreateBusinessAccount = jest.fn();
      customRender(
        <AreYouSure
          isOpen={true}
          inProgressOnboardings={oneInProgressOnboardingFixture}
          onCancel={jest.fn()}
          onCreateBusinessAccount={mockOnCreateBusinessAccount}
        />,
      );
      const createBusinessAccountButton = screen.getByRole('button', { name: 'Create business account' });
      await userEvent.click(createBusinessAccountButton);
      expect(mockOnCreateBusinessAccount).toHaveBeenCalledTimes(1);
    });

    it('renders the correct description with tenant name', () => {
      customRender(
        <AreYouSure
          isOpen={true}
          inProgressOnboardings={oneInProgressOnboardingFixture}
          onCancel={jest.fn()}
          onCreateBusinessAccount={jest.fn()}
        />,
      );
      const description = screen.getByLabelText('description');
      const expectedText =
        "If you're a business looking to enhance customer verification and streamline compliance, we'd love to show you how Footprint can help. If you need to complete your onboarding with Flexcar, or need support, please go to their website or app instead.";
      expect(description.textContent).toEqual(expectedText);
    });

    it('renders a link with the correct href', () => {
      customRender(
        <AreYouSure
          isOpen={true}
          inProgressOnboardings={oneInProgressOnboardingFixture}
          onCancel={jest.fn()}
          onCreateBusinessAccount={jest.fn()}
        />,
      );
      const link = screen.getByRole('link', { name: 'go to their website or app instead.' });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', 'https://flexcar.com');
    });
  });
});
