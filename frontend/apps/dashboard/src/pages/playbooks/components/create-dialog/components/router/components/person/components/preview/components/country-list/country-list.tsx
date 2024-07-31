import { Stack, Text, Tooltip } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

type CountryListProps = {
  countries: string[];
  limit?: number;
};

const CountryList = ({ countries, limit = 1 }: CountryListProps) => {
  const { t } = useTranslation('playbooks', {
    keyPrefix: 'create.settings-person.preview.non-us-residents.country-list',
  });
  const firstPart = countries.slice(0, limit);
  const lastPart = countries.slice(limit);
  const shouldCut = countries.length > limit;

  return shouldCut ? (
    <Stack gap={2} alignItems="center">
      <Text variant="body-3">{firstPart.join(', ')}</Text>
      <Text variant="body-3">{t('and')}</Text>
      <Tooltip text={lastPart.join(', ')}>
        <Text variant="body-3" textDecoration="underline">
          {t('more', { count: lastPart.length })}
        </Text>
      </Tooltip>
    </Stack>
  ) : (
    <Text variant="body-3">{countries.join(', ')}</Text>
  );
};

export default CountryList;
