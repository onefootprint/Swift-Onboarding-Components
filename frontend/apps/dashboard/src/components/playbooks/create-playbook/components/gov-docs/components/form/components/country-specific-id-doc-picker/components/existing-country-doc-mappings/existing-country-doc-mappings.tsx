import { getCountryNameFromCode } from '@onefootprint/global-constants';
import type { CountrySpecificDocumentMapping, IdDocKind } from '@onefootprint/request-types/dashboard';
import type { CountryCode } from '@onefootprint/types';
import { Flag, Grid, LinkButton, Stack, Text } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';

type ExistingCountryDocMappingsProps = {
  countryDocMappings: CountrySpecificDocumentMapping;
  onEdit: (country: CountryCode) => void;
};

const ExistingCountryDocMappings = ({ onEdit, countryDocMappings }: ExistingCountryDocMappingsProps) => {
  const { t } = useTranslation('common');
  const { t: docT } = useTranslation('common', { keyPrefix: 'id_document' });
  const existingCountries = Object.keys(countryDocMappings);

  const getDocNames = (docs: IdDocKind[]) => {
    return docs.map(doc => docT(doc)).join(', ');
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
              {getCountryNameFromCode(country)}:
            </Text>
          </Grid.Item>
          <Grid.Item gridArea="docs" overflow="hidden">
            <Text variant="body-3" truncate>
              {/* @ts-expect-error: backend doesn't have the correct types */}
              {getDocNames(countryDocMappings[country] ?? [])}
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
