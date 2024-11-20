import { getCountryNameFromCode } from '@onefootprint/global-constants';
import type { CountrySpecificDocumentMapping, IdDocKind } from '@onefootprint/request-types/dashboard';
import type { CountryCode } from '@onefootprint/types';
import { Stack, Text } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import useIdDocList from 'src/hooks/use-id-doc-list';

type CountrySpecificProps = {
  countrySpecific: CountrySpecificDocumentMapping;
  hasSelfie: boolean;
};

const CountrySpecific = ({ countrySpecific, hasSelfie }: CountrySpecificProps) => {
  const { t } = useTranslation('playbook-details', { keyPrefix: 'data-collection' });
  const getText = useIdDocList();
  const sortedCountrySpecific = Object.entries(countrySpecific).sort(([countryA], [countryB]) =>
    countryA.localeCompare(countryB),
  ) as Array<[CountryCode, Array<IdDocKind>]>;
  const countries = sortedCountrySpecific.map(([country]) => country as CountryCode);
  const acceptedDocScans = sortedCountrySpecific.map(([, docTypes]) => docTypes);

  return (
    <Stack gap={3} direction="column">
      <Text variant="label-2">{t('gov-docs.country-specific.scans')}</Text>
      <Stack direction="row" gap={8}>
        {countries.length === 0 ? (
          <Text variant="body-2" color="secondary">
            {t('gov-docs.country-specific.none')}
          </Text>
        ) : (
          <>
            <Stack direction="column" gap={2}>
              {countries.map(country => (
                <Text key={country} variant="body-2" color="secondary">
                  {getCountryNameFromCode(country)}
                </Text>
              ))}
            </Stack>
            <Stack direction="column" gap={2}>
              {acceptedDocScans.map(docTypes => (
                <Text key={docTypes.join('-')} variant="body-2">
                  {docTypes.length > 0 ? (
                    <Stack direction="row" gap={3}>
                      <Text variant="body-2" color="tertiary" tag="span">
                        {getText(docTypes).join(', ')}
                      </Text>
                      {hasSelfie && (
                        <>
                          <Text variant="body-2" color="secondary" tag="span">
                            +
                          </Text>
                          <Text variant="body-2" color="tertiary" tag="span">
                            {t('gov-docs.selfie')}
                          </Text>
                        </>
                      )}
                    </Stack>
                  ) : (
                    <Text variant="body-2" color="secondary" tag="span">
                      {t('gov-docs.none')}
                    </Text>
                  )}
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
