import type { ChallengeData, PublicOnboardingConfig, UserTokenScope } from '@onefootprint/types';
import {
  AuthMethodKind,
  CLIENT_PUBLIC_KEY_HEADER,
  ChallengeKind,
  IdDI,
  OnboardingConfigStatus,
} from '@onefootprint/types';
import type { IdentifiedUser } from '@onefootprint/types/src/api/identify';
import { interpret } from 'xstate';

import type { DeviceInfo } from '../../../../../hooks';
import createIdentifyMachine from './machine';
import { IdentifyVariant } from './types';

const challengeKindToAuthMethod: Record<ChallengeKind, AuthMethodKind> = {
  [ChallengeKind.biometric]: AuthMethodKind.passkey,
  [ChallengeKind.sms]: AuthMethodKind.phone,
  [ChallengeKind.smsLink]: AuthMethodKind.phone,
  [ChallengeKind.email]: AuthMethodKind.email,
};

const CHALLENGE_DATA: ChallengeData = {
  token: 'utok_xxx',
  challengeToken: 'challenge_token_info',
  challengeKind: ChallengeKind.sms,
};

const getFixtureUser = (availableChallengeKinds: ChallengeKind[], tokenScopes?: UserTokenScope[]): IdentifiedUser => ({
  token: 'utok_xxx',
  isUnverified: false,
  availableChallengeKinds,
  authMethods: availableChallengeKinds.map(k => ({
    kind: challengeKindToAuthMethod[k],
    isVerified: true,
  })),
  hasSyncablePasskey: true,
  tokenScopes: tokenScopes ?? [],
  matchingFps: [IdDI.phoneNumber],
});

const getOnboardingConfig = (isLive = true, isNoPhoneFlow = false): PublicOnboardingConfig => ({
  isLive,
  logoUrl: 'url',
  privacyPolicyUrl: 'url',
  name: 'tenant',
  orgName: 'tenantOrg',
  orgId: 'orgId',
  status: OnboardingConfigStatus.enabled,
  isAppClipEnabled: false,
  isInstantAppEnabled: false,
  appClipExperienceId: 'app_exp_9KlTyouGLSNKMgJmpUdBAF',
  isNoPhoneFlow,
  requiresIdDoc: false,
  key: 'key',
  isKyb: false,
  allowInternationalResidents: false,
  requiredAuthMethods: [isNoPhoneFlow ? AuthMethodKind.email : AuthMethodKind.phone],
});

const getDevice = (): DeviceInfo => ({
  type: 'mobile',
  hasSupportForWebauthn: true,
  osName: 'iOS',
  browser: 'Mobile Safari',
});

const createMachine = ({
  config,
  variant = IdentifyVariant.auth,
  bootstrapEmail,
  bootstrapPhoneNumber,
  user,
}: {
  bootstrapEmail?: string;
  bootstrapPhoneNumber?: string;
  config?: PublicOnboardingConfig;
  variant?: IdentifyVariant;
  user: IdentifiedUser;
}) => {
  const machine = interpret(
    createIdentifyMachine({
      email: bootstrapEmail ? { value: bootstrapEmail, isBootstrap: true } : undefined,
      phoneNumber: bootstrapPhoneNumber ? { value: bootstrapPhoneNumber, isBootstrap: true } : undefined,
      config,
      obConfigAuth: config && { [CLIENT_PUBLIC_KEY_HEADER]: 'token' },
      device: getDevice(),
      isLive: config?.isLive || true,
      variant,
      identify: {
        user,
        identifyToken: 'utok_xxx',
      },
    }),
  );
  machine.start();
  return machine;
};

