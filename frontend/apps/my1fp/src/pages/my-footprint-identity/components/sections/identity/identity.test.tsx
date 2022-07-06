import React from 'react';
import { useStore } from 'src/hooks/use-session-user';
import { customRender, screen } from 'test-utils';

import Identity from './identity';

const originalState = useStore.getState();

describe('<Identity />', () => {
  const renderIdentity = () => customRender(<Identity />);

  afterAll(() => {
    useStore.setState(originalState);
  });

  describe('when all the values are filled', () => {
    beforeEach(() => {
      useStore.setState({
        data: {
          hasSSNFilled: true,
          dob: '03/10/1990',
        },
      });
    });

    it('should render the SSN masked', () => {
      renderIdentity();
      expect(screen.getByText('•••••••••')).toBeInTheDocument();
    });

    it('should render the DOB', () => {
      renderIdentity();
      expect(screen.getByText('03/10/1990')).toBeInTheDocument();
    });
  });

  describe('when the SSN is not filled', () => {
    beforeEach(() => {
      useStore.setState({
        data: {
          hasSSNFilled: false,
          dob: '03/10/1990',
        },
      });
    });

    it('should render a placeholder', () => {
      renderIdentity();
      expect(screen.getByText('-')).toBeInTheDocument();
    });
  });

  describe('when the user was logged using biometrics and has the SSN filled', () => {
    beforeEach(() => {
      useStore.setState({
        data: {
          email: 'john.doe@gmail.com',
          hasSSNFilled: true,
          isEmailVerified: false,
          wasLoggedUsingBiometrics: true,
        },
      });
    });

    it('should show a button to decrypt the SSN', () => {
      renderIdentity();
      const button = screen.getByRole('button', { name: 'Show' });
      expect(button).toBeInTheDocument();
    });
  });
});
