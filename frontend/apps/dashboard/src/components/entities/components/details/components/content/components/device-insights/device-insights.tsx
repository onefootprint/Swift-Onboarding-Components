import React from 'react';
import { useTranslation } from 'react-i18next';
import { ErrorComponent } from 'src/components';

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

  return (
    <Section title={t('title')}>
      {error && <ErrorComponent error={error} />}
      {isSuccess && <Content entity={entity} livenessData={data} />}
    </Section>
  );
};

export default DeviceInsights;
