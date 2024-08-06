import type { DataIdentifier, Entity } from '@onefootprint/types';
import { isVaultDataDecrypted, isVaultDataText } from '@onefootprint/types';
import { Text } from '@onefootprint/ui';
import type { ParseKeys } from 'i18next';
import { useTranslation } from 'react-i18next';
import { EncryptedCell } from 'src/components';

import Field from '../../../../../field';

export type UsLegalStatusType = {
  di: DataIdentifier;
  entity: Entity;
};

const UsLegalStatus = ({ di, entity }: UsLegalStatusType) => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.user.vault' });
  return (
    <Field
      di={di}
      entity={entity}
      renderValue={value => {
        if (isVaultDataDecrypted(value) && isVaultDataText(value)) {
          return (
            <Text variant="body-3" color="primary">
              {t(`us-legal-status.status.options.${value}` as ParseKeys<'common'>)}
            </Text>
          );
        }
        return <EncryptedCell />;
      }}
    />
  );
};

export default UsLegalStatus;
