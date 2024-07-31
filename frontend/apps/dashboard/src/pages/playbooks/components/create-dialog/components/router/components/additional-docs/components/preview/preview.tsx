import { IcoCheck24, IcoClose24 } from '@onefootprint/icons';
import { Stack, Text } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

import useAdditionalDocs from '../../hooks/use-additional-docs';

const Preview = () => {
  const { t } = useTranslation('playbooks', {
    keyPrefix: 'create.additional-docs',
  });
  const {
    custom,
    requireManualReview,
    meta: { hasDoc, hasPoA, hasPoSsn, hasCustom },
  } = useAdditionalDocs();

  return hasDoc ? (
    <Stack gap={7} flexDirection="column">
      <Stack flexDirection="column" gap={5}>
        <Stack justifyContent="space-between">
          <Text variant="body-3" color="tertiary">
            {t('form.poa.label')}
          </Text>
          {hasPoA ? <IcoCheck24 /> : <IcoClose24 />}
        </Stack>
        <Stack justifyContent="space-between">
          <Text variant="body-3" color="tertiary">
            {t('form.possn.label')}
          </Text>
          {hasPoSsn ? <IcoCheck24 /> : <IcoClose24 />}
        </Stack>
      </Stack>
      {hasCustom ? (
        <Stack justifyContent="space-between" flexDirection="column" gap={5}>
          <Text variant="label-3">{t('form.custom.label')}</Text>
          <Text variant="body-3" color="tertiary">
            {custom.map(doc => doc.name).join(', ')}
          </Text>
        </Stack>
      ) : null}
      {hasDoc ? (
        <Stack justifyContent="space-between" flexDirection="column" gap={5}>
          <Text variant="label-3">{t('extra-requirements')}</Text>
          <Stack justifyContent="space-between">
            <Text variant="body-3" color="tertiary">
              {t('form.require-manual-review.label')}
            </Text>
            {requireManualReview ? <IcoCheck24 /> : <IcoClose24 />}
          </Stack>
        </Stack>
      ) : null}
    </Stack>
  ) : (
    <Text variant="body-3" color="tertiary">
      {t('description')}
    </Text>
  );
};

export default Preview;
