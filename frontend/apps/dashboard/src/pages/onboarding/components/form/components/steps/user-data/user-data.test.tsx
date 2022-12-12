import {
  customRender,
  screen,
  userEvent,
  waitFor,
} from '@onefootprint/test-utils';
import React from 'react';
import { useStore } from 'src/hooks/use-session';

import UserData, { UserDataProps } from './user-data';

const originalState = useStore.getState();

describe('<UserData />', () => {
  const renderUserData = ({
    id = 'company-form',
    onComplete = jest.fn(),
  }: Partial<UserDataProps>) => {
    customRender(
      <>
        <UserData id={id} onComplete={onComplete} />
        <button form={id} type="submit">
          Next
        </button>
      </>,
    );
  };

  beforeEach(() => {
    useStore.setState({
      data: {
        auth: '1',
        user: {
          email: 'jane.doe@acme.com',
          firstName: 'Jane',
          lastName: 'Doe',
        },
        org: {
          isLive: false,
          name: 'Acme',
          sandboxRestricted: false,
        },
      },
    });
  });

  afterAll(() => {
    useStore.setState(originalState);
  });

  it('should render the email of the user logged', () => {
    renderUserData({});
    const emailField = screen.getByDisplayValue('jane.doe@acme.com');
    expect(emailField).toBeInTheDocument();
    expect(emailField).toBeDisabled();
  });

  describe('when submitting the form', () => {
    it('should show an error when the first input is not filled correctly', async () => {
      renderUserData({});
      const submitButton = screen.getByRole('button', { name: 'Next' });
      await userEvent.click(submitButton);
      const error = await screen.findByText('Please enter a name');
      expect(error).toBeInTheDocument();
    });

    it('should call onComplete when the form is valid', async () => {
      const onComplete = jest.fn();
      renderUserData({ onComplete });
      const nameField = screen.getByLabelText('Full name');
      await userEvent.type(nameField, 'jane.doe@acme.com');
      const submitButton = screen.getByRole('button', { name: 'Next' });
      await userEvent.click(submitButton);
      await waitFor(() => {
        expect(onComplete).toHaveBeenCalled();
      });
    });
  });
});
