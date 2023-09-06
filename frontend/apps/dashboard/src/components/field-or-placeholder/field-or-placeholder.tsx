import { useTranslation } from '@onefootprint/hooks';
import type { VaultValue } from '@onefootprint/types';
import {
  isVaultDataDocument,
  isVaultDataEmpty,
  isVaultDataEncrypted,
  isVaultDataText,
} from '@onefootprint/types';
import { LinkButton, Typography } from '@onefootprint/ui';
import { saveAs } from 'file-saver';
import React from 'react';

import EncryptedCell from '../encrypted-cell';

export type FieldOrPlaceholderProps = {
  data?: VaultValue;
};

const FieldOrPlaceholder = ({ data }: FieldOrPlaceholderProps) => {
  const { t } = useTranslation();

  if (isVaultDataText(data)) {
    return (
      <Typography isPrivate variant="body-3" color="primary">
        {data}
      </Typography>
    );
  }

  if (isVaultDataDocument(data)) {
    return (
      <LinkButton
        size="compact"
        onClick={() => {
          saveAs(data.content, data.name);
        }}
      >
        {t('download')}
      </LinkButton>
    );
  }

  if (isVaultDataEncrypted(data)) {
    return <EncryptedCell />;
  }

  if (isVaultDataEmpty(data)) {
    return <Typography variant="body-3">-</Typography>;
  }

  return null;
};

export default FieldOrPlaceholder;
