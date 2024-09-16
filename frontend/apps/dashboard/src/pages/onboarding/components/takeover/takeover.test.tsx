import { customRender, screen, userEvent } from '@onefootprint/test-utils';
import Takeover from './takeover';
import {
  fourInProgressOnboardingsFixture,
  oneInProgressOnboardingFixture,
  threeInProgressOnboardingsFixture,
  twoInProgressOnboardingsFixture,
} from './takeover.test.config';

describe('Takeover', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('has one tenant', () => {
    beforeEach(() => {
      customRender(<Takeover inProgressOnboardings={oneInProgressOnboardingFixture} />);
    });

    it('button shows up properly and opens correct URL when clicked', async () => {
      const mockWindowOpen = jest.fn();
      Object.defineProperty(window, 'open', {
        writable: true,
        value: mockWindowOpen,
      });

      const button = screen.getByRole('button', { name: 'Go to Flexcar' });
      await userEvent.click(button);
      expect(mockWindowOpen).toHaveBeenCalledWith('https://flexcar.com', '_blank', 'noopener,noreferrer');
    });

    it('description shows tenant name', () => {
      const description = screen.getByLabelText('description');
      const tenant1 = 'Flexcar';
      expect(description).toBeInTheDocument();
      expect(description).toHaveTextContent(tenant1);
    });
  });

  describe('has two tenants', () => {
    beforeEach(() => {
      customRender(<Takeover inProgressOnboardings={twoInProgressOnboardingsFixture} />);
    });

    it('shows two buttons and opens correct URLs when clicked', async () => {
      const mockWindowOpen = jest.fn();
      Object.defineProperty(window, 'open', {
        writable: true,
        value: mockWindowOpen,
      });

      const button1 = screen.getByRole('button', { name: 'Go to Flexcar' });
      const button2 = screen.getByRole('button', { name: 'Go to Composer' });

      await userEvent.click(button1);
      expect(mockWindowOpen).toHaveBeenCalledWith('https://flexcar.com', '_blank', 'noopener,noreferrer');

      await userEvent.click(button2);
      expect(mockWindowOpen).toHaveBeenCalledWith('https://composer.com', '_blank', 'noopener,noreferrer');
    });

    it('description shows both tenant names', () => {
      const description = screen.getByLabelText('description');
      const tenant1 = 'Flexcar';
      const tenant2 = 'Composer';
      expect(description).toBeInTheDocument();
      expect(description).toHaveTextContent(tenant1);
      expect(description).toHaveTextContent(tenant2);
    });
  });

  describe('has three tenants', () => {
    beforeEach(() => {
      customRender(<Takeover inProgressOnboardings={threeInProgressOnboardingsFixture} />);
    });

    it('shows three buttons and opens correct URLs when clicked', async () => {
      const mockWindowOpen = jest.fn();
      Object.defineProperty(window, 'open', {
        writable: true,
        value: mockWindowOpen,
      });

      const button1 = screen.getByRole('button', { name: 'Go to Flexcar' });
      const button2 = screen.getByRole('button', { name: 'Go to Composer' });
      const button3 = screen.getByRole('button', { name: 'Go to Bloom' });

      await userEvent.click(button1);
      expect(mockWindowOpen).toHaveBeenCalledWith('https://flexcar.com', '_blank', 'noopener,noreferrer');

      await userEvent.click(button2);
      expect(mockWindowOpen).toHaveBeenCalledWith('https://composer.com', '_blank', 'noopener,noreferrer');

      await userEvent.click(button3);
      expect(mockWindowOpen).toHaveBeenCalledWith('https://bloom.com', '_blank', 'noopener,noreferrer');
    });

    it('description shows all tenant names', () => {
      const description = screen.getByLabelText('description');
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
    beforeEach(() => {
      customRender(<Takeover inProgressOnboardings={fourInProgressOnboardingsFixture} />);
    });

    it('shows four buttons and opens correct URLs when clicked', async () => {
      const mockWindowOpen = jest.fn();
      Object.defineProperty(window, 'open', {
        writable: true,
        value: mockWindowOpen,
      });

      const button1 = screen.getByRole('button', { name: 'Go to Flexcar' });
      const button2 = screen.getByRole('button', { name: 'Go to Composer' });
      const button3 = screen.getByRole('button', { name: 'Go to Bloom' });
      const button4 = screen.getByRole('button', { name: 'Go to Findigs' });

      await userEvent.click(button1);
      expect(mockWindowOpen).toHaveBeenCalledWith('https://flexcar.com', '_blank', 'noopener,noreferrer');

      await userEvent.click(button2);
      expect(mockWindowOpen).toHaveBeenCalledWith('https://composer.com', '_blank', 'noopener,noreferrer');

      await userEvent.click(button3);
      expect(mockWindowOpen).toHaveBeenCalledWith('https://bloom.com', '_blank', 'noopener,noreferrer');

      await userEvent.click(button4);
      expect(mockWindowOpen).toHaveBeenCalledWith('https://findigs.com', '_blank', 'noopener,noreferrer');
    });

    it('description shows all tenant names', () => {
      const description = screen.getByLabelText('description');
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
});
