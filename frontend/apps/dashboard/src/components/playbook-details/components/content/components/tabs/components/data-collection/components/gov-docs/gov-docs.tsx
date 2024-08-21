import { getCountryNameFromCode } from '@onefootprint/global-constants';
import type { CountryCode, DocumentTypesAndCountries, SupportedIdDocTypes } from '@onefootprint/types';
import { Stack, Text } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import useIdDocList from 'src/hooks/use-id-doc-list';

type GovDocsProps = {
  countrySpecific?: DocumentTypesAndCountries['countrySpecific'];
  global?: DocumentTypesAndCountries['global'];
  hasSelfie?: boolean;
};

const GovDocs = ({ global = [], countrySpecific = {}, hasSelfie = false }: GovDocsProps) => {
  const { t } = useTranslation('playbooks', { keyPrefix: 'details.data-collection.gov-docs' });
  const globalList = useIdDocList(global);
  const hasGlobal = globalList.length > 0;
  const hasCountrySpecific = Object.keys(countrySpecific).length > 0;

  return (
    <Stack gap={7} flexDirection="column">
      <Stack gap={5} flexDirection="column">
        <Text variant="label-3">{t('global.title')}</Text>
        {hasGlobal ? (
          <List docList={globalList} hasSelfie={hasSelfie} />
        ) : (
          <Text variant="body-3" color="tertiary">
            {t('global.empty')}
          </Text>
        )}
      </Stack>
      <Stack gap={5} flexDirection="column">
        <Text variant="label-3">{t('country-specific.title')}</Text>
        {hasCountrySpecific ? (
          <Stack gap={3} flexDirection="column">
            {Object.entries(countrySpecific).map(([country, docs]) => {
              const countryName = getCountryNameFromCode(country as CountryCode);
              return countryName ? (
                <CountryItem label={countryName} docs={docs} key={country} hasSelfie={hasSelfie} />
              ) : null;
            })}
          </Stack>
        ) : (
          <Text variant="body-3" color="tertiary">
            {t('country-specific.empty')}
          </Text>
        )}
      </Stack>
    </Stack>
  );
};

type CountryItemProps = {
  docs: SupportedIdDocTypes[];
  label: string;
  hasSelfie: boolean;
};

const CountryItem = ({ label, docs, hasSelfie }: CountryItemProps) => {
  const list = useIdDocList(docs);

  return (
    <Stack gap={3}>
      <Text variant="body-3" color="secondary">
        {label}:
      </Text>
      <List docList={list} hasSelfie={hasSelfie} />
    </Stack>
  );
};

type ListProps = {
  docList: string[];
  hasSelfie: boolean;
};

const List = ({ docList, hasSelfie }: ListProps) => {
  return (
    <Stack gap={3}>
      <Text variant="body-3" color="tertiary">
        {docList.join(', ')}
      </Text>
      {hasSelfie ? (
        <>
          <Text variant="label-3" color="primary">
            +
          </Text>
          <Text variant="body-3" color="tertiary">
            Selfie
          </Text>
        </>
      ) : null}
    </Stack>
  );
};

export default GovDocs;