describe('Identify Machine Tests', () => {
  it('shows option to log in with KBA', () => {
    const machine = createMachine({
      config: getOnboardingConfig(),
      user: getFixtureUser([ChallengeKind.biometric, ChallengeKind.sms]),
    });

    let { state } = machine;
    expect(state.context.device).toEqual({
      type: 'mobile',
      hasSupportForWebauthn: true,
      osName: 'iOS',
      browser: 'Mobile Safari',
    });

    expect(state.value).toEqual('challengeSelectOrPasskey');

    state = machine.send({
      type: 'tryAnotherWay',
      payload: ChallengeKind.email,
    });
    expect(state.value).toEqual('phoneKbaChallenge');

    state = machine.send({
      type: 'navigatedToPrevPage',
      payload: { prev: 'challengeSelectOrPasskey' },
    });
    expect(state.value).toEqual('challengeSelectOrPasskey');
    state = machine.send({
      type: 'challengeSucceeded',
      payload: {
        kind: AuthMethodKind.passkey,
        authToken: 'token',
      },
    });
    expect(state.context.challenge).toEqual({
      authToken: 'token',
    });
    expect(state.value).toEqual('success');
  });

  it('properly goes to sms challenge when only sms challenge available', () => {
    const machine = createMachine({
      config: getOnboardingConfig(),
      user: getFixtureUser([ChallengeKind.sms]),
    });
    let { state } = machine;

    expect(state.value).toEqual('smsChallenge');

    // Receive challenge data from the backend
    state = machine.send({
      type: 'challengeReceived',
      payload: CHALLENGE_DATA,
    });
    expect(state.context.challenge.challengeData).toEqual(CHALLENGE_DATA);
    expect(state.value).toEqual('smsChallenge');

    // Complete the challenge
    state = machine.send({
      type: 'challengeSucceeded',
      payload: {
        kind: AuthMethodKind.phone,
        authToken: 'authToken',
      },
    });
    expect(state.context.challenge).toEqual({
      challengeData: CHALLENGE_DATA,
      authToken: 'authToken',
    });
    expect(state.value).toEqual('success');
  });

  it('properly goes to email when only email challenge available', () => {
    const machine = createMachine({
      config: getOnboardingConfig(true, true),
      user: getFixtureUser([ChallengeKind.email]),
    });
    let { state } = machine;

    // Receive challenge data from the backend
    state = machine.send({
      type: 'challengeReceived',
      payload: CHALLENGE_DATA,
    });
    expect(state.context.challenge.challengeData).toEqual(CHALLENGE_DATA);
    expect(state.value).toEqual('emailChallenge');

    // Complete the challenge
    state = machine.send({
      type: 'challengeSucceeded',
      payload: {
        kind: AuthMethodKind.email,
        authToken: 'authToken',
      },
    });
    expect(state.context.challenge).toEqual({
      challengeData: CHALLENGE_DATA,
      authToken: 'authToken',
    });
    expect(state.value).toEqual('success');
  });

  it('requests adding phone when user doesnt have phone and playbook requires', () => {
    const machine = createMachine({
      config: getOnboardingConfig(),
      user: getFixtureUser([ChallengeKind.email]),
    });
    let { state } = machine;

    expect(state.value).toEqual('emailChallenge');

    // Receive challenge data from the backend
    state = machine.send({
      type: 'challengeReceived',
      payload: CHALLENGE_DATA,
    });
    expect(state.context.challenge.challengeData).toEqual(CHALLENGE_DATA);
    expect(state.value).toEqual('emailChallenge');

    // Complete the challenge. We are then asked to provide the phone
    state = machine.send({
      type: 'challengeSucceeded',
      payload: {
        kind: AuthMethodKind.email,
        authToken: 'authToken',
      },
    });
    expect(state.context.challenge).toEqual({
      challengeData: CHALLENGE_DATA,
      authToken: 'authToken',
    });
    expect(state.value).toEqual('addPhone');

    // Complete challenge to add phone
    state = machine.send({
      type: 'phoneAdded',
      payload: '+15555550100',
    });
    expect(state.context.phoneNumber?.value).toEqual('+15555550100');
    expect(state.value).toEqual('success');
  });

  it('complete sms challenge when multiple challenges available', () => {
    const machine = createMachine({
      config: getOnboardingConfig(),
      user: getFixtureUser([ChallengeKind.biometric, ChallengeKind.sms]),
    });
    let { state } = machine;
    expect(state.value).toEqual('challengeSelectOrPasskey');

    // Choose SMS challenge
    state = machine.send({
      type: 'goToChallenge',
      payload: ChallengeKind.sms,
    });
    expect(state.value).toEqual('smsChallenge');

    // Receive challenge data from the backend
    state = machine.send({
      type: 'challengeReceived',
      payload: CHALLENGE_DATA,
    });
    expect(state.context.challenge.challengeData).toEqual(CHALLENGE_DATA);
    expect(state.value).toEqual('smsChallenge');

    // Make sure we can go back, shouldn't clear challenge data
    state = machine.send({ type: 'navigatedToPrevPage' });
    expect(state.value).toEqual('challengeSelectOrPasskey');
    expect(state.context.challenge.challengeData).toBeTruthy();

    // Complete SMS challenge
    state = machine.send({
      type: 'goToChallenge',
      payload: ChallengeKind.sms,
    });
    expect(state.value).toEqual('smsChallenge');
    expect(state.context.challenge.challengeData).toBeTruthy();

    state = machine.send({
      type: 'challengeSucceeded',
      payload: {
        kind: AuthMethodKind.phone,
        authToken: 'authToken',
      },
    });
    expect(state.value).toEqual('success');
  });

  describe('IdentifyVariant.updateLoginMethods', () => {
    it('valid auth token', () => {
      const machine = createMachine({
        variant: IdentifyVariant.updateLoginMethods,
        user: getFixtureUser([ChallengeKind.sms]),
      });

      let { state } = machine;

      // When the user is identifyResult, we should always go to the challenge select screen, even if
      // there's only one available challenge
      expect(state.context.email?.value).toEqual(undefined);
      expect(state.context.phoneNumber?.value).toEqual(undefined);
      expect(state.context.identify).toEqual({
        user: getFixtureUser([ChallengeKind.sms]),
        identifyToken: 'utok_xxx',
      });
      expect(state.value).toEqual('challengeSelectOrPasskey');

      // Choose SMS challenge and then go back
      state = machine.send({
        type: 'goToChallenge',
        payload: ChallengeKind.sms,
      });
      expect(state.value).toEqual('smsChallenge');
      state = machine.send({ type: 'navigatedToPrevPage' });
      expect(state.value).toEqual('challengeSelectOrPasskey');

      // Then finally finish SMS challenge
      state = machine.send({
        type: 'goToChallenge',
        payload: ChallengeKind.sms,
      });
      expect(state.value).toEqual('smsChallenge');

      state = machine.send({
        type: 'challengeSucceeded',
        payload: {
          kind: AuthMethodKind.phone,
          authToken: 'authToken',
        },
      });
      expect(state.context.challenge).toEqual({
        authToken: 'authToken',
      });
      expect(state.value).toEqual('success');
    });
  });
});
