import type { DocumentTypesAndCountries, SupportedIdDocTypes } from '@onefootprint/types';
import { Divider, Stack, Text } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import CountrySpecific from '../../../country-specific';
import Global from '../../../global';

type DocTypesAndCountriesProps = {
  documentTypesAndCountries: DocumentTypesAndCountries;
  hasSelfie: boolean;
};

const DocTypesAndCountries = ({ documentTypesAndCountries, hasSelfie }: DocTypesAndCountriesProps) => {
  const { t } = useTranslation('playbooks', { keyPrefix: 'details.data-collection' });
  const { global, countrySpecific } = documentTypesAndCountries;

  return (
    <Stack gap={5} direction="column">
      <Stack gap={4} direction="column">
        <Text variant="label-3">{t('gov-docs.title')}</Text>
        <Divider variant="secondary" />
      </Stack>
      <Global global={global} hasSelfie={hasSelfie} />
      <CountrySpecific
        countrySpecific={countrySpecific as Record<string, SupportedIdDocTypes[]>}
        hasSelfie={hasSelfie}
      />
    </Stack>
  );
};

export default DocTypesAndCountries;
