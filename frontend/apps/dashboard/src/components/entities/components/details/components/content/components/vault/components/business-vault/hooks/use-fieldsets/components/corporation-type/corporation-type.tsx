import type { DataIdentifier, Entity } from '@onefootprint/types';
import { BusinessDI, isVaultDataDecrypted } from '@onefootprint/types';
import { Typography } from '@onefootprint/ui';
import type { ParseKeys } from 'i18next';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { EncryptedCell } from 'src/components';

import Field from '../../../../../field';

export type CorporationTypeType = {
  di: DataIdentifier;
  entity: Entity;
};

const CorporationType = ({ di, entity }: CorporationTypeType) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.business.vault.basic.corporation-type',
  });
  return entity.attributes.includes(BusinessDI.corporationType) ? (
    <Field
      di={di}
      entity={entity}
      renderValue={value => {
        if (isVaultDataDecrypted(value)) {
          return (
            <Typography variant="body-3" color="primary">
              {t(`${value}` as ParseKeys<'common'>)}
            </Typography>
          );
        }
        return <EncryptedCell />;
      }}
    />
  ) : null;
};

export default CorporationType;
