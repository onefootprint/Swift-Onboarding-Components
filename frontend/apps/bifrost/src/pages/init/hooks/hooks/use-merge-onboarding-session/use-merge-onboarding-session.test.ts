import type { SupportedLocale } from '@onefootprint/types';
import type { GetOnboardingSessionResponse } from '../use-get-onboarding-session';
import { mergeData } from './use-merge-onboarding-session';

describe('onboarding session mergeData', () => {
  it.each([
    // Take bootstrap and public key from sdkArgsData.authToken. This is only for backcompat with Yieldstreet's flow, we can deprecate once they migrate
    {
      sdkArgsData: {
        authToken: 'pbtok_xyz',
        isComponentsSdk: false,
        bootstrapData: {
          'id.first_name': 'Piip',
        },
      },
      onboardingSessionData: {},
      x: {
        authToken: undefined,
        isComponentsSdk: false,
        bootstrapData: {
          'id.first_name': 'Piip',
        },
        publicKey: 'pbtok_xyz',
      },
    },
    // Take bootstrap and public key from sdkArgsData.publicKey.
    {
      sdkArgsData: {
        authToken: 'utok_xyz',
        isComponentsSdk: false,
        bootstrapData: {
          'id.first_name': 'Piip',
        },
        publicKey: 'pbtok_xyz',
      },
      onboardingSessionData: {},
      x: {
        authToken: 'utok_xyz',
        isComponentsSdk: false,
        bootstrapData: {
          'id.first_name': 'Piip',
        },
        publicKey: 'pbtok_xyz',
      },
    },
    // Take bootstrap and public key from onboardingSessionData
    {
      sdkArgsData: {
        authToken: 'pbtok_xyz',
        isComponentsSdk: false,
      },
      onboardingSessionData: {
        bootstrapData: {
          'id.first_name': 'Piip',
        },
      },
      x: {
        authToken: undefined,
        isComponentsSdk: false,
        bootstrapData: {
          'id.first_name': 'Piip',
        },
        publicKey: 'pbtok_xyz',
      },
    },
    // Take bootstrap from sdkArgsData and public key from onboardingSessionData
    {
      sdkArgsData: {
        authToken: 'pbtok_xyz',
        isComponentsSdk: false,
        bootstrapData: {
          'id.first_name': 'Piip',
        },
      },
      onboardingSessionData: {},
      x: {
        authToken: undefined,
        isComponentsSdk: false,
        bootstrapData: {
          'id.first_name': 'Piip',
        },
        publicKey: 'pbtok_xyz',
      },
    },
    // Complex example
    {
      sdkArgsData: {
        authToken: 'pbtok_xyz',
        options: {
          showCompletionPage: true,
        },
        l10n: {
          locale: 'en-US' as SupportedLocale,
        },
        isComponentsSdk: false,
      },
      onboardingSessionData: {
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
        publicKey: 'pbtok_xyz',
      },
    },
  ])('.', ({ sdkArgsData, onboardingSessionData, x }) => {
    expect(mergeData('pbtok_xyz', sdkArgsData, onboardingSessionData as GetOnboardingSessionResponse)).toStrictEqual(x);
  });
});

describe('onboarding session mergeData errors', () => {
  it.each([
    // Conflicting boostrapData
    {
      sdkArgsData: {
        authToken: 'pbtok_xyz',
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
        authToken: 'pbtok_xyz',
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
    expect(() => mergeData('pbtok_xyz', sdkArgsData, onboardingSessionData)).toThrowError(xError);
  });
});
