import { IcoCheck24, IcoClose24 } from '@onefootprint/icons';
import { Stack, Text } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';

import useMeta from '../../hooks/use-meta';
import CountryIdDocList from './components/country-id-doc-list';
import IdDocList from './components/id-doc-list';

const Preview = () => {
  const { t } = useTranslation('playbooks', { keyPrefix: 'create.gov-docs' });
  const {
    globalDocs,
    countryDocs,
    meta: { hasDoc, hasGlobalDocs, hasCountryDocs, hasSelfie },
  } = useMeta();

  return hasDoc ? (
    <Stack direction="column" gap={8}>
      {hasGlobalDocs ? (
        <Stack direction="column" gap={5}>
          <Text variant="label-3">{t('global.title')}</Text>
          <IdDocList docs={globalDocs} />
        </Stack>
      ) : null}
      {hasCountryDocs ? (
        <Stack direction="column" gap={5}>
          <Text variant="label-3">{t('country-specific.title')}</Text>
          <CountryIdDocList countryDocs={countryDocs} />
        </Stack>
      ) : null}
      <Stack direction="column" gap={5}>
        <Text variant="label-3">{t('extra-requirements.title')}</Text>
        <Stack justifyContent="space-between">
          <Text variant="body-3" color="tertiary">
            {t('extra-requirements.selfie.title')}
          </Text>
          {hasSelfie ? <IcoCheck24 /> : <IcoClose24 />}
        </Stack>
      </Stack>
    </Stack>
  ) : (
    <Text variant="body-3" color="tertiary">
      {t('description')}
    </Text>
  );
};

export default Preview;
