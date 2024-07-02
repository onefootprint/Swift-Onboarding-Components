import { IcoCheck24, IcoClose24 } from '@onefootprint/icons';
import { Stack, Text } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

import useAdditionalDocs from '../hooks/use-additional-docs';

const DocPreview = () => {
  const { t } = useTranslation('playbooks', {
    keyPrefix: 'create.data-to-collect.additional-docs',
  });
  const {
    meta: { hasDoc, hasPoA, hasPoSsn },
  } = useAdditionalDocs();

  return hasDoc ? (
    <Stack direction="column" gap={5}>
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
  ) : (
    <Text variant="body-3" color="tertiary">
      {t('description')}
    </Text>
  );
};

export default DocPreview;
