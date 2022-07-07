import React from 'react';
import { useStore } from 'src/hooks/use-session-user';
import { customRender, screen } from 'test-utils';

import LoginAndSecurity from './login-and-security';

const originalState = useStore.getState();

describe('<LoginAndSecurity />', () => {
  const renderLoginAndSecurity = () => customRender(<LoginAndSecurity />);

  afterAll(() => {
    useStore.setState(originalState);
  });

  describe('with all the values are filled and biometrics is verified', () => {
    const data = {
      email: 'john.doe@gmail.com',
      phone: '+1 (305) 541-3102',
      isBiometricsVerified: true,
      device: 'iPhone 12',
    };

    beforeEach(() => {
      useStore.setState({
        data,
      });
    });

    it('should render the email and phone', () => {
      renderLoginAndSecurity();
      expect(screen.getByText(data.email)).toBeInTheDocument();
      expect(screen.getByText(data.phone)).toBeInTheDocument();
    });

    it('should render the device info', () => {
      renderLoginAndSecurity();
      expect(screen.getByText(data.device)).toBeInTheDocument();
    });
  });

  describe('with unverified biometrics', () => {
    const data = {
      email: 'john.doe@gmail.com',
      phone: '+1 (305) 541-3102',
      isBiometricsVerified: false,
    };

    beforeEach(() => {
      useStore.setState({
        data,
      });
    });

    it('should render the email and phone', () => {
      renderLoginAndSecurity();
      expect(screen.getByText(data.email)).toBeInTheDocument();
      expect(screen.getByText(data.phone)).toBeInTheDocument();
    });

    it('should show biometrics is not verified', () => {
      renderLoginAndSecurity();
      expect(screen.getByText('Not verified')).toBeInTheDocument();
      expect(screen.getByText('Verify')).toBeInTheDocument();
    });
  });
});
