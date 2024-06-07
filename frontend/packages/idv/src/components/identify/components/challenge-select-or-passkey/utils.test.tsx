import { ChallengeKind } from '@onefootprint/types';
import React from 'react';

import type { IdentifyContext } from '../../state/types';
import { SuccessfulIdentifier } from '../../state/types';
import { getChallengeTitleByKind, getMethods } from './utils';

describe('getChallengeTitleByKind', () => {
  type Args = Parameters<typeof getChallengeTitleByKind>;
  type T = Args[0];

  const t = (x: string) => x;

  it.each([
    {
      identify: {
        user: {},
        successfulIdentifiers: [SuccessfulIdentifier.email],
      },
      email: 'a@b.com',
      phoneNumber: undefined,
      x: {
        biometric: 'challenge-select-or-biometric.passkey',
        email: (
          <>
            challenge-select-or-biometric.send-code-to{' '}
            <span data-private="true" data-dd-privacy="mask">
              a@b.com
            </span>
          </>
        ),
        sms: 'challenge-select-or-biometric.send-code-via-sms',
      },
    },
    {
      identify: {
        user: {},
        successfulIdentifiers: [SuccessfulIdentifier.phone],
      },
      email: undefined,
      phoneNumber: '+123',
      x: {
        biometric: 'challenge-select-or-biometric.passkey',
        email: 'challenge-select-or-biometric.send-code-via-email',
        sms: (
          <>
            challenge-select-or-biometric.send-code-to{' '}
            <span data-private="true" data-dd-privacy="mask">
              +123
            </span>
          </>
        ),
      },
    },
    {
      identify: {
        user: { scrubbedEmail: 'b***@g**.com' },
        successfulIdentifiers: [SuccessfulIdentifier.phone],
      },
      email: 'differentemail@gmail.com',
      phoneNumber: '+123',
      x: {
        biometric: 'challenge-select-or-biometric.passkey',
        email: (
          <>
            challenge-select-or-biometric.send-code-to{' '}
            <span data-private="true" data-dd-privacy="mask">
              b•••@g••.com
            </span>
          </>
        ),
        sms: (
          <>
            challenge-select-or-biometric.send-code-to{' '}
            <span data-private="true" data-dd-privacy="mask">
              +123
            </span>
          </>
        ),
      },
    },
    {
      identify: {
        user: { scrubbedPhone: '+4***' },
        successfulIdentifiers: [SuccessfulIdentifier.email, SuccessfulIdentifier.phone],
      },
      email: 'a@b.com',
      phoneNumber: '+123',
      x: {
        biometric: 'challenge-select-or-biometric.passkey',
        email: (
          <>
            challenge-select-or-biometric.send-code-to{' '}
            <span data-private="true" data-dd-privacy="mask">
              a@b.com
            </span>
          </>
        ),
        sms: (
          <>
            challenge-select-or-biometric.send-code-to{' '}
            <span data-private="true" data-dd-privacy="mask">
              +123
            </span>
          </>
        ),
      },
    },
  ])('case %#', ({ identify, email, phoneNumber, x }) => {
    const context = {
      identify: identify as IdentifyContext,
      email: email
        ? {
            value: email,
            isBootstrap: false,
          }
        : undefined,
      phoneNumber: phoneNumber
        ? {
            value: phoneNumber,
            isBootstrap: false,
          }
        : undefined,
    };
    const result = getChallengeTitleByKind(t as T, context);
    expect(result).toEqual(x);
  });
});

describe('getMethods', () => {
  type Args = Parameters<typeof getMethods>;
  type Identify = Args[0];
  type DeviceInfo = Args[1];
  type TitleMap = Args[2];

  const titleMap: TitleMap = {
    [ChallengeKind.sms]: 'entry.sms',
    [ChallengeKind.email]: 'entry.email',
    [ChallengeKind.biometric]: 'entry.bio',
  };
  const IconComponent = expect.any(Function);

  it.each([
    {
      identify: { user: {}, successfulIdentifier: { email: 'a@b.com' } },
      device: {},
      x: [],
    },
    {
      identify: { user: {}, successfulIdentifier: { phoneNumber: '+123' } },
      device: {},
      x: [],
    },
    {
      identify: { user: { availableChallengeKinds: ['email'] } },
      device: {},
      x: [{ IconComponent, title: 'entry.email', value: 'email' }],
    },
    {
      identify: { user: { availableChallengeKinds: ['sms'] } },
      device: {},
      x: [{ IconComponent, title: 'entry.sms', value: 'sms' }],
    },
    {
      identify: { user: { availableChallengeKinds: ['biometric'] } },
      device: {},
      x: [],
    },
    {
      identify: { user: { availableChallengeKinds: ['biometric'] } },
      device: { type: 'mobile' },
      x: [],
    },
    {
      identify: { user: { availableChallengeKinds: ['biometric'] } },
      device: { type: 'mobile', hasSupportForWebauthn: true },
      x: [{ IconComponent, title: 'entry.bio', value: 'biometric' }],
    },
    {
      identify: { user: { availableChallengeKinds: ['biometric'] } },
      device: { type: 'desktop', hasSupportForWebauthn: true },
      x: [],
    },
    {
      identify: {
        user: {
          availableChallengeKinds: ['biometric'],
          hasSyncablePasskey: true,
        },
      },
      device: { type: 'desktop', hasSupportForWebauthn: true },
      x: [{ IconComponent, title: 'entry.bio', value: 'biometric' }],
    },
    {
      identify: {
        user: {
          availableChallengeKinds: ['biometric', 'email', 'sms'],
          hasSyncablePasskey: true,
        },
      },
      device: { type: 'desktop', hasSupportForWebauthn: true },
      x: [
        { IconComponent, title: 'entry.bio', value: 'biometric' },
        { IconComponent, title: 'entry.sms', value: 'sms' },
        { IconComponent, title: 'entry.email', value: 'email' },
      ],
    },
  ])('case %#', ({ identify, device, x }) => {
    const result = getMethods(identify as Identify, device as DeviceInfo, titleMap);
    expect(result).toEqual(x);
  });
});
