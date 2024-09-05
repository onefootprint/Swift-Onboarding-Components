import { getCountryNameFromCode } from '@onefootprint/global-constants';
import type { CountryCode, SupportedIdDocTypes } from '@onefootprint/types';
import { Stack, Text } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import useIdDocList from 'src/hooks/use-id-doc-list';

type CountrySpecificProps = {
  countrySpecific: Partial<Record<CountryCode, SupportedIdDocTypes[]>>;
};

const CountrySpecific = ({ countrySpecific }: CountrySpecificProps) => {
  const { t } = useTranslation('playbooks', { keyPrefix: 'details.data-collection' });

  const sortedCountrySpecific = Object.entries(countrySpecific).sort(([a], [b]) => a.localeCompare(b));
  const countries = sortedCountrySpecific.map(([country]) => country as CountryCode);
  const acceptedDocScans = sortedCountrySpecific.map(([, docTypes]) => docTypes);

  return (
    <Stack gap={3} direction="column">
      <Text variant="label-4">{t('gov-docs.country-specific.scans')}</Text>
      <Stack direction="row" gap={8} paddingLeft={3}>
        {countries.length === 0 ? (
          <Text variant="body-3">{t('gov-docs.country-specific.none')}</Text>
        ) : (
          <>
            <Stack direction="column" gap={2}>
              {countries.map(country => (
                <Text key={country} variant="body-3">
                  {getCountryNameFromCode(country)}
                </Text>
              ))}
            </Stack>
            <Stack direction="column" gap={2}>
              {acceptedDocScans.map(docTypes => (
                <Text key={docTypes.join('-')} variant="body-3" color={docTypes.length ? 'tertiary' : 'quaternary'}>
                  {docTypes.length > 0 ? useIdDocList(docTypes).join(', ') : t('gov-docs.none')}
                </Text>
              ))}
            </Stack>
          </>
        )}
      </Stack>
    </Stack>
  );
};

export default CountrySpecific;
