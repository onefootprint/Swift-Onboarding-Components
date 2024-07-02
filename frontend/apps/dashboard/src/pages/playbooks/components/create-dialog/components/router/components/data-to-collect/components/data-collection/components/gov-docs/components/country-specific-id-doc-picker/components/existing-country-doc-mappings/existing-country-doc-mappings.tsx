import { getCountryNameFromCode } from '@onefootprint/global-constants';
import type { CountryCode, SupportedIdDocTypes } from '@onefootprint/types';
import { Flag, Grid, LinkButton, Stack, Text } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import useIdDocText from 'src/hooks/use-id-doc-text';

type ExistingCountryDocMappingsProps = {
  countryDocMappings: Partial<Record<CountryCode, SupportedIdDocTypes[]>>;
  onEdit: (country: CountryCode) => void;
};

const ExistingCountryDocMappings = ({ onEdit, countryDocMappings }: ExistingCountryDocMappingsProps) => {
  const { t } = useTranslation('common');
  const getText = useIdDocText();
  const existingCountries = Object.keys(countryDocMappings);

  const getDocNames = (docs: SupportedIdDocTypes[]) => {
    return docs.map(getText).join(', ');
  };

  return (
    <Stack direction="column" gap={1}>
      {existingCountries.map(country => (
        <Grid.Container
          columns={['24px', 'auto', '2fr', '32px']}
          templateAreas={['flag country docs link']}
          alignItems="center"
          key={country}
          paddingTop={3}
          paddingBottom={3}
          gap={3}
        >
          <Grid.Item gridArea="flag">
            <Flag code={country as CountryCode} />
          </Grid.Item>
          <Grid.Item gridArea="country" overflow="hidden">
            <Text variant="label-3" truncate>
              {getCountryNameFromCode(country as CountryCode)}:
            </Text>
          </Grid.Item>
          <Grid.Item gridArea="docs" overflow="hidden">
            <Text variant="body-3" truncate>
              {getDocNames(countryDocMappings[country as CountryCode] ?? [])}
            </Text>
          </Grid.Item>
          <Grid.Item>
            <LinkButton onClick={() => onEdit(country as CountryCode)}>{t('edit')}</LinkButton>
          </Grid.Item>
        </Grid.Container>
      ))}
    </Stack>
  );
};

export default ExistingCountryDocMappings;
