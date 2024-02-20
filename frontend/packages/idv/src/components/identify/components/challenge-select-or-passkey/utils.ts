import type { Icon } from '@onefootprint/icons';
import { IcoEmail16, IcoFaceid16, IcoSmartphone16 } from '@onefootprint/icons';
import { ChallengeKind } from '@onefootprint/types';
import type { TFunction } from 'i18next';

import type { DeviceInfo } from '../../../../hooks';
import { isEmailIdentifier, isPhoneIdentifier } from '../../state/predicates';
import type { IdentifyResult } from '../../state/types';
import { IdentifyVariant } from '../../state/types';

type T = TFunction<'identify'>;
type TitleMap = Record<ChallengeKind, string>;

const challengeIcons: Record<ChallengeKind, Icon> = {
  [ChallengeKind.sms]: IcoSmartphone16,
  [ChallengeKind.email]: IcoEmail16,
  [ChallengeKind.biometric]: IcoFaceid16,
};
const challengePriority: Record<ChallengeKind, number> = {
  [ChallengeKind.biometric]: 0,
  [ChallengeKind.sms]: 1,
  [ChallengeKind.email]: 2,
};

export const isBiometric = (x: unknown): x is ChallengeKind.biometric =>
  x === ChallengeKind.biometric;

const sortChallenges = (a: ChallengeKind, b: ChallengeKind) =>
  challengePriority[a] - challengePriority[b];

export const getSubTitle = (t: T, variant: IdentifyVariant): string =>
  variant !== IdentifyVariant.updateLoginMethods
    ? t('challenge-select-or-biometric.log-in-options')
    : t('challenge-select-or-biometric.log-in-to-modify-details');

export const getMethods = (
  identify: IdentifyResult,
  device: DeviceInfo,
  titleMap: TitleMap,
) => {
  const { type, hasSupportForWebauthn } = device;
  const { user } = identify;
  const kinds = user?.availableChallengeKinds || [];

  return kinds
    .sort(sortChallenges)
    .filter(kind => {
      if (isBiometric(kind)) {
        return type === 'mobile'
          ? hasSupportForWebauthn
          : hasSupportForWebauthn && user?.hasSyncablePasskey;
      }

      return true;
    })
    .map(kind => ({
      IconComponent: challengeIcons[kind],
      title: titleMap[kind],
      value: kind,
    }));
};

const getChallengeTitleEmail = (t: T, identify: IdentifyResult): string => {
  const { user, successfulIdentifier } = identify;
  const sendTo = t('challenge-select-or-biometric.send-code-to');

  if (successfulIdentifier && isEmailIdentifier(successfulIdentifier)) {
    return `${sendTo} ${successfulIdentifier.email}`;
  }
  if (typeof user?.scrubbedEmail === 'string') {
    return `${sendTo} ${user.scrubbedEmail}`;
  }
  return t('challenge-select-or-biometric.send-code-via-email');
};

const getChallengeTitlePhone = (t: T, identify: IdentifyResult): string => {
  const { user, successfulIdentifier } = identify;
  const sendTo = t('challenge-select-or-biometric.send-code-to');

  if (successfulIdentifier && isPhoneIdentifier(successfulIdentifier)) {
    return `${sendTo} ${successfulIdentifier.phoneNumber}`;
  }
  if (typeof user?.scrubbedPhone === 'string') {
    return `${sendTo} ${user.scrubbedPhone}`;
  }
  return t('challenge-select-or-biometric.send-code-via-sms');
};

export const getChallengeTitleByKind = (
  t: T,
  identify: IdentifyResult,
): TitleMap => ({
  [ChallengeKind.sms]: getChallengeTitlePhone(t, identify),
  [ChallengeKind.email]: getChallengeTitleEmail(t, identify),
  [ChallengeKind.biometric]: t('challenge-select-or-biometric.passkey'),
});
