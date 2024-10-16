import type { VaultValue } from '@onefootprint/types';
import { isVaultDataDocument, isVaultDataEmpty, isVaultDataEncrypted, isVaultDataText } from '@onefootprint/types';
import type { Transforms } from '@onefootprint/types/src/data/entity';
import { LinkButton, Text } from '@onefootprint/ui';
import { saveAs } from 'file-saver';
import { useTranslation } from 'react-i18next';

import EncryptedCell from '../encrypted-cell';

export type FieldOrPlaceholderProps = {
  data?: VaultValue;
  transforms?: Transforms;
};

const FieldOrPlaceholder = ({ data, transforms }: FieldOrPlaceholderProps) => {
  const { t } = useTranslation();

  if (isVaultDataText(data)) {
    return (
      <Text isPrivate variant="body-3" color="primary" flexWrap="wrap" wordBreak="break-all" textAlign="end">
        {data}
      </Text>
    );
  }

  // @ts-expect-error: fix-me Argument of type 'Object | VaultArrayData<unknown> | VaultDocumentData | VaultImageData | null | undefined'
  if (isVaultDataDocument(data)) {
    return (
      <LinkButton
        onClick={() => {
          saveAs(data.content, data.name);
        }}
      >
        {t('download')}
      </LinkButton>
    );
  }

  if (isVaultDataEncrypted(data)) {
    return <EncryptedCell prefix={transforms?.prefix_1} />;
  }

  if (isVaultDataEmpty(data)) {
    return <Text variant="body-3">-</Text>;
  }

  return null;
};

export default FieldOrPlaceholder;
