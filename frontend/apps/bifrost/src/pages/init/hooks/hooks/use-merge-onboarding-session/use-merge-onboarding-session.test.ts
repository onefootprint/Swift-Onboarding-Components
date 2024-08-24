import type { SupportedLocale } from '@onefootprint/types';
import type { GetOnboardingSessionResponse } from '../use-get-onboarding-session';
import { mergeData } from './use-merge-onboarding-session';

describe('onboarding session mergeData', () => {
  it.each([
    // Take bootstrap and public key from sdkArgsData
    {
      sdkArgsData: {
        authToken: 'obtok_ARttvedCJJMQSpJUrjXarQypre6iTE0b9m',
        isComponentsSdk: false,
        bootstrapData: {
          'id.first_name': 'Piip',
        },
        publicKey: 'pb_test_6x058TxMoRD7ajDKEeZ6t9',
      },
      onboardingSessionData: {},
      x: {
        authToken: undefined,
        isComponentsSdk: false,
        bootstrapData: {
          'id.first_name': 'Piip',
        },
        publicKey: 'pb_test_6x058TxMoRD7ajDKEeZ6t9',
      },
    },
    // Take bootstrap and public key from onboardingSessionData
    {
      sdkArgsData: {
        authToken: 'obtok_ARttvedCJJMQSpJUrjXarQypre6iTE0b9m',
        isComponentsSdk: false,
      },
      onboardingSessionData: {
        bootstrapData: {
          'id.first_name': 'Piip',
        },
        key: 'pb_test_6x058TxMoRD7ajDKEeZ6t9',
      },
      x: {
        authToken: undefined,
        isComponentsSdk: false,
        bootstrapData: {
          'id.first_name': 'Piip',
        },
        publicKey: 'pb_test_6x058TxMoRD7ajDKEeZ6t9',
      },
    },
    // Take bootstrap from sdkArgsData and public key from onboardingSessionData
    {
      sdkArgsData: {
        authToken: 'obtok_ARttvedCJJMQSpJUrjXarQypre6iTE0b9m',
        isComponentsSdk: false,
        bootstrapData: {
          'id.first_name': 'Piip',
        },
      },
      onboardingSessionData: {
        key: 'pb_test_6x058TxMoRD7ajDKEeZ6t9',
      },
      x: {
        authToken: undefined,
        isComponentsSdk: false,
        bootstrapData: {
          'id.first_name': 'Piip',
        },
        publicKey: 'pb_test_6x058TxMoRD7ajDKEeZ6t9',
      },
    },
    // Complex example
    {
      sdkArgsData: {
        authToken: 'obtok_ARttvedCJJMQSpJUrjXarQypre6iTE0b9m',
        options: {
          showCompletionPage: true,
        },
        l10n: {
          locale: 'en-US' as SupportedLocale,
        },
        isComponentsSdk: false,
      },
      onboardingSessionData: {
        key: 'pb_test_6x058TxMoRD7ajDKEeZ6t9',
        bootstrapData: {
          'business.tin': '12-1231234',
          'id.last_name': 'Forde',
          'id.first_name': 'Elliott',
          'business.name': 'Printfoot',
        },
      },
      x: {
        authToken: undefined,
        options: {
          showCompletionPage: true,
        },
        l10n: {
          locale: 'en-US',
        },
        isComponentsSdk: false,
        bootstrapData: {
          'business.tin': '12-1231234',
          'id.last_name': 'Forde',
          'id.first_name': 'Elliott',
          'business.name': 'Printfoot',
        },
        publicKey: 'pb_test_6x058TxMoRD7ajDKEeZ6t9',
      },
    },
  ])('.', ({ sdkArgsData, onboardingSessionData, x }) => {
    expect(mergeData(sdkArgsData, onboardingSessionData as GetOnboardingSessionResponse)).toStrictEqual(x);
  });
});

describe('onboarding session mergeData errors', () => {
  it.each([
    // Conflicting playbook key
    {
      sdkArgsData: {
        authToken: 'obtok_ARttvedCJJMQSpJUrjXarQypre6iTE0b9m',
        publicKey: 'pb_test_6x058TxMoRD7ajDKEeZ6t9',
      },
      onboardingSessionData: {
        key: 'pb_test_6x058TxMoRD7ajDKEeZ6t9',
        bootstrapData: {},
      },
      xError:
        'Cannot provide a `publicKey` argument to the SDK when the onboarding session token already specified a playbook `key`.',
    },
    // Conflicting boostrapData
    {
      sdkArgsData: {
        authToken: 'obtok_ARttvedCJJMQSpJUrjXarQypre6iTE0b9m',
        publicKey: 'pb_test_6x058TxMoRD7ajDKEeZ6t9',
        bootstrapData: {
          'id.first_name': 'Percy',
        },
      },
      onboardingSessionData: {
        bootstrapData: {
          'id.first_name': 'Piip',
        },
      },
      xError:
        'Cannot provide `bootstrapData` argument to the SDK when the onboarding session token already specifies bootstrap data.',
    },
    // Conflicting boostrapData (with legacy userData key)
    {
      sdkArgsData: {
        authToken: 'obtok_ARttvedCJJMQSpJUrjXarQypre6iTE0b9m',
        publicKey: 'pb_test_6x058TxMoRD7ajDKEeZ6t9',
        userData: {
          'id.first_name': 'Percy',
        },
      },
      onboardingSessionData: {
        bootstrapData: {
          'id.first_name': 'Piip',
        },
      },
      xError:
        'Cannot provide `bootstrapData` argument to the SDK when the onboarding session token already specifies bootstrap data.',
    },
  ])('.', ({ sdkArgsData, onboardingSessionData, xError }) => {
    expect(() => mergeData(sdkArgsData, onboardingSessionData)).toThrowError(xError);
  });
});
