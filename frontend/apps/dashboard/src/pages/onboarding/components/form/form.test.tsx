import { customRender, screen, userEvent } from '@onefootprint/test-utils';
import React from 'react';

import Form, { FormProps } from './form';

describe('<Form />', () => {
  const renderForm = ({ onComplete = jest.fn() }: Partial<FormProps>) =>
    customRender(<Form onComplete={onComplete} />);

  describe('when completing all the steps', () => {
    it('should call the onComplete callback', async () => {
      const onComplete = jest.fn();
      renderForm({ onComplete });

      const welcomeStep = screen.getByText('Welcome to Footprint!');
      expect(welcomeStep).toBeInTheDocument();
      await userEvent.click(screen.getByRole('button', { name: 'Next' }));

      const userDataStep = screen.getByText('Tell us about you');
      expect(userDataStep).toBeInTheDocument();
      await userEvent.click(screen.getByRole('button', { name: 'Next' }));

      const companyDataStep = screen.getByText('Tell us about your company');
      expect(companyDataStep).toBeInTheDocument();
      await userEvent.click(screen.getByRole('button', { name: 'Next' }));

      const inviteStep = screen.getByText('Invite teammates');
      expect(inviteStep).toBeInTheDocument();
      await userEvent.click(screen.getByRole('button', { name: 'Complete' }));

      expect(onComplete).toHaveBeenCalled();
    });
  });

  describe('when completing all the steps, except the last one which is skipped', () => {
    it('should call the onComplete callback', async () => {
      const onComplete = jest.fn();
      renderForm({ onComplete });

      const welcomeStep = screen.getByText('Welcome to Footprint!');
      expect(welcomeStep).toBeInTheDocument();
      await userEvent.click(screen.getByRole('button', { name: 'Next' }));

      const userDataStep = screen.getByText('Tell us about you');
      expect(userDataStep).toBeInTheDocument();
      await userEvent.click(screen.getByRole('button', { name: 'Next' }));

      const companyDataStep = screen.getByText('Tell us about your company');
      expect(companyDataStep).toBeInTheDocument();
      await userEvent.click(screen.getByRole('button', { name: 'Next' }));

      const inviteStep = screen.getByText('Invite teammates');
      expect(inviteStep).toBeInTheDocument();
      await userEvent.click(screen.getByRole('button', { name: 'Skip' }));

      expect(onComplete).toHaveBeenCalled();
    });
  });
});
