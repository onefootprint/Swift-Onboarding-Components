import { customRender, screen, userEvent } from '@onefootprint/test-utils';
import type { InProgressOnboarding } from '@onefootprint/types';
import Takeover from './takeover';
import {
  fourInProgressOnboardingsFixture,
  oneInProgressOnboardingFixture,
  oneInProgressOnboardingNoLinkFixture,
  threeInProgressOnboardingsFixture,
  twoInProgressOnboardingsFixture,
  twoInProgressOnboardingsNoLinksFixture,
  twoInProgressOnboardingsOneLinkFixture,
} from './takeover.test.config';

describe('Takeover', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderTakeover = (inProgressOnboardings: InProgressOnboarding[]) => {
    return customRender(<Takeover inProgressOnboardings={inProgressOnboardings} onConfirm={jest.fn()} />);
  };

  describe('has one tenant', () => {
    it('button shows up properly and opens correct URL when clicked', async () => {
      renderTakeover(oneInProgressOnboardingFixture);
      const mockWindowOpen = jest.fn();
      Object.defineProperty(window, 'open', {
        writable: true,
        value: mockWindowOpen,
      });

      const button = await screen.findByRole('button', { name: 'Go to Flexcar' });
      await userEvent.click(button);
      expect(mockWindowOpen).toHaveBeenCalledWith('https://flexcar.com', '_blank', 'noopener,noreferrer');
    });

    it('description shows tenant name', async () => {
      renderTakeover(oneInProgressOnboardingFixture);
      const description = await screen.findByLabelText('description');
      const tenant1 = 'Flexcar';
      expect(description).toBeInTheDocument();
      expect(description).toHaveTextContent(tenant1);
    });
  });

  describe('has two tenants', () => {
    it('shows two buttons and opens correct URLs when clicked', async () => {
      renderTakeover(twoInProgressOnboardingsFixture);
      const mockWindowOpen = jest.fn();
      Object.defineProperty(window, 'open', {
        writable: true,
        value: mockWindowOpen,
      });

      const button1 = await screen.findByRole('button', { name: 'Go to Flexcar' });
      const button2 = await screen.findByRole('button', { name: 'Go to Composer' });

      await userEvent.click(button1);
      expect(mockWindowOpen).toHaveBeenCalledWith('https://flexcar.com', '_blank', 'noopener,noreferrer');

      await userEvent.click(button2);
      expect(mockWindowOpen).toHaveBeenCalledWith('https://composer.com', '_blank', 'noopener,noreferrer');
    });

    it('description shows both tenant names', async () => {
      renderTakeover(twoInProgressOnboardingsFixture);
      const description = await screen.findByLabelText('description');
      const tenant1 = 'Flexcar';
      const tenant2 = 'Composer';
      expect(description).toBeInTheDocument();
      expect(description).toHaveTextContent(tenant1);
      expect(description).toHaveTextContent(tenant2);
    });
  });

  describe('has three tenants', () => {
    it('shows three buttons and opens correct URLs when clicked', async () => {
      renderTakeover(threeInProgressOnboardingsFixture);
      const mockWindowOpen = jest.fn();
      Object.defineProperty(window, 'open', {
        writable: true,
        value: mockWindowOpen,
      });

      const button1 = await screen.findByRole('button', { name: 'Go to Flexcar' });
      const button2 = await screen.findByRole('button', { name: 'Go to Composer' });
      const button3 = await screen.findByRole('button', { name: 'Go to Bloom' });

      await userEvent.click(button1);
      expect(mockWindowOpen).toHaveBeenCalledWith('https://flexcar.com', '_blank', 'noopener,noreferrer');

      await userEvent.click(button2);
      expect(mockWindowOpen).toHaveBeenCalledWith('https://composer.com', '_blank', 'noopener,noreferrer');

      await userEvent.click(button3);
      expect(mockWindowOpen).toHaveBeenCalledWith('https://bloom.com', '_blank', 'noopener,noreferrer');
    });

    it('description shows all tenant names', async () => {
      renderTakeover(threeInProgressOnboardingsFixture);
      const description = await screen.findByLabelText('description');
      const tenant1 = 'Flexcar';
      const tenant2 = 'Composer';
      const tenant3 = 'Bloom';
      expect(description).toBeInTheDocument();
      expect(description).toHaveTextContent(tenant1);
      expect(description).toHaveTextContent(tenant2);
      expect(description).toHaveTextContent(tenant3);
    });
  });

  describe('has four tenants', () => {
    it('shows four buttons and opens correct URLs when clicked', async () => {
      renderTakeover(fourInProgressOnboardingsFixture);
      const mockWindowOpen = jest.fn();
      Object.defineProperty(window, 'open', {
        writable: true,
        value: mockWindowOpen,
      });

      const button1 = await screen.findByRole('button', { name: 'Go to Flexcar' });
      const button2 = await screen.findByRole('button', { name: 'Go to Composer' });
      const button3 = await screen.findByRole('button', { name: 'Go to Bloom' });
      const button4 = await screen.findByRole('button', { name: 'Go to Findigs' });

      await userEvent.click(button1);
      expect(mockWindowOpen).toHaveBeenCalledWith('https://flexcar.com', '_blank', 'noopener,noreferrer');

      await userEvent.click(button2);
      expect(mockWindowOpen).toHaveBeenCalledWith('https://composer.com', '_blank', 'noopener,noreferrer');

      await userEvent.click(button3);
      expect(mockWindowOpen).toHaveBeenCalledWith('https://bloom.com', '_blank', 'noopener,noreferrer');

      await userEvent.click(button4);
      expect(mockWindowOpen).toHaveBeenCalledWith('https://findigs.com', '_blank', 'noopener,noreferrer');
    });

    it('description shows all tenant names', async () => {
      renderTakeover(fourInProgressOnboardingsFixture);
      const description = await screen.findByLabelText('description');
      const tenant1 = 'Flexcar';
      const tenant2 = 'Composer';
      const tenant3 = 'Bloom';
      const tenant4 = 'Findigs';
      expect(description).toBeInTheDocument();
      expect(description).toHaveTextContent(tenant1);
      expect(description).toHaveTextContent(tenant2);
      expect(description).toHaveTextContent(tenant3);
      expect(description).toHaveTextContent(tenant4);
    });
  });
  describe('has one tenant with no link', () => {
    it('renders the correct description with tenant name', () => {
      renderTakeover(oneInProgressOnboardingNoLinkFixture);
      const description = screen.getByLabelText('description');
      const tenant = 'Flexcar';
      expect(description).toHaveTextContent(tenant);
    });

    it('does not render a button', () => {
      renderTakeover(oneInProgressOnboardingNoLinkFixture);
      const button = screen.queryByRole('button', { name: 'Go to Flexcar' });
      expect(button).not.toBeInTheDocument();
    });
  });

  describe('has two tenants with no links', () => {
    it('renders the correct description with tenant names', () => {
      renderTakeover(twoInProgressOnboardingsNoLinksFixture);
      const description = screen.getByLabelText('description');
      const tenant1 = 'Flexcar';
      const tenant2 = 'Composer';
      expect(description).toHaveTextContent(tenant1);
      expect(description).toHaveTextContent(tenant2);
    });

    it('does not render any buttons', () => {
      renderTakeover(twoInProgressOnboardingsNoLinksFixture);
      const flexcarButton = screen.queryByRole('button', { name: 'Go to Flexcar' });
      const composerButton = screen.queryByRole('button', { name: 'Go to Composer' });
      expect(flexcarButton).not.toBeInTheDocument();
      expect(composerButton).not.toBeInTheDocument();
    });
  });

  describe('has two tenants with one link', () => {
    it('renders the correct description with tenant names', () => {
      renderTakeover(twoInProgressOnboardingsOneLinkFixture);
      const description = screen.getByLabelText('description');
      const tenant1 = 'Flexcar';
      const tenant2 = 'Composer';
      expect(description).toHaveTextContent(tenant1);
      expect(description).toHaveTextContent(tenant2);
    });

    it('renders one button with correct text and opens correct URL when clicked', async () => {
      renderTakeover(twoInProgressOnboardingsOneLinkFixture);
      const mockWindowOpen = jest.fn();
      Object.defineProperty(window, 'open', {
        writable: true,
        value: mockWindowOpen,
      });

      const flexcarButton = screen.getByRole('button', { name: 'Go to Flexcar' });
      const composerButton = screen.queryByRole('button', { name: 'Go to Composer' });

      expect(flexcarButton).toBeInTheDocument();
      expect(composerButton).not.toBeInTheDocument();

      await userEvent.click(flexcarButton);
      expect(mockWindowOpen).toHaveBeenCalledWith('http://flexcar.com', '_blank', 'noopener,noreferrer');
    });
  });
});
