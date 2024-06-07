import { customRender, screen, userEvent, waitFor } from '@onefootprint/test-utils';
import React from 'react';
import { asAdminUser, asUser, resetUser } from 'src/config/tests';

import type { UserDataProps } from './user-data';
import UserData from './user-data';
import { withUpdateUser, withUpdateUserError } from './user-data.test.config';

describe('<UserData />', () => {
  beforeEach(() => {
    withUpdateUser();
    asAdminUser();
  });

  afterAll(() => {
    resetUser();
  });

  const renderUserData = ({ onBack = jest.fn(), onComplete = jest.fn() }: Partial<UserDataProps>) => {
    customRender(<UserData onComplete={onComplete} onBack={onBack} />);
  };

  it('should show the email of the user logged', () => {
    renderUserData({});

    const emailField = screen.getByDisplayValue('jane.doe@acme.com');
    expect(emailField).toBeInTheDocument();
    expect(emailField).toBeDisabled();
  });

  describe('when the name is already filled', () => {
    it('should show the name of the user logged', () => {
      renderUserData({});

      const firstNameField = screen.getByDisplayValue('Jane');
      expect(firstNameField).toBeInTheDocument();
      const lastNameField = screen.getByDisplayValue('Doe');
      expect(lastNameField).toBeInTheDocument();
    });
  });

  describe('when submitting the form', () => {
    it('should show an error when the first input is not filled correctly', async () => {
      asUser({ firstName: '', lastName: '' });
      renderUserData({});

      const submitButton = screen.getByRole('button', { name: 'Next' });
      await userEvent.click(submitButton);
      const firstNameError = await screen.findByText('Please enter a first name');
      expect(firstNameError).toBeInTheDocument();
      const lastNameError = await screen.findByText('Please enter a last name');
      expect(lastNameError).toBeInTheDocument();
    });

    it('should call onComplete when the form is valid', async () => {
      const onComplete = jest.fn();
      renderUserData({ onComplete });

      const firstNameField = screen.getByLabelText('First name');
      await userEvent.type(firstNameField, 'Jane');

      const lastNameField = screen.getByLabelText('Last name');
      await userEvent.type(lastNameField, 'Doe');

      const submitButton = screen.getByRole('button', { name: 'Next' });
      await userEvent.click(submitButton);
      await waitFor(() => {
        expect(onComplete).toHaveBeenCalled();
      });
    });

    describe('when the request fails', () => {
      beforeEach(() => {
        withUpdateUserError();
      });

      it('should show an error messsage', async () => {
        renderUserData({});

        const firstNameField = screen.getByLabelText('First name');
        await userEvent.type(firstNameField, 'Jane');

        const lastNameField = screen.getByLabelText('Last name');
        await userEvent.type(lastNameField, 'Doe');

        const submitButton = screen.getByRole('button', { name: 'Next' });
        await userEvent.click(submitButton);

        await waitFor(() => {
          const errorMessage = screen.getByText('Something went wrong');
          expect(errorMessage).toBeInTheDocument();
        });
      });
    });
  });

  describe('when clicking on the back button', () => {
    it('should call onBack', async () => {
      const onBack = jest.fn();
      renderUserData({ onBack });

      const backButton = screen.getByRole('button', { name: 'Back' });
      await userEvent.click(backButton);

      expect(onBack).toHaveBeenCalled();
    });
  });
});
