import {
  customRender,
  screen,
  selectEvents,
  userEvent,
  waitFor,
} from '@onefootprint/test-utils';
import React from 'react';
import { useStore } from 'src/hooks/use-session';

import Form, { FormProps } from './form';
import { withOrg, withUpdateOrg, withUpdateUser } from './form.test.config';

const originalState = useStore.getState();

describe('<Form />', () => {
  const renderForm = ({ onComplete = jest.fn() }: Partial<FormProps>) =>
    customRender(<Form onComplete={onComplete} />);

  beforeEach(() => {
    useStore.setState({
      data: {
        auth: '1',
        user: {
          id: 'orguser_0WFrWMZwP0C65s21w9lBBy',
          email: 'jane.doe@acme.com',
          firstName: 'Jane',
          lastName: 'Doe',
        },
        org: {
          isLive: false,
          logoUrl: null,
          name: 'Acme',
          isSandboxRestricted: true,
        },
      },
    });
  });

  beforeEach(() => {
    withOrg();
    withUpdateUser();
    withUpdateOrg();
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

      const firstNameField = screen.getByLabelText('First name');
      await userEvent.type(firstNameField, 'Jane');

      const lastNameField = screen.getByLabelText('Last name');
      await userEvent.type(lastNameField, 'Doe');

      await userEvent.click(screen.getByRole('button', { name: 'Next' }));

      // 3rd step
      await waitFor(() => {
        screen.getByText('Tell us about your company');
      });
      await waitFor(() => {
        screen.getByTestId('company-data-form');
        screen.getByRole('button', { name: 'Next' });
      });

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

      const emailField = screen.getByPlaceholderText('jane.doe@acme.com');
      await userEvent.type(emailField, 'jane.doe@acme.com');

      await userEvent.click(screen.getByRole('button', { name: 'Complete' }));
      await waitFor(() => {
        expect(onComplete).toHaveBeenCalled();
      });

      await userEvent.click(screen.getByRole('button', { name: 'Skip' }));
      await waitFor(() => {
        expect(onComplete).toHaveBeenCalledTimes(2);
      });
    });
  });
});
