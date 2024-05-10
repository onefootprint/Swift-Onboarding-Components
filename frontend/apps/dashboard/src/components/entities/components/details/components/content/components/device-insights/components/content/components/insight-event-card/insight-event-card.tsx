import { useIntl } from '@onefootprint/hooks';
import {
  IcoAppclip16,
  IcoBolt16,
  IcoCheckCircle16,
  IcoClose16,
} from '@onefootprint/icons';
import type { Liveness } from '@onefootprint/types';
import { EntityKind, LivenessKind } from '@onefootprint/types';
import { Stack, Text } from '@onefootprint/ui';
import React from 'react';
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
  liveness: Liveness;
};

const InsightEventCard = ({
  id,
  liveness,
  isSelected,
  onSelect,
}: InsightEventCardProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.entity.device-insights',
  });
  const context = useEntityContext();
  const { formatDateWithTime } = useIntl();
  const {
    insight: { city, country, ipAddress, region, userAgent, timestamp },
    kind,
    linkedAttestations,
    scope,
  } = liveness;

  const attestation = linkedAttestations.at(0);
  const deviceInfo = {
    appClip: attestation?.deviceType === 'ios',
    instantApp: attestation?.deviceType === 'android',
    web: !attestation,
  };

  const fullRegion = getRegion(city, region);
  const headerText = displayForUserAgent(
    userAgent ?? '',
    deviceInfo.instantApp,
    deviceInfo.appClip,
  );

  const rows: JSX.Element[] = [
    <CardRow
      key="date-time"
      label={t('date-and-time')}
      value={formatDateWithTime(new Date(timestamp))}
    />,
  ];

  if (ipAddress) {
    rows.push(
      <CardRow key="ip-address" label={t('ip-address')} value={ipAddress} />,
    );
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
    rows.push(
      <CardRow
        key="biometrics"
        label={t('biometrics')}
        value={
          <Stack align="center" gap={3}>
            {kind === LivenessKind.passkey ? (
              <>
                <IcoCheckCircle16 color="success" />
                <Text variant="body-3" color="success">
                  {t('verified')}
                </Text>
              </>
            ) : (
              <>
                <IcoClose16 color="error" />
                <Text variant="body-3" color="error">
                  {t('not_verified')}
                </Text>
              </>
            )}
          </Stack>
        }
      />,
    );
    if (fullRegion) {
      rows.push(
        <CardRow key="region" label={t('region')} value={fullRegion} />,
      );
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
