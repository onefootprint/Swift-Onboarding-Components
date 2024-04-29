import { IcoUser16, IcoWriting16, IcoWww16 } from '@onefootprint/icons';
import { Box } from '@onefootprint/ui';
import groupBy from 'lodash/groupBy';
import React from 'react';
import { useTranslation } from 'react-i18next';

import useEntityOtherInsights from '@/entity/hooks/use-current-entity-other-insights';

import Section from '../section';
import Item from './components/item';
import List from './components/list';

const OtherInsights = () => {
  const { t } = useTranslation('entity-details', {
    keyPrefix: 'other-insights',
  });
  const { data } = useEntityOtherInsights();
  const dataGrouped = groupBy(data, 'scope');
  const hasOnboarding = dataGrouped.workflow?.length > 0;
  const hasBehavior = dataGrouped.behavior?.length > 0;
  const hasDevice = dataGrouped.device?.length > 0;

  return data?.length ? (
    <Section title={t('title')}>
      <Box gap={4} display="grid" gridTemplateColumns="50% 50%">
        {hasOnboarding && (
          <List title={t('onboarding')} IconComponent={IcoWriting16}>
            {dataGrouped.workflow?.map(item => (
              <Item
                description={item.description}
                key={item.name}
                name={item.name}
                unit={item.unit}
                value={item.value}
              />
            ))}
          </List>
        )}
        {hasBehavior && (
          <List title={t('behavior')} IconComponent={IcoUser16}>
            {dataGrouped.behavior?.map(item => (
              <Item
                description={item.description}
                key={item.name}
                name={item.name}
                unit={item.unit}
                value={item.value}
              />
            ))}
          </List>
        )}
        {hasDevice && (
          <List title={t('device')} IconComponent={IcoWww16}>
            {dataGrouped.device?.map(item => (
              <Item
                description={item.description}
                key={item.name}
                name={item.name}
                unit={item.unit}
                value={item.value}
              />
            ))}
          </List>
        )}
      </Box>
    </Section>
  ) : null;
};

export default OtherInsights;
