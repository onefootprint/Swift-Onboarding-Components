import React from 'react';
import {
  UserSession,
  UserSessionMetadata,
  useStore,
} from 'src/hooks/use-session-user';
import { customRender, screen } from 'test-utils';

import Address from './address';

const originalState = useStore.getState();

describe('<Address />', () => {
  const renderAddress = () => customRender(<Address />);

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
    const session: UserSession = {
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
      metadata: fakeSessionMetadata,
      biometric: [],
    };

    beforeEach(() => {
      useStore.setState({
        session,
      });
    });

    it('should render the correct first address line', () => {
      renderAddress();
      expect(screen.getByText('14 Linda St')).toBeInTheDocument();
    });

    it('should render the correct second address line', () => {
      renderAddress();
      expect(
        screen.getByText('San Francisco, CA, 94102, United States'),
      ).toBeInTheDocument();
    });
  });

  describe('when there are missing values', () => {
    const session: UserSession = {
      authToken: 'lorem',
      data: {
        city: 'San Francisco',
        country: 'United States',
        dob: '01/01/2000',
        email: 'john.doe@gmail.com',
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: '+1 (305) 541-3102',
        state: null,
        streetAddress: '14 Linda St',
        streetAddress2: null,
        zip: '94102',
      },
      biometric: [],
      metadata: fakeSessionMetadata,
    };

    beforeEach(() => {
      useStore.setState({
        session,
      });
    });

    it('should render the correct first address line', () => {
      renderAddress();
      expect(screen.getByText('14 Linda St')).toBeInTheDocument();
    });

    it('should render the correct second address line', () => {
      renderAddress();
      expect(
        screen.getByText('San Francisco, 94102, United States'),
      ).toBeInTheDocument();
    });
  });
});
