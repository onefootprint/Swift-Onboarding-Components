// @ts-nocheck

import { getCountryNameFromCode } from '@onefootprint/global-constants';
import type { CountryCode, SupportedIdDocTypes } from '@onefootprint/types';
import { Flag, Grid, LinkButton, Stack, Text } from '@onefootprint/ui';
import type { ParseKeys } from 'i18next';
import React from 'react';
import { useTranslation } from 'react-i18next';

type ExistingCountryDocMappingsProps = {
  countryDocMappings: Partial<Record<CountryCode, SupportedIdDocTypes[]>>;
  onEdit: (country: CountryCode) => void;
};

const ExistingCountryDocMappings = ({ onEdit, countryDocMappings }: ExistingCountryDocMappingsProps) => {
  const existingCountries = Object.keys(countryDocMappings);
  const { t } = useTranslation('playbooks', {
    keyPrefix: 'create.data-to-collect.id-doc',
  });

  const getDocNames = (docTypes: SupportedIdDocTypes[]) =>
    docTypes.map(docType => t(docType as unknown as ParseKeys<`common`>)).join(', ');

  return (
    <Stack direction="column" gap={1}>
      {existingCountries.map(country => (
        <Grid.Container
          columns={['24px', 'auto', '2fr', '32px']}
          templateAreas={['flag, country, docs, link']}
          alignItems="center"
          key={country}
          paddingTop={3}
          paddingBottom={3}
          gap={3}
        >
          <Grid.Item area="flag">
            <Flag code={country as CountryCode} />
          </Grid.Item>
          <Grid.Item area="country" overflow="hidden">
            <Text variant="label-3" truncate>
              {getCountryNameFromCode(country as CountryCode)}:
            </Text>
          </Grid.Item>
          <Grid.Item area="docs" overflow="hidden">
            <Text variant="body-3" truncate>
              {getDocNames(countryDocMappings[country as CountryCode] ?? [])}
            </Text>
          </Grid.Item>
          <Grid.Item area="link">
            <LinkButton onClick={() => onEdit(country as CountryCode)}>
              {t('sections.country-specific.edit')}
            </LinkButton>
          </Grid.Item>
        </Grid.Container>
      ))}
    </Stack>
  );
};

export default ExistingCountryDocMappings;
