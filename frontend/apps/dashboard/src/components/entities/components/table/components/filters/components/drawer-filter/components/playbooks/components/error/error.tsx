import { IcoWarning24 } from '@onefootprint/icons';
import { Stack, Text } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

const ErrorComponent = () => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.entities.filters.drawer.playbooks',
  });

  return (
    <Stack>
      <Stack marginRight={3}>
        <IcoWarning24 color="error" />
      </Stack>
      <Text variant="body-2" color="error">
        {t('error')}
      </Text>
    </Stack>
  );
};

export default ErrorComponent;
