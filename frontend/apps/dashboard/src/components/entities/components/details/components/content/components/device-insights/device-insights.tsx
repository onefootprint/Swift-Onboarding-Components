import { useTranslation } from '@onefootprint/hooks';
import React from 'react';
import { Error } from 'src/components';

import { WithEntityProps } from '@/entity/components/with-entity';
import useCurrentEntityLiveness from '@/entity/hooks/use-current-entity-liveness';

import Section from '../section';
import Content from './components/content';

export type ContentProps = WithEntityProps;

const DeviceInsights = ({ entity }: ContentProps) => {
  const { t } = useTranslation('pages.entity.device-insights');
  const { error, data, isSuccess } = useCurrentEntityLiveness();
  const onboardingInsightEvent = entity.insightEvent;
  const biometricCred = data?.[0];

  return (
    <Section title={t('title')}>
      {error && <Error error={error} />}
      {isSuccess && (
        <Content
          insightEvent={biometricCred?.insightEvent || onboardingInsightEvent}
          hasBiometrics={!!biometricCred}
        />
      )}
    </Section>
  );
};

export default DeviceInsights;
