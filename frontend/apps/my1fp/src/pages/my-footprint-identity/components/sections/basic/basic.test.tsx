import React from 'react';
import { useStore } from 'src/hooks/use-session-user';
import { customRender, screen, userEvent } from 'test-utils';

import Basic from './basic';

const originalState = useStore.getState();

describe('<Basic />', () => {
  const renderBasic = () => customRender(<Basic />);

  afterAll(() => {
    useStore.setState(originalState);
  });

  describe('when all the values are filled', () => {
    beforeEach(() => {
      useStore.setState({
        data: {
          isEmailVerified: true,
          email: 'john.doe@gmail.com',
          firstName: 'John',
          lastName: 'Doe',
          phone: '+1 (305) 541-3102',
        },
      });
    });

    it('should render the full name', () => {
      renderBasic();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    it('should render the email', () => {
      renderBasic();
      expect(screen.getByText('john.doe@gmail.com')).toBeInTheDocument();
    });

    it('should render the phone number', () => {
      renderBasic();
      expect(screen.getByText('+1 (305) 541-3102')).toBeInTheDocument();
    });
  });

  describe('when the email is not verified', () => {
    beforeEach(() => {
      useStore.setState({
        data: {
          isEmailVerified: false,
          email: 'john.doe@gmail.com',
          firstName: 'John',
          lastName: 'Doe',
          phone: '+1 (305) 541-3102',
        },
      });
    });

    it('should render a button to verify the email', () => {
      renderBasic();
      const button = screen.getByRole('button', { name: 'Verify' });
      expect(button).toBeInTheDocument();
    });

    describe('when clicking on the verify button', () => {
      it('should display a loading indicator while the request is pending', async () => {
        renderBasic();
        const button = screen.getByRole('button', { name: 'Verify' });
        await userEvent.click(button);
        expect(
          screen.getByRole('progressbar', {
            name: 'Sending email to verify your email address',
          }),
        ).toBeInTheDocument();
      });

      it('should display a confirmation if the request succeeds', async () => {
        renderBasic();
        const button = screen.getByRole('button', { name: 'Verify' });
        await userEvent.click(button);
        await screen.findByText('Check your inbox');
        await screen.findByText(
          'Please click the link we sent you by email to verify it.',
        );
        expect(screen.getByText('Check your inbox')).toBeInTheDocument();
        expect(
          screen.getByText(
            'Please click the link we sent you by email to verify it.',
          ),
        ).toBeInTheDocument();
      });
    });
  });
});
