import {
  customRender,
  screen,
  selectEvents,
  userEvent,
  waitFor,
} from '@onefootprint/test-utils';
import React from 'react';
import { useStore } from 'src/hooks/use-session-user';

import Form, { FormProps } from './form';

const originalState = useStore.getState();

describe('<Form />', () => {
  const renderForm = ({ onComplete = jest.fn() }: Partial<FormProps>) =>
    customRender(<Form onComplete={onComplete} />);

  beforeEach(() => {
    useStore.setState({
      data: {
        auth: '1',
        email: 'jane.doe@acme.com',
        firstName: 'Jane',
        lastName: 'Doe',
        sandboxRestricted: false,
        tenantName: 'Footprint',
      },
    });
  });

  afterAll(() => {
    useStore.setState(originalState);
  });

  describe('when completing all the steps', () => {
    it('should call the onComplete callback', async () => {
      const onComplete = jest.fn();
      renderForm({ onComplete });

      // 1st step
      await waitFor(() => {
        screen.getByText('Welcome to Footprint!');
      });
      const welcomeStep = screen.getByText('Welcome to Footprint!');
      expect(welcomeStep).toBeInTheDocument();

      await userEvent.click(screen.getByRole('button', { name: 'Next' }));

      // 2nd step
      await waitFor(() => {
        screen.getByText('Tell us about you');
      });
      const userDataStep = screen.getByText('Tell us about you');
      expect(userDataStep).toBeInTheDocument();

      const nameField = screen.getByLabelText('Full name');
      await userEvent.type(nameField, 'Jane Doe');

      await userEvent.click(screen.getByRole('button', { name: 'Next' }));

      // 3rd step
      await waitFor(() => {
        screen.getByText('Tell us about your company');
      });
      const companyDataStep = screen.getByText('Tell us about your company');
      expect(companyDataStep).toBeInTheDocument();

      const companyNameField = screen.getByLabelText('Company name');
      await userEvent.type(companyNameField, 'Acme Inc.');

      const companyWebsiteField = screen.getByLabelText('Company website');
      await userEvent.type(companyWebsiteField, 'https://www.acme.com');

      const companySizeTrigger = screen.getByRole('button', { name: 'Select' });
      await selectEvents.select(companySizeTrigger, '1-10');

      await userEvent.click(screen.getByRole('button', { name: 'Next' }));

      // 4th step
      await waitFor(() => {
        screen.getByText('Invite teammates');
      });
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

      // 1st step
      await waitFor(() => {
        screen.getByText('Welcome to Footprint!');
      });
      const welcomeStep = screen.getByText('Welcome to Footprint!');
      expect(welcomeStep).toBeInTheDocument();

      await userEvent.click(screen.getByRole('button', { name: 'Next' }));

      // 2nd step
      await waitFor(() => {
        screen.getByText('Tell us about you');
      });
      const userDataStep = screen.getByText('Tell us about you');
      expect(userDataStep).toBeInTheDocument();

      const nameField = screen.getByLabelText('Full name');
      await userEvent.type(nameField, 'Jane Doe');

      await userEvent.click(screen.getByRole('button', { name: 'Next' }));

      // 3rd step
      await waitFor(() => {
        screen.getByText('Tell us about your company');
      });
      const companyDataStep = screen.getByText('Tell us about your company');
      expect(companyDataStep).toBeInTheDocument();

      const companyNameField = screen.getByLabelText('Company name');
      await userEvent.type(companyNameField, 'Acme Inc.');

      const companyWebsiteField = screen.getByLabelText('Company website');
      await userEvent.type(companyWebsiteField, 'https://www.acme.com');

      const companySizeTrigger = screen.getByRole('button', { name: 'Select' });
      await selectEvents.select(companySizeTrigger, '1-10');

      await userEvent.click(screen.getByRole('button', { name: 'Next' }));

      // 4th step
      await waitFor(() => {
        screen.getByText('Invite teammates');
      });
      const inviteStep = screen.getByText('Invite teammates');
      expect(inviteStep).toBeInTheDocument();
      await userEvent.click(screen.getByRole('button', { name: 'Skip' }));
      expect(onComplete).toHaveBeenCalled();
    });
  });
});
