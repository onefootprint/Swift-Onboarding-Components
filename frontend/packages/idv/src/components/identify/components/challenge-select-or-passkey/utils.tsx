import type { Icon } from '@onefootprint/icons';
import { IcoEmail16, IcoFaceid16, IcoSmartphone16 } from '@onefootprint/icons';
import { ChallengeKind } from '@onefootprint/types';
import type { TFunction } from 'i18next';

import type { DeviceInfo } from '../../../../hooks';
import { isBiometric } from '../../../../utils';
import type { IdentifyContext, IdentifyMachineContext } from '../../state/types';
import { IdentifyVariant } from '../../state/types';
import { getDisplayEmail, getDisplayPhone } from '../../utils/get-display-contact-info';

type T = TFunction<'identify'>;
type TitleMap = Record<ChallengeKind, string | JSX.Element>;

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

const sortChallenges = (a: ChallengeKind, b: ChallengeKind) => challengePriority[a] - challengePriority[b];

export const getSubTitle = (t: T, variant: IdentifyVariant): string =>
  variant !== IdentifyVariant.updateLoginMethods
    ? t('challenge-select-or-biometric.log-in-options')
    : t('challenge-select-or-biometric.log-in-to-modify-details');

export const getMethods = (identify: IdentifyContext, device: DeviceInfo, titleMap: TitleMap) => {
  const { type, hasSupportForWebauthn } = device;
  const { user } = identify;
  const kinds = user?.availableChallengeKinds || [];

  return kinds
    .sort(sortChallenges)
    .filter(kind => {
      if (isBiometric(kind)) {
        return type === 'mobile' ? hasSupportForWebauthn : hasSupportForWebauthn && user?.hasSyncablePasskey;
      }

      return true;
    })
    .map(kind => ({
      IconComponent: challengeIcons[kind],
      title: titleMap[kind],
      value: kind,
    }));
};

function getChallengeTitleEmail(
  t: T,
  context: Pick<IdentifyMachineContext, 'identify' | 'email'>,
): string | JSX.Element {
  const displayEmail = getDisplayEmail(context);
  const sendTo = t('challenge-select-or-biometric.send-code-to');
  return displayEmail ? (
    <>
      {sendTo} <span data-dd-privacy="mask">{displayEmail}</span>
    </>
  ) : (
    t('challenge-select-or-biometric.send-code-via-email')
  );
}

const getChallengeTitlePhone = (
  t: T,
  context: Pick<IdentifyMachineContext, 'identify' | 'phoneNumber'>,
): string | JSX.Element => {
  const displayPhone = getDisplayPhone(context);
  const sendTo = t('challenge-select-or-biometric.send-code-to');
  return displayPhone ? (
    <>
      {sendTo} <span data-dd-privacy="mask">{displayPhone}</span>
    </>
  ) : (
    t('challenge-select-or-biometric.send-code-via-sms')
  );
};

export const getChallengeTitleByKind = (
  t: T,
  context: Pick<IdentifyMachineContext, 'identify' | 'email' | 'phoneNumber'>,
): TitleMap => ({
  [ChallengeKind.sms]: getChallengeTitlePhone(t, context),
  [ChallengeKind.email]: getChallengeTitleEmail(t, context),
  [ChallengeKind.biometric]: t('challenge-select-or-biometric.passkey'),
});
