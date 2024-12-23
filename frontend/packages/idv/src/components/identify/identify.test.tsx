import { withLoginChallenge } from '@/idv/idv.test.config';
import {
  getIdentifyRequirementChallenge,
  getIdentifyRequirementCollectData,
  getIdentifyRequirementLogin,
} from '@onefootprint/fixtures';
import { customRender, screen, userEvent, waitFor } from '@onefootprint/test-utils';
import { CLIENT_PUBLIC_KEY_HEADER, ChallengeKind } from '@onefootprint/types';
import type { ComponentProps } from 'react';
import { Layout } from '../layout';
import {
  expectShimmer,
  fillChallengePin,
  fillIdentifyEmail,
  fillIdentifyPhone,
  sandboxOnboardingConfigFixture,
  withIdentify,
  withIdentifyVerify,
} from './components/identify-login/identify-login.test.config';
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
  isComponentsSdk,
  config,
  device,
  onDone,
}: {
  bootstrapEmail?: string;
  bootstrapPhone?: string;
  initialAuthToken?: string;
  isComponentsSdk?: boolean;
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
          isComponentsSdk: isComponentsSdk ?? false,
          obConfigAuth: { [CLIENT_PUBLIC_KEY_HEADER]: 'pk_test_xxxx' },
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

  it('omits collection of bootstrapped data', async () => {
    withIdentifySession({});
    const requirements = [
      getIdentifyRequirementCollectData({ cdo: 'email' }),
      getIdentifyRequirementChallenge({ authMethod: 'phone' }),
    ];
    withRequirements({ requirements });
    withVault();

    const onDone = jest.fn();
    renderIdentify({ onDone, bootstrapPhone: '+1 (555) 555-0100' });
    await waitFor(() => {
      expect(screen.getByText('Enter your email to get started.')).toBeInTheDocument();
    });

    // Fill email
    withChallenge({});
    withRequirements({ requirements: requirements.slice(1) });
    await fillIdentifyEmail();
    await waitFor(() => {
      expect(screen.getByText('Enter the 6-digit code sent to +1 (555) 555-0100.')).toBeInTheDocument();
    });

    // Fill OTP code
    withChallengeVerify();
    withRequirements({ requirements: requirements.slice(2) });
    withSessionVerify({ authToken: 'utok_xxxx' });
    await fillChallengePin();
    await waitFor(() => {
      expect(screen.getByText('Success!')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(onDone).toHaveBeenCalledWith({
        authToken: 'utok_xxxx',
        email: { value: 'piip@onefootprint.com', isBootstrap: false },
        phoneNumber: { value: '+1 (555) 555-0100', isBootstrap: true },
      });
    });
  });

  it('no-phone playbook', async () => {
    withIdentifySession({});
    const requirements = [
      getIdentifyRequirementCollectData({ cdo: 'email' }),
      getIdentifyRequirementChallenge({ authMethod: 'email' }),
    ];
    withRequirements({ requirements });
    withVault();

    const onDone = jest.fn();
    renderIdentify({ onDone });
    await waitFor(() => {
      expect(screen.getByText('Enter your email to get started.')).toBeInTheDocument();
    });

    // Fill email
    withChallenge({});
    withRequirements({ requirements: requirements.slice(1) });
    await fillIdentifyEmail();
    await waitFor(() => {
      expect(screen.getByText('Enter the 6-digit code sent to piip@onefootprint.com.')).toBeInTheDocument();
    });

    // Fill OTP code
    withChallengeVerify();
    withRequirements({ requirements: requirements.slice(2) });
    withSessionVerify({ authToken: 'utok_xxxx' });
    await fillChallengePin();
    await waitFor(() => {
      expect(screen.getByText('Success!')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(onDone).toHaveBeenCalledWith({
        authToken: 'utok_xxxx',
        email: { value: 'piip@onefootprint.com', isBootstrap: false },
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
    loginRequirement.user.isUnverified = false;
    loginRequirement.user.scrubbedPhone = '+1 (•••) •••-••99';
    withRequirements({ requirements: [loginRequirement] });
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
        availableChallengeKinds: loginRequirement.user.availableChallengeKinds,
      });
    });
  });

  it('goes to login flow when initial auth token is provided', async () => {
    withIdentify({ matchingFps: [] });

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
        availableChallengeKinds: ['sms', 'biometric'],
      });
    });
  });

  it('sends x-fp-is-components-sdk header in signup challenge when using components sdk', async () => {
    const onInitSessionCalled = jest.fn();
    withIdentifySession({}, onInitSessionCalled);

    // Bootstrap email, enter phone explicitly
    renderIdentify({
      bootstrapEmail: 'sandbox@onefootprint.com',
      isComponentsSdk: true,
    });

    expectShimmer();

    await waitFor(() => {
      expect(onInitSessionCalled).toHaveBeenCalled();
    });
    const { body, headers } = onInitSessionCalled.mock.calls[0][0];
    expect(body).toEqual({
      scope: 'onboarding',
      data: {
        'id.email': 'sandbox@onefootprint.com',
      },
    });
    expect(headers['x-onboarding-config-key']).toEqual('pk_test_xxxx');
    expect(headers['x-fp-is-bootstrap']).toEqual('true');
    expect(headers['x-fp-is-components-sdk']).toEqual('true');
  });
});
