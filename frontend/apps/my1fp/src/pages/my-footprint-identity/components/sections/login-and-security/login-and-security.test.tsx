import React from 'react';
import { UserSession, useStore } from 'src/hooks/use-session-user';
import { customRender, screen } from 'test-utils';

import LoginAndSecurity from './login-and-security';

const originalState = useStore.getState();

describe('<LoginAndSecurity />', () => {
  const renderLoginAndSecurity = () => customRender(<LoginAndSecurity />);

  afterAll(() => {
    useStore.setState(originalState);
  });

  describe('with all the values are filled and biometrics is verified', () => {
    const data: UserSession = {
      isBiometricsVerified: true,
      device: 'iPhone 12',
      authToken: 'lorem',
      city: 'San Francisco',
      country: 'United States',
      dob: '01/01/2000',
      email: 'john.doe@gmail.com',
      firstName: 'John',
      isEmailVerified: true,
      lastName: 'Doe',
      phoneNumber: '+1 (305) 541-3102',
      state: 'CA',
      streetAddress: '14 Linda St',
      streetAddress2: null,
      zip: '94102',
    };

    beforeEach(() => {
      useStore.setState({
        data,
      });
    });

    it('should render the email and phone', () => {
      renderLoginAndSecurity();
      expect(screen.getByText(data.email)).toBeInTheDocument();
      expect(screen.getByText(data.phoneNumber!)).toBeInTheDocument();
    });

    it('should render the device info', () => {
      renderLoginAndSecurity();
      expect(screen.getByText(data.device!)).toBeInTheDocument();
    });
  });

  describe('with unverified biometrics', () => {
    const data: UserSession = {
      isBiometricsVerified: false,
      authToken: 'lorem',
      city: 'San Francisco',
      country: 'United States',
      dob: '01/01/2000',
      email: 'john.doe@gmail.com',
      firstName: 'John',
      isEmailVerified: true,
      lastName: 'Doe',
      phoneNumber: '+1 (305) 541-3102',
      state: 'CA',
      streetAddress: '14 Linda St',
      streetAddress2: null,
      zip: '94102',
    };

    beforeEach(() => {
      useStore.setState({
        data,
      });
    });

    it('should render the email and phone', () => {
      renderLoginAndSecurity();
      expect(screen.getByText(data.email)).toBeInTheDocument();
      expect(screen.getByText(data.phoneNumber!)).toBeInTheDocument();
    });

    it('should show biometrics is not verified', () => {
      renderLoginAndSecurity();
      expect(screen.getByText('Not verified')).toBeInTheDocument();
      expect(screen.getByText('Verify')).toBeInTheDocument();
    });
  });
});
