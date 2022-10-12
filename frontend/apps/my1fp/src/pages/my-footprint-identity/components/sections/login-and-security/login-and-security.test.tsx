import {
  customRender,
  mockRequest,
  screen,
  userEvent,
  waitFor,
} from '@onefootprint/test-utils';
import React from 'react';
import { UserSession, useStore } from 'src/hooks/use-session-user';

import { UserSessionMetadata } from '../../../../../hooks/use-session-user/use-session-user';
import LoginAndSecurity from './login-and-security';

const originalState = useStore.getState();

describe('<LoginAndSecurity />', () => {
  const renderLoginAndSecurity = () => customRender(<LoginAndSecurity />);

  const withUserQuery = (emailVerified?: boolean) => {
    mockRequest({
      method: 'get',
      path: 'hosted/user',
      response: {
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
            isVerified: !!emailVerified,
            priority: 'primary',
          },
        ],
      },
    });
  };

  const withLivenessQuery = () => {
    mockRequest({
      method: 'get',
      path: 'hosted/user/liveness',
      response: [
        {
          insightEvent: {
            userAgent: 'iPhone 12',
            timestamp: '01/01/2021',
          },
        },
      ],
    });
  };

  const withEmptyLivenessQuery = () => {
    mockRequest({
      method: 'get',
      path: 'hosted/user/liveness',
      response: [],
    });
  };

  const withVerification = () => {
    mockRequest({
      method: 'post',
      path: 'hosted/user/email/challenge',
      response: {},
    });
  };

  const withVerificationError = () => {
    mockRequest({
      method: 'post',
      path: 'hosted/user/email/challenge',
      statusCode: 403,
      response: {
        error: {
          message: 'Something bad happened',
        },
      },
    });
  };

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

  describe('with all the values are filled and biometrics is verified', () => {
    const session: UserSession = {
      metadata: fakeSessionMetadata,
      biometric: [
        {
          userAgent: 'iPhone 12',
          timestamp: 'time',
        },
      ],
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
    };

    beforeEach(() => {
      useStore.setState({
        session,
      });
    });

    it('should render the email and phone', () => {
      withLivenessQuery();
      withUserQuery();
      renderLoginAndSecurity();
      expect(screen.getByText('john.doe@gmail.com')).toBeInTheDocument();
      expect(screen.getByText('+1 (305) 541-3102')).toBeInTheDocument();
    });

    it('should render the device info', () => {
      withLivenessQuery();
      withUserQuery();
      renderLoginAndSecurity();
      expect(screen.getByText('iPhone 12')).toBeInTheDocument();
    });
  });

  describe('with missing biometrics data', () => {
    const session: UserSession = {
      metadata: fakeSessionMetadata,
      biometric: [],
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
    };

    beforeEach(() => {
      useStore.setState({
        session,
      });
    });

    it('should fetch and update the device info in state', async () => {
      withLivenessQuery();
      withUserQuery();
      renderLoginAndSecurity();
      await waitFor(() => {
        expect(screen.getByText('iPhone 12')).toBeInTheDocument();
      });
    });
  });

  describe('with unverified biometrics', () => {
    const data: UserSession = {
      metadata: fakeSessionMetadata,
      biometric: [],
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
    };

    beforeEach(() => {
      useStore.setState({
        session: data,
      });
    });

    it('should render the email and phone', () => {
      withEmptyLivenessQuery();
      withUserQuery();
      renderLoginAndSecurity();
      expect(screen.getByText('john.doe@gmail.com')).toBeInTheDocument();
      expect(screen.getByText('+1 (305) 541-3102')).toBeInTheDocument();
    });

    it('should show biometrics is not verified', () => {
      withEmptyLivenessQuery();
      withUserQuery();
      renderLoginAndSecurity();
      expect(screen.getByText('Not verified')).toBeInTheDocument();
      expect(screen.getByTestId('verify-biometrics')).toBeInTheDocument();
      expect(screen.getByText('Verify')).toBeInTheDocument();
    });
  });

  describe('when the email is not verified', () => {
    beforeEach(() => {
      useStore.setState({
        session: {
          metadata: {
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
                isVerified: false,
                priority: 'primary',
              },
            ],
          },
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
        },
      });
    });

    it('should render a button to verify the email', () => {
      withEmptyLivenessQuery();
      withUserQuery();
      renderLoginAndSecurity();
      const button = screen.getByTestId('verify-email');
      expect(button).toBeInTheDocument();
    });

    describe('when clicking on the verify button', () => {
      it('should display a loading indicator while the request is pending', async () => {
        withEmptyLivenessQuery();
        withUserQuery();
        withVerification();
        renderLoginAndSecurity();
        const button = screen.getByTestId('verify-email');
        await userEvent.click(button);
        expect(
          screen.getByRole('progressbar', {
            name: 'Sending email to verify your email address',
          }),
        ).toBeInTheDocument();
      });

      it('should display a confirmation if the request succeeds', async () => {
        withEmptyLivenessQuery();
        withUserQuery();
        withVerification();
        renderLoginAndSecurity();
        const button = screen.getByTestId('verify-email');
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

      it('should display a confirmation if the request fails', async () => {
        withEmptyLivenessQuery();
        withUserQuery();
        withVerificationError();
        renderLoginAndSecurity();
        const button = screen.getByTestId('verify-email');
        await userEvent.click(button);
        await screen.findByText('Something went wrong');
        expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      });
    });
  });
});
