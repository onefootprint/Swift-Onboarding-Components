import {
  customRender,
  screen,
  userEvent,
  waitFor,
} from '@onefootprint/test-utils';
import React from 'react';

import type { RouterProps } from './router';
import Router from './router';
import {
  createPlaybook,
  enterName,
  moveForward,
  withCreateOnboardingConfigs,
} from './router.test.config';

const renderRouter = (
  { onCreate }: RouterProps = {
    onCreate: jest.fn(),
  },
) => customRender(<Router onCreate={onCreate} />);

describe('<Router />', () => {
  describe('when doing KYC', () => {
    describe('when the request to create an ob config succeeds', () => {
      it('should create an onboarding config and show a confirmation', async () => {
        const onCreate = jest.fn();
        withCreateOnboardingConfigs();
        renderRouter({ onCreate });

        // Who to onboard
        await moveForward();

        // Residency
        await moveForward();

        // Name
        await enterName('KYC');
        await moveForward();

        // Summary
        await moveForward();

        // AML
        await createPlaybook();

        await waitFor(() => {
          const confirmation = screen.getByText(
            'Playbook created successfully.',
          );
          expect(confirmation).toBeInTheDocument();
        });

        await waitFor(() => {
          expect(onCreate).toHaveBeenCalled();
        });
      });
    });

    describe('when in the "Residency" step', () => {
      it('should go to "Who to onboard" when clicking "Back"', async () => {
        renderRouter({ onCreate: jest.fn() });

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
        renderRouter({ onCreate: jest.fn() });

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
        renderRouter({ onCreate: jest.fn() });

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

    describe('when in the "AML" step', () => {
      it('should go to "Summary" when clicking "Back"', async () => {
        renderRouter({ onCreate: jest.fn() });

        // Who to onboard
        await moveForward();

        // Residency
        await moveForward();

        // Name
        await enterName('KYC');
        await moveForward();

        // Summary
        await moveForward();

        // AML
        const back = screen.getByRole('button', { name: 'Back' });
        await userEvent.click(back);

        // Summary
        const title = screen.getByText('Your Playbook recommendation');
        expect(title).toBeInTheDocument();
      });
    });
  });

  describe('when doing KYB', () => {
    describe('when the request to create an ob config succeeds', () => {
      it('should create an onboarding config and show a confirmation', async () => {
        withCreateOnboardingConfigs();
        renderRouter({ onCreate: jest.fn() });

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
        renderRouter({ onCreate: jest.fn() });

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
        renderRouter({ onCreate: jest.fn() });

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

    describe('when in the "AML" step', () => {
      it('should go to "Summary" when clicking "Back"', async () => {
        renderRouter({ onCreate: jest.fn() });

        // Who to onboard
        await moveForward();

        // Residency
        await moveForward();

        // Name
        await enterName('KYB');
        await moveForward();

        // Summary
        await moveForward();

        // AML
        const back = screen.getByRole('button', { name: 'Back' });
        await userEvent.click(back);

        // Summary
        const title = screen.getByText('Your Playbook recommendation');
        expect(title).toBeInTheDocument();
      });
    });
  });
});
