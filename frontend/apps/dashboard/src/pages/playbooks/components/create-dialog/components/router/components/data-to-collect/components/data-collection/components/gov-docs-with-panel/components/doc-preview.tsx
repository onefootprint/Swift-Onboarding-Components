import { IcoCheck24, IcoClose24 } from '@onefootprint/icons';
import { Stack, Text } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

import useDocs from '../../../../../../../../../hooks/use-docs';
import CountryIdDocList from './country-id-doc-list';
import IdDocList from './id-doc-list';

const DocPreview = () => {
  const { t } = useTranslation('playbooks', { keyPrefix: 'create.data-to-collect.gov-docs' });
  const {
    globalDocs,
    countryDocs,
    meta: { hasDoc, hasGlobalDocs, hasCountryDocs, hasSelfie },
  } = useDocs();

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

export default DocPreview;
