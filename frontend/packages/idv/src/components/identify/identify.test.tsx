import { withLoginChallenge } from '@/idv/idv.test.config';
import {
  getIdentifyRequirementChallenge,
  getIdentifyRequirementCollectData,
  getIdentifyRequirementLogin,
} from '@onefootprint/fixtures';
import { customRender, screen, userEvent, waitFor } from '@onefootprint/test-utils';
import { CLIENT_PUBLIC_KEY_HEADER, ChallengeKind } from '@onefootprint/types';
import { mockFlags } from 'jest-launchdarkly-mock';
import type { ComponentProps } from 'react';
import { Layout } from '../layout';
import {
  fillChallengePin,
  fillIdentifyEmail,
  fillIdentifyPhone,
  sandboxOnboardingConfigFixture,
  withIdentify,
  withIdentifyVerify,
} from './components/identify-login/identify.test.config';
import Identify from './identify';
import {
  withChallenge,
  withChallengeVerify,
  withIdentifySession,
  withRequirements,
  withRequirementsErr,
  withSessionVerify,
  withVault,
} from './identify.test.config';
import { IdentifyVariant } from './identify.types';

type Config = ComponentProps<typeof Identify>['initArgs']['config'];
type Device = ComponentProps<typeof Identify>['initArgs']['device'];

const renderIdentify = ({
  bootstrapEmail,
  bootstrapPhone,
  initialAuthToken,
  config,
  device,
  onDone,
}: {
  bootstrapEmail?: string;
  bootstrapPhone?: string;
  initialAuthToken?: string;
  config?: Config;
  device?: Device;
  onDone?: () => void;
}) => {
  const bootstrapData: Record<string, unknown> = {};
  if (bootstrapEmail) {
    bootstrapData.email = bootstrapEmail;
  }
  if (bootstrapPhone) {
    bootstrapData.phoneNumber = bootstrapPhone;
  }
  return customRender(
    <Layout onClose={() => undefined}>
      <Identify
        initArgs={{
          variant: IdentifyVariant.verify,
          config: config ?? sandboxOnboardingConfigFixture,
          isLive: config?.isLive ?? sandboxOnboardingConfigFixture.isLive,
          isComponentsSdk: false,
          obConfigAuth: { [CLIENT_PUBLIC_KEY_HEADER]: 'pk' },
          bootstrapData: bootstrapEmail || bootstrapPhone ? bootstrapData : undefined,
          initialAuthToken,
          device: device || {
            type: 'mobile',
            hasSupportForWebauthn: true,
            osName: 'iOS',
            browser: 'Safari',
          },
        }}
        onDone={onDone ?? (() => undefined)}
      />
    </Layout>,
  );
};

