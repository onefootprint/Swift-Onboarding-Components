import React from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { LinkButton, Stack, Text } from '@onefootprint/ui';
import { useDecryptControls } from '../../../vault/components/vault-actions';

const Decrypt = () => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.entity.business-insights',
  });
  const decryptControls = useDecryptControls();

  const handleDecryptAll = () => {
    decryptControls.submitAllFields();
  };

  return (
    <Stack align="flex-start">
      <Text variant="body-3">
        <Trans
          i18nKey="pages.entity.business-insights.decrypt.message"
          components={{
            link: <LinkButton onClick={handleDecryptAll}>{t('decrypt.decrypt-all')}</LinkButton>,
          }}
        />
      </Text>
    </Stack>
  );
};

export default Decrypt;
