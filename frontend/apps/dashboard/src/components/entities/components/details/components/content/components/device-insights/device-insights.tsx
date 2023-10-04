import { useTranslation } from '@onefootprint/hooks';
import { LivenessKind } from '@onefootprint/types';
import React from 'react';
import { Error } from 'src/components';

import type { WithEntityProps } from '@/entity/components/with-entity';
import useCurrentEntityAuthEvents from '@/entity/hooks/use-current-entity-auth-events';

import Section from '../section';
import Content from './components/content';

export type ContentProps = WithEntityProps;

const DeviceInsights = ({ entity }: ContentProps) => {
  const { t } = useTranslation('pages.entity.device-insights');
  const { error, data, isSuccess } = useCurrentEntityAuthEvents();
  const onboardingInsightEvent = entity.insightEvent;
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
          insight={biometricCred?.insight || onboardingInsightEvent}
        />
      )}
    </Section>
  );
};

export default DeviceInsights;
