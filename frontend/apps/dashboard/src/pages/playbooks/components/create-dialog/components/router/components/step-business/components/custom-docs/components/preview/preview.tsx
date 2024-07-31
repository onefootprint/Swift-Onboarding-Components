import { IcoCheck24, IcoClose24 } from '@onefootprint/icons';
import { Stack, Text } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

import useCustomDocsValues from '../../hooks/use-custom-docs-values';

const Preview = () => {
  const { t } = useTranslation('playbooks', {
    keyPrefix: 'create.business.custom-docs',
  });
  const {
    custom,
    meta: { hasDoc },
  } = useCustomDocsValues();

  return hasDoc ? (
    <Stack gap={7} flexDirection="column">
      {hasDoc ? (
        <Stack justifyContent="space-between" flexDirection="column" gap={5}>
          <Text variant="label-3">{t('form.custom.label')}</Text>
          <Text variant="body-3" color="tertiary">
            {custom.map(doc => doc.name).join(', ')}
          </Text>
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