describe('<Identify />', () => {
  beforeAll(() => {
    mockFlags({ IdentifySignupV2Rollout: ['all'] });
  });

  it('handles regular signup flow', async () => {
    withIdentifySession({});
    const requirements = [
      getIdentifyRequirementCollectData({ cdo: 'email' }),
      getIdentifyRequirementCollectData({ cdo: 'phone_number' }),
      getIdentifyRequirementChallenge({ authMethod: 'phone' }),
    ];
    withRequirements({ requirements });
    withVault();

    const onDone = jest.fn();
    renderIdentify({ onDone });
    await waitFor(() => {
      expect(screen.getByText('Enter your email to get started.')).toBeInTheDocument();
    });

    // Fill email
    withRequirements({ requirements: requirements.slice(1) });
    await fillIdentifyEmail();
    await waitFor(() => {
      expect(screen.getByText('Enter your phone number to proceed.')).toBeInTheDocument();
    });

    // Fill phone
    withChallenge({});
    withRequirements({ requirements: requirements.slice(2) });
    await fillIdentifyPhone();
    await waitFor(() => {
      expect(screen.getByText('Enter the 6-digit code sent to +1 (650) 460-0799.')).toBeInTheDocument();
    });

    // Fill OTP code
    withChallengeVerify();
    withRequirements({ requirements: requirements.slice(3) });
    withSessionVerify({ authToken: 'utok_xxxx' });
    await fillChallengePin();
    await waitFor(() => {
      expect(screen.getByText('Success!')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(onDone).toHaveBeenCalledWith({
        authToken: 'utok_xxxx',
        email: { value: 'piip@onefootprint.com', isBootstrap: false },
        phoneNumber: { value: '+1 (650) 460-0799', isBootstrap: false },
      });
    });
  });

  it('shows error toast when fetching requirements', async () => {
    withIdentifySession({});
    const requirements = [getIdentifyRequirementCollectData({ cdo: 'email' })];
    withRequirements({ requirements });
    withVault();

    const onDone = jest.fn();
    renderIdentify({ onDone });
    await waitFor(() => {
      expect(screen.getByText('Enter your email to get started.')).toBeInTheDocument();
    });

    // Fill email. This should re-fetch requirements, which will error
    withRequirementsErr();
    await fillIdentifyEmail();
    await waitFor(() => {
      expect(screen.getByText('Uh-oh!')).toBeInTheDocument();
    });
    expect(screen.getByText('Enter your email to get started.')).toBeInTheDocument();
  });

  it('goes to login flow when user is identified', async () => {
    withIdentifySession({});
    withRequirements({
      requirements: [
        getIdentifyRequirementCollectData({ cdo: 'email' }),
        getIdentifyRequirementCollectData({ cdo: 'phone_number' }),
        getIdentifyRequirementChallenge({ authMethod: 'phone' }),
      ],
    });
    withVault();

    const onDone = jest.fn();
    renderIdentify({ onDone });
    await waitFor(() => {
      expect(screen.getByText('Enter your email to get started.')).toBeInTheDocument();
    });

    // Fill email
    withRequirements({
      requirements: [
        getIdentifyRequirementCollectData({ cdo: 'phone_number' }),
        getIdentifyRequirementChallenge({ authMethod: 'phone' }),
      ],
    });
    await fillIdentifyEmail();
    await waitFor(() => {
      expect(screen.getByText('Enter your phone number to proceed.')).toBeInTheDocument();
    });

    // Fill phone. This will identify the user and fall back to the login flow.
    withChallenge({});
    const loginRequirement = getIdentifyRequirementLogin({});
    withRequirements({ requirements: [loginRequirement] });
    withIdentify({});
    await fillIdentifyPhone();
    await waitFor(() => {
      expect(screen.getByText('Welcome back! 🎉')).toBeInTheDocument();
    });

    // Log into the existing user
    withLoginChallenge(ChallengeKind.sms);
    await userEvent.click(screen.getByText('••99', { exact: false }));
    await userEvent.click(screen.getByText('Continue'));

    withIdentifyVerify();
    await fillChallengePin();
    await waitFor(() => {
      expect(screen.getByText('Success!')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(onDone).toHaveBeenCalledWith({
        authToken: 'new-token',
        email: { value: 'piip@onefootprint.com', isBootstrap: false },
        phoneNumber: { value: '+1 (650) 460-0799', isBootstrap: false },
        availableChallengeKinds: ['biometric', 'sms'],
      });
    });
  });

  it('goes to login flow when initial auth token is provided', async () => {
    withIdentify({});

    const onDone = jest.fn();
    renderIdentify({ onDone, initialAuthToken: 'utok_xxxx' });
    await waitFor(() => {
      expect(screen.getByText('Welcome back! 🎉')).toBeInTheDocument();
    });

    // Log into the existing user
    withLoginChallenge(ChallengeKind.sms);
    await userEvent.click(screen.getByText('••99', { exact: false }));
    await userEvent.click(screen.getByText('Continue'));

    withIdentifyVerify();
    await fillChallengePin();
    await waitFor(() => {
      expect(screen.getByText('Success!')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(onDone).toHaveBeenCalledWith({
        authToken: 'new-token',
        availableChallengeKinds: ['biometric', 'sms'],
      });
    });
  });
});
