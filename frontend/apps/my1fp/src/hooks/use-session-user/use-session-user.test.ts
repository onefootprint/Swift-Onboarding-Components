import { act, renderHook } from 'test-utils';

import useSessionUser, {
  UserSession,
  UserSessionBiometric,
  UserSessionData,
  UserSessionMetadata,
} from './use-session-user';

describe('useSessionUser', () => {
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

  describe('when the state is empty', () => {
    it('should indicate that the user is not logged in', () => {
      const { result } = renderHook(() => useSessionUser());
      expect(result.current.isLoggedIn).toBeFalsy();
    });
  });

  describe('when assigning the user data', () => {
    it('should indicate the user is logged in and return the user data', () => {
      const { result } = renderHook(() => useSessionUser());
      const nextData: UserSession = {
        authToken: 'lorem',
        data: {
          firstName: 'John',
          lastName: 'Doe',
          phoneNumber: '+1 (305) 541-3102',
          email: 'john.doe@gmail.com',
          dob: '01/01/2000',
          streetAddress: '14 Linda St',
          streetAddress2: null,
          city: 'San Francisco',
          state: 'CA',
          country: 'United States',
          zip: '94102',
        },
        biometric: [],
        metadata: fakeSessionMetadata,
      };
      act(() => {
        result.current.logIn(nextData);
      });
      expect(result.current.session).toEqual(nextData);
      expect(result.current.isLoggedIn).toBeTruthy();
    });
  });

  describe('when logging out', () => {
    it('Should clear the state and indicate that the user is not logged in anymore', () => {
      const { result } = renderHook(() => useSessionUser());
      const nextData: UserSession = {
        authToken: 'lorem',
        data: {
          firstName: 'John',
          lastName: 'Doe',
          phoneNumber: '+1 (305) 541-3102',
          email: 'john.doe@gmail.com',
          dob: '01/01/2000',
          streetAddress: '14 Linda St',
          streetAddress2: null,
          city: 'San Francisco',
          state: 'CA',
          country: 'United States',
          zip: '94102',
        },
        biometric: [],
        metadata: fakeSessionMetadata,
      };
      act(() => {
        result.current.logIn(nextData);
      });
      act(() => {
        result.current.logOut();
      });
      expect(result.current.session).toBeUndefined();
      expect(result.current.isLoggedIn).toBeFalsy();
    });
  });

  describe('when updating data', () => {
    it('should correctly update user data', () => {
      const { result } = renderHook(() => useSessionUser());
      const oldData: UserSessionData = {
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: '+1 (305) 541-3102',
        email: 'john.doe@gmail.com',
        dob: '01/01/2000',
        streetAddress: '14 Linda St',
        streetAddress2: null,
        city: 'San Francisco',
        state: 'CA',
        country: 'United States',
        zip: '94102',
      };
      const oldSession: UserSession = {
        authToken: 'lorem',
        data: oldData,
        biometric: [],
        metadata: fakeSessionMetadata,
      };

      const newData: UserSessionData = {
        firstName: 'Belce',
        lastName: 'Dogru',
        phoneNumber: '+1 (305) 541-3102',
        email: 'john.doe@gmail.com',
        dob: '01/01/2000',
        streetAddress: '14 Linda St',
        streetAddress2: null,
        city: 'Seattle',
        state: 'WA',
        country: 'United States',
        zip: '94102',
      };
      const newSession: UserSession = {
        authToken: 'lorem',
        data: newData,
        biometric: [],
        metadata: fakeSessionMetadata,
      };

      act(() => {
        result.current.logIn(oldSession);
      });
      act(() => {
        result.current.updateData(newData);
      });
      expect(result.current.session).toEqual(newSession);
    });
  });

  describe('when updating biometric', () => {
    it('should correctly update biometric data', () => {
      const { result } = renderHook(() => useSessionUser());
      const oldMetadata: UserSessionMetadata = {
        emails: [
          {
            id: '123456789',
            isVerified: false,
            priority: 'primary',
          },
        ],
        phoneNumbers: [
          {
            id: '123456789',
            isVerified: false,
            priority: 'primary',
          },
        ],
      };
      const data: UserSessionData = {
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: '+1 (305) 541-3102',
        email: 'john.doe@gmail.com',
        dob: '01/01/2000',
        streetAddress: '14 Linda St',
        streetAddress2: null,
        city: 'San Francisco',
        state: 'CA',
        country: 'United States',
        zip: '94102',
      };
      const oldSession: UserSession = {
        authToken: 'lorem',
        data,
        biometric: [],
        metadata: oldMetadata,
      };

      const newMetadata: UserSessionMetadata = {
        emails: [
          {
            id: '123456789',
            isVerified: true,
            priority: 'primary',
          },
        ],
        phoneNumbers: [
          {
            id: '123456789',
            isVerified: true,
            priority: 'primary',
          },
        ],
      };
      const newSession: UserSession = {
        authToken: 'lorem',
        data,
        biometric: [],
        metadata: newMetadata,
      };

      act(() => {
        result.current.logIn(oldSession);
      });
      act(() => {
        result.current.updateMetadata(newMetadata);
      });
      expect(result.current.session).toEqual(newSession);
    });
  });

  describe('when updating metadata', () => {
    it('should correctly update metadata', () => {
      const { result } = renderHook(() => useSessionUser());
      const data: UserSessionData = {
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: '+1 (305) 541-3102',
        email: 'john.doe@gmail.com',
        dob: '01/01/2000',
        streetAddress: '14 Linda St',
        streetAddress2: null,
        city: 'San Francisco',
        state: 'CA',
        country: 'United States',
        zip: '94102',
      };
      const oldSession: UserSession = {
        authToken: 'lorem',
        data,
        biometric: [],
        metadata: fakeSessionMetadata,
      };

      const newBiometric: UserSessionBiometric = [
        {
          timestamp: '',
          userAgent: 'mobile',
        },
      ];
      const newSession: UserSession = {
        authToken: 'lorem',
        data,
        biometric: newBiometric,
        metadata: fakeSessionMetadata,
      };

      act(() => {
        result.current.logIn(oldSession);
      });
      act(() => {
        result.current.updateBiometric(newBiometric);
      });
      expect(result.current.session).toEqual(newSession);
    });
  });
});
