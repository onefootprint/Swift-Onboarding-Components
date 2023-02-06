import {
  customRender,
  screen,
  userEvent,
  waitFor,
} from '@onefootprint/test-utils';
import React from 'react';
import { useStore } from 'src/hooks/use-session';

import UserData, { UserDataProps } from './user-data';
import { withUpdateUser, withUpdateUserError } from './user-data.test.config';

const originalState = useStore.getState();

describe('<UserData />', () => {
  beforeEach(() => {
    withUpdateUser();
    useStore.setState({
      data: {
        auth: '1',
        user: {
          id: 'orguser_0WFrWMZwP0C65s21w9lBBy',
          email: 'jane.doe@acme.com',
          firstName: '',
          lastName: '',
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

  afterAll(() => {
    useStore.setState(originalState);
  });

  const renderUserData = ({
    id = 'company-form',
    onComplete = jest.fn(),
  }: Partial<UserDataProps>) => {
    customRender(
      <>
        <div id="onboarding-cta-portal" />
        <UserData id={id} onComplete={onComplete} />
      </>,
    );
  };

  it('should show the email of the user logged', () => {
    renderUserData({});

    const emailField = screen.getByDisplayValue('jane.doe@acme.com');
    expect(emailField).toBeInTheDocument();
    expect(emailField).toBeDisabled();
  });

  describe('when the name is already filled', () => {
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
      renderUserData({});

      const submitButton = screen.getByRole('button', { name: 'Next' });
      await userEvent.click(submitButton);
      const firstNameError = await screen.findByText(
        'Please enter a first name',
      );
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
});
