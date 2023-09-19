import {
  customRender,
  screen,
  userEvent,
  waitFor,
} from '@onefootprint/test-utils';
import React from 'react';

import Router from './router';
import {
  createPlaybook,
  enterName,
  moveForward,
  withCreateOnboardingConfigs,
} from './router.test.config';

const renderRouter = ({ onClose }: { onClose: () => void }) =>
  customRender(<Router onClose={onClose} />);

describe('<Router />', () => {
  describe('when doing KYC', () => {
    describe('when the request to create an ob config succeeds', () => {
      it('should create an onboarding config and show a confirmation', async () => {
        withCreateOnboardingConfigs();
        renderRouter({ onClose: jest.fn() });

        // Who to onboard
        await moveForward();

        // Residency
        await moveForward();

        // Name
        await enterName('KYC');
        await moveForward();

        // Summary
        await moveForward();

        // Authorized scopes
        await moveForward();

        // AML
        await createPlaybook();

        await waitFor(() => {
          const confirmation = screen.getByText(
            'Playbook created successfully.',
          );
          expect(confirmation).toBeInTheDocument();
        });
      });
    });

    describe('when in the "Residency" step', () => {
      it('should go to "Who to onboard" when clicking "Back"', async () => {
        renderRouter({ onClose: jest.fn() });

        // Who to onboard
        await moveForward();

        // Residency
        const back = screen.getByRole('button', { name: 'Back' });
        await userEvent.click(back);

        // Who to onboard
        const title = screen.getByText('Who would you like to onboard?');
        expect(title).toBeInTheDocument();
      });
    });

    describe('when in the "Name your Playbook" step', () => {
      it('should go to "Residency" when clicking "Back"', async () => {
        renderRouter({ onClose: jest.fn() });

        // Who to onboard
        await moveForward();

        // Residency
        await moveForward();

        // Name
        const back = screen.getByRole('button', { name: 'Back' });
        await userEvent.click(back);

        // Residency
        const title = screen.getByText(
          'Select the countries from which your users may onboard.',
        );
        expect(title).toBeInTheDocument();
      });
    });

    describe('when in the "Summary" step', () => {
      it('should go to "Name your Playbook" when clicking "Back"', async () => {
        renderRouter({ onClose: jest.fn() });

        // Who to onboard
        await moveForward();

        // Residency
        await moveForward();

        // Name
        await enterName('KYC');
        await moveForward();

        // Summary
        const back = screen.getByRole('button', { name: 'Back' });
        await userEvent.click(back);

        // Name
        const title = screen.getByText('Name your playbook');
        expect(title).toBeInTheDocument();
      });
    });

    describe('when in the "Authorized scopes" step', () => {
      it('should go to "Summary" when clicking "Back"', async () => {
        renderRouter({ onClose: jest.fn() });

        // Who to onboard
        await moveForward();

        // Residency
        await moveForward();

        // Name
        await enterName('KYC');
        await moveForward();

        // Summary
        await moveForward();

        // Authorized scopes
        const back = screen.getByRole('button', { name: 'Back' });
        await userEvent.click(back);

        // Summary
        const title = screen.getByText('Your Playbook recommendation');
        expect(title).toBeInTheDocument();
      });
    });

    describe('when in the "AML" step', () => {
      it('should go to "Authorized scopes" when clicking "Back"', async () => {
        renderRouter({ onClose: jest.fn() });

        // Who to onboard
        await moveForward();

        // Residency
        await moveForward();

        // Name
        await enterName('KYC');
        await moveForward();

        // Summary
        await moveForward();

        // Authorized scopes
        await moveForward();

        // AML
        const back = screen.getByRole('button', { name: 'Back' });
        await userEvent.click(back);

        // Authorized scopes
        const title = screen.getByText(
          'Select the data attributes you need read access to after an onboarding.',
          { exact: false },
        );
        expect(title).toBeInTheDocument();
      });
    });
  });

  describe('when doing KYB', () => {
    describe('when the request to create an ob config succeeds', () => {
      it('should create an onboarding config and show a confirmation', async () => {
        withCreateOnboardingConfigs();
        renderRouter({ onClose: jest.fn() });

        // Who to onboard
        const option = screen.getByRole('button', {
          name: 'Onboard businesses and their beneficial owners',
        });
        await userEvent.click(option);
        await moveForward();

        // Residency
        await moveForward();

        // Name
        await enterName('KYC');
        await moveForward();

        // Summary
        await moveForward();

        // Authorized scopes
        await moveForward();

        // AML
        await createPlaybook();

        await waitFor(() => {
          const confirmation = screen.getByText(
            'Playbook created successfully.',
          );
          expect(confirmation).toBeInTheDocument();
        });
      });
    });

    describe('when in the "Name your Playbook" step', () => {
      it('should go to "Who to onboard" when clicking "Back"', async () => {
        renderRouter({ onClose: jest.fn() });

        // Who to onboard
        const option = screen.getByRole('button', {
          name: 'Onboard businesses and their beneficial owners',
        });
        await userEvent.click(option);
        await moveForward();

        // Name
        const back = screen.getByRole('button', { name: 'Back' });
        await userEvent.click(back);

        // Who to onboard
        const title = screen.getByText('Who would you like to onboard?');
        expect(title).toBeInTheDocument();
      });
    });

    describe('when in the "Summary" step', () => {
      it('should go to "Name your Playbook" when clicking "Back"', async () => {
        renderRouter({ onClose: jest.fn() });

        // Who to onboard
        const option = screen.getByRole('button', {
          name: 'Onboard businesses and their beneficial owners',
        });
        await userEvent.click(option);
        await moveForward();

        // Name
        await enterName('KYB');
        await moveForward();

        // Summary
        const back = screen.getByRole('button', { name: 'Back' });
        await userEvent.click(back);

        // Name
        const title = screen.getByText('Name your playbook');
        expect(title).toBeInTheDocument();
      });
    });

    describe('when in the "Authorized scopes" step', () => {
      it('should go to "Summary" when clicking "Back"', async () => {
        renderRouter({ onClose: jest.fn() });

        // Who to onboard
        const option = screen.getByRole('button', {
          name: 'Onboard businesses and their beneficial owners',
        });
        await userEvent.click(option);
        await moveForward();

        // Name
        await enterName('KYB');
        await moveForward();

        // Summary
        await moveForward();

        // Authorized scopes
        const back = screen.getByRole('button', { name: 'Back' });
        await userEvent.click(back);

        // Summary
        const title = screen.getByText('Your Playbook recommendation');
        expect(title).toBeInTheDocument();
      });
    });

    describe('when in the "AML" step', () => {
      it('should go to "Authorized scopes" when clicking "Back"', async () => {
        renderRouter({ onClose: jest.fn() });

        // Who to onboard
        await moveForward();

        // Residency
        await moveForward();

        // Name
        await enterName('KYB');
        await moveForward();

        // Summary
        await moveForward();

        // Authorized scopes
        await moveForward();

        // AML
        const back = screen.getByRole('button', { name: 'Back' });
        await userEvent.click(back);

        // Authorized scopes
        const title = screen.getByText(
          'Select the data attributes you need read access to after an onboarding.',
          { exact: false },
        );
        expect(title).toBeInTheDocument();
      });
    });
  });
});
