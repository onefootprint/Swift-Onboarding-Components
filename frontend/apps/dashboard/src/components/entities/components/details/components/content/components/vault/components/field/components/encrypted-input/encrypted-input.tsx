import { useTranslation } from '@onefootprint/hooks';
import { TextInput, Tooltip } from '@onefootprint/ui';
import React from 'react';

const EncryptedInput = () => {
  const { t } = useTranslation('pages.entity.edit');
  return (
    <Tooltip text={t('decrypt-first')} position="bottom">
      <TextInput
        data-private
        size="compact"
        placeholder=""
        disabled
        defaultValue="•••••••••"
      />
    </Tooltip>
  );
};

export default EncryptedInput;
