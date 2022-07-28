import React from 'react';
import { UserSessionMetadata, useStore } from 'src/hooks/use-session-user';
import { customRender, screen } from 'test-utils';

import Identity from './identity';

const originalState = useStore.getState();

describe('<Identity />', () => {
  const renderIdentity = () => customRender(<Identity />);

  const fakeSessionMetadata: UserSessionMetadata = {
    phoneNumbers: [
      {
        id: '123456789',
        isVerified: true,
        priority: 'primary',
      },
    ],
    emails: [
      {
        id: '123456789',
        isVerified: true,
        priority: 'primary',
      },
    ],
  };

  afterAll(() => {
    useStore.setState(originalState);
  });

  describe('when all the values are filled', () => {
    beforeEach(() => {
      useStore.setState({
        session: {
          authToken: 'lorem',
          data: {
            city: 'San Francisco',
            country: 'United States',
            dob: '01/01/2000',
            email: 'john.doe@gmail.com',
            firstName: 'John',
            lastName: 'Doe',
            phoneNumber: '+1 (305) 541-3102',
            state: 'CA',
            streetAddress: '14 Linda St',
            streetAddress2: null,
            zip: '94102',
            ssn: '02392432423',
          },
          biometric: [],
          metadata: fakeSessionMetadata,
        },
      });
    });

    it('should render the full name', () => {
      renderIdentity();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    it('should render the SSN masked', () => {
      renderIdentity();
      expect(screen.getByText('•••••••••')).toBeInTheDocument();
    });

    it('should render the DOB', () => {
      renderIdentity();
      expect(screen.getByText('01/01/2000')).toBeInTheDocument();
    });
  });

  describe('when the SSN is not filled', () => {
    beforeEach(() => {
      useStore.setState({
        session: {
          authToken: 'lorem',
          data: {
            city: 'San Francisco',
            country: 'United States',
            dob: '01/01/2000',
            email: 'john.doe@gmail.com',
            firstName: 'John',
            lastName: 'Doe',
            phoneNumber: '+1 (305) 541-3102',
            state: 'CA',
            streetAddress: '14 Linda St',
            streetAddress2: null,
            zip: '94102',
          },
          biometric: [],
          metadata: fakeSessionMetadata,
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
        session: {
          authToken: 'lorem',
          data: {
            city: 'San Francisco',
            country: 'United States',
            dob: '01/01/2000',
            email: 'john.doe@gmail.com',
            firstName: 'John',
            lastName: 'Doe',
            phoneNumber: '+1 (305) 541-3102',
            state: 'CA',
            streetAddress: '14 Linda St',
            streetAddress2: null,
            zip: '94102',
            ssn: '02392432423',
          },
          biometric: [],
          metadata: fakeSessionMetadata,
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
