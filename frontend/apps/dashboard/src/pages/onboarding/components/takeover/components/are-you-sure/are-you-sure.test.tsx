import { customRender, screen, userEvent } from '@onefootprint/test-utils';
import AreYouSure, { type AreYouSureProps } from './are-you-sure';
import {
  fourInProgressOnboardingsFixture,
  oneInProgressOnboardingFixture,
  oneInProgressOnboardingNoLinkFixture,
  threeInProgressOnboardingsFixture,
  twoInProgressOnboardingsFixture,
  twoInProgressOnboardingsNoLinksFixture,
  twoInProgressOnboardingsOneLinkFixture,
} from './are-you-sure.test.config';

describe('<AreYouSure />', () => {
  const defaultProps: AreYouSureProps = {
    isOpen: true,
    inProgressOnboardings: oneInProgressOnboardingFixture,
    onCancel: jest.fn(),
    onConfirm: jest.fn(),
  };

  const renderAreYouSure = (props: Partial<AreYouSureProps> = {}) => {
    return customRender(<AreYouSure {...defaultProps} {...props} />);
  };

  describe('single in-progress onboarding', () => {
    it('renders the cancel button and calls onCancel when clicked', async () => {
      const mockOnCancel = jest.fn();
      renderAreYouSure({ onCancel: mockOnCancel });
      const cancelButton = await screen.findByRole('button', { name: 'Cancel' });
      await userEvent.click(cancelButton);
      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    it('renders the create business account button and calls onCreateBusinessAccount when clicked', async () => {
      const mockOnConfirm = jest.fn();
      renderAreYouSure({ onConfirm: mockOnConfirm });
      const createBusinessAccountButton = await screen.findByRole('button', { name: 'Create business account' });
      await userEvent.click(createBusinessAccountButton);
      expect(mockOnConfirm).toHaveBeenCalledTimes(1);
    });

    it('renders the correct description with tenant name', async () => {
      renderAreYouSure();
      const description = await screen.findByLabelText('You may be here unintentionally.');
      const expectedText =
        "If you're a business looking to enhance customer verification and streamline compliance, we'd love to show you how Footprint can help. If you need to complete your onboarding with Flexcar, or need support, please go to their website or app instead.";
      expect(description.textContent).toEqual(expectedText);
    });

    it('renders a link with the correct href', async () => {
      renderAreYouSure();
      const link = await screen.findByRole('link', { name: 'go to their website or app instead.' });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', 'https://flexcar.com');
    });
  });

  describe('two in-progress onboardings', () => {
    it('renders the correct description with tenant names', async () => {
      renderAreYouSure({ inProgressOnboardings: twoInProgressOnboardingsFixture });
      const description = await screen.findByLabelText('You may be here unintentionally.');
      const flexcar = 'Flexcar';
      const composer = 'Composer';
      expect(description).toHaveTextContent(flexcar);
      expect(description).toHaveTextContent(composer);
    });

    it('renders two link buttons with correct text and href', async () => {
      renderAreYouSure({ inProgressOnboardings: twoInProgressOnboardingsFixture });
      const flexcarLink = await screen.findByRole('link', { name: 'Go to Flexcar' });
      const composerLink = await screen.findByRole('link', { name: 'Go to Composer' });

      expect(flexcarLink).toBeInTheDocument();
      expect(flexcarLink).toHaveAttribute('href', 'https://flexcar.com');

      expect(composerLink).toBeInTheDocument();
      expect(composerLink).toHaveAttribute('href', 'https://composer.com');
    });
  });

  describe('three in-progress onboardings', () => {
    it('renders the correct description with tenant names', async () => {
      renderAreYouSure({ inProgressOnboardings: threeInProgressOnboardingsFixture });
      const description = await screen.findByLabelText('You may be here unintentionally.');
      const flexcar = 'Flexcar';
      const composer = 'Composer';
      const bloom = 'Bloom';
      expect(description).toHaveTextContent(flexcar);
      expect(description).toHaveTextContent(composer);
      expect(description).toHaveTextContent(bloom);
    });

    it('renders three link buttons with correct text and href', async () => {
      renderAreYouSure({ inProgressOnboardings: threeInProgressOnboardingsFixture });
      const flexcarLink = await screen.findByRole('link', { name: 'Go to Flexcar' });
      const composerLink = await screen.findByRole('link', { name: 'Go to Composer' });
      const bloomLink = await screen.findByRole('link', { name: 'Go to Bloom' });

      expect(flexcarLink).toBeInTheDocument();
      expect(flexcarLink).toHaveAttribute('href', 'https://flexcar.com');

      expect(composerLink).toBeInTheDocument();
      expect(composerLink).toHaveAttribute('href', 'https://composer.com');

      expect(bloomLink).toBeInTheDocument();
      expect(bloomLink).toHaveAttribute('href', 'https://bloom.com');
    });
  });

  describe('four in-progress onboardings', () => {
    it('renders the correct description with tenant names', async () => {
      renderAreYouSure({ inProgressOnboardings: fourInProgressOnboardingsFixture });
      const description = await screen.findByLabelText('You may be here unintentionally.');
      const flexcar = 'Flexcar';
      const composer = 'Composer';
      const bloom = 'Bloom';
      const findigs = 'Findigs';
      expect(description).toHaveTextContent(flexcar);
      expect(description).toHaveTextContent(composer);
      expect(description).toHaveTextContent(bloom);
      expect(description).toHaveTextContent(findigs);
    });

    it('renders four link buttons with correct text and href', async () => {
      renderAreYouSure({ inProgressOnboardings: fourInProgressOnboardingsFixture });
      const flexcarLink = await screen.findByRole('link', { name: 'Go to Flexcar' });
      const composerLink = await screen.findByRole('link', { name: 'Go to Composer' });
      const bloomLink = await screen.findByRole('link', { name: 'Go to Bloom' });
      const findigsLink = await screen.findByRole('link', { name: 'Go to Findigs' });

      expect(flexcarLink).toBeInTheDocument();
      expect(flexcarLink).toHaveAttribute('href', 'https://flexcar.com');

      expect(composerLink).toBeInTheDocument();
      expect(composerLink).toHaveAttribute('href', 'https://composer.com');

      expect(bloomLink).toBeInTheDocument();
      expect(bloomLink).toHaveAttribute('href', 'https://bloom.com');

      expect(findigsLink).toBeInTheDocument();
      expect(findigsLink).toHaveAttribute('href', 'https://findigs.com');
    });
  });

  describe('single in-progress onboarding with no link', () => {
    it('renders the correct description with tenant name', async () => {
      renderAreYouSure({ inProgressOnboardings: oneInProgressOnboardingNoLinkFixture });
      const description = await screen.findByLabelText('You may be here unintentionally.');
      expect(description).toHaveTextContent('Flexcar');
    });

    it('does not render a link button', async () => {
      renderAreYouSure({ inProgressOnboardings: oneInProgressOnboardingNoLinkFixture });
      const linkButton = screen.queryByRole('link', { name: 'Go to Flexcar' });
      expect(linkButton).not.toBeInTheDocument();
    });
  });

  describe('two in-progress onboardings with no links', () => {
    it('renders the correct description with tenant names', async () => {
      renderAreYouSure({ inProgressOnboardings: twoInProgressOnboardingsNoLinksFixture });
      const description = await screen.findByLabelText('You may be here unintentionally.');
      expect(description).toHaveTextContent('Flexcar');
      expect(description).toHaveTextContent('Composer');
    });

    it('does not render any link buttons', async () => {
      renderAreYouSure({ inProgressOnboardings: twoInProgressOnboardingsNoLinksFixture });
      const flexcarLink = screen.queryByRole('link', { name: 'Go to Flexcar' });
      const composerLink = screen.queryByRole('link', { name: 'Go to Composer' });
      expect(flexcarLink).not.toBeInTheDocument();
      expect(composerLink).not.toBeInTheDocument();
    });
  });

  describe('two in-progress onboardings with one link', () => {
    it('renders the correct description with tenant names', async () => {
      renderAreYouSure({ inProgressOnboardings: twoInProgressOnboardingsOneLinkFixture });
      const description = await screen.findByLabelText('You may be here unintentionally.');
      expect(description).toHaveTextContent('Flexcar');
      expect(description).toHaveTextContent('Composer');
    });

    it('renders one link button with correct text and href', async () => {
      renderAreYouSure({ inProgressOnboardings: twoInProgressOnboardingsOneLinkFixture });
      const flexcarLink = await screen.findByRole('link', { name: 'Go to Flexcar' });
      const composerLink = screen.queryByRole('link', { name: 'Go to Composer' });
      expect(flexcarLink).toBeInTheDocument();
      expect(flexcarLink).toHaveAttribute('href', 'http://flexcar.com');
      expect(composerLink).not.toBeInTheDocument();
    });
  });
});
