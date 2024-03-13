import { LivenessKind } from '@onefootprint/types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Error } from 'src/components';

import type { WithEntityProps } from '@/entity/components/with-entity';
import useCurrentEntityAuthEvents from '@/entity/hooks/use-current-entity-auth-events';

import Section from '../section';
import Content from './components/content';

export type ContentProps = WithEntityProps;

const DeviceInsights = ({ entity }: ContentProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.entity.device-insights',
  });
  const { error, data, isSuccess } = useCurrentEntityAuthEvents();
  const mostRecentWfInsight = entity.workflows.sort((wf1, wf2) => {
    if (wf1.createdAt > wf2.createdAt) {
      return -1;
    }
    if (wf1.createdAt < wf2.createdAt) {
      return 1;
    }
    return 0;
  })[0]?.insightEvent;
  const biometricCred = data?.find(e => e.kind === LivenessKind.passkey);
  const attestation = biometricCred?.linkedAttestations.at(0);
  const deviceInfo = {
    appClip: attestation?.deviceType === 'ios',
    instantApp: attestation?.deviceType === 'android',
    web: !attestation,
  };

  return (
    <Section title={t('title')}>
      {error && <Error error={error} />}
      {isSuccess && (
        <Content
          deviceInfo={deviceInfo}
          hasBiometrics={!!biometricCred}
          insight={biometricCred?.insight || mostRecentWfInsight}
        />
      )}
    </Section>
  );
};

export default DeviceInsights;
