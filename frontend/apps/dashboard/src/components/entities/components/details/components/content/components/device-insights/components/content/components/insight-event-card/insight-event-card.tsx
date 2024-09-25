import { useIntl } from '@onefootprint/hooks';
import { IcoAppclip16, IcoBolt16 } from '@onefootprint/icons';
import type { AuthEvent } from '@onefootprint/types';
import { AuthEventKind, EntityKind } from '@onefootprint/types';
import { Stack, Text } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import { displayForUserAgent } from 'src/utils/user-agent';

import { useEntityContext } from '@/entity/hooks/use-entity-context';

import getIconForLivenessEvent from '../../utils/get-icon-for-liveness-event';
import CardBase from '../card-base';
import CardRow from '../card-row';
import AboutAppClipAndInstantApp from './components/about-app-clip-and-instant-app';
import getRegion from './utils/get-region';

type InsightEventCardProps = {
  id: string;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
  liveness: AuthEvent;
};

const InsightEventCard = ({ id, liveness, isSelected, onSelect }: InsightEventCardProps) => {
  const { t } = useTranslation('entity-details', {
    keyPrefix: 'device-insights',
  });
  const context = useEntityContext();
  const { formatDateWithTime } = useIntl();
  const {
    insight: { city, country, ipAddress, region, userAgent, timestamp },
    kind,
    linkedAttestations,
    scope,
  } = liveness;

  const AuthEventKindToText: Record<AuthEventKind, string> = {
    [AuthEventKind.email]: t('auth-event-kind.email'),
    [AuthEventKind.passkey]: t('auth-event-kind.passkey'),
    [AuthEventKind.sms]: t('auth-event-kind.sms'),
    // Not used in production yet
    [AuthEventKind.thirdParty]: t('auth-event-kind.third-party'),
  };

  const attestation = linkedAttestations.at(0);
  const deviceInfo = {
    appClip: attestation?.deviceType === 'ios',
    instantApp: attestation?.deviceType === 'android',
    web: !attestation,
  };

  const fullRegion = getRegion(city, region);
  const headerText = displayForUserAgent(userAgent ?? '', deviceInfo.instantApp, deviceInfo.appClip);

  const rows: JSX.Element[] = [
    <CardRow key="date-time" label={t('date-and-time')} value={formatDateWithTime(new Date(timestamp))} />,
  ];

  if (ipAddress) {
    rows.push(<CardRow key="ip-address" label={t('ip-address')} value={ipAddress} />);
  }

  if (deviceInfo.instantApp) {
    rows.push(
      <CardRow
        key="instant-app"
        label={t('instant-app.label')}
        value={
          <Stack direction="row" align="center" gap={3}>
            <IcoBolt16 />
            <Text variant="body-3" isPrivate>
              {t('instant-app.yes')}
            </Text>
          </Stack>
        }
      />,
    );
  }
  if (deviceInfo.appClip) {
    rows.push(
      <CardRow
        key="app-clip"
        label={t('app-clip.label')}
        labelSuffix={<AboutAppClipAndInstantApp kind="app-clip" />}
        value={
          <Stack direction="row" align="center" gap={2} justify="end">
            <IcoAppclip16 />
            <Text variant="body-3" isPrivate>
              {t('app-clip.yes')}
            </Text>
          </Stack>
        }
      />,
    );
  }
  if (context.kind === EntityKind.person) {
    rows.push(<CardRow key="auth-method" label={t('auth-method')} value={AuthEventKindToText[kind]} />);
    if (fullRegion) {
      rows.push(<CardRow key="region" label={t('region')} value={fullRegion} />);
    }
    if (country) {
      rows.push(<CardRow key="country" label={t('country')} value={country} />);
    }
  }

  return (
    <CardBase
      id={id}
      isSelected={isSelected}
      onSelect={() => onSelect?.(id)}
      title={t(`scope.${scope}`)}
      headerIcon={getIconForLivenessEvent(liveness)}
      headerText={headerText}
      rows={rows}
    />
  );
};

export default InsightEventCard;
