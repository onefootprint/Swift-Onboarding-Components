import type { DataIdentifier, Entity, VaultValue } from '@onefootprint/types';
import { BusinessDI, isVaultDataDecrypted } from '@onefootprint/types';
import { Text } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import { EncryptedCell } from 'src/components';
import hasDataIdentifier from 'src/utils/has-data-identifier';

import Field from '../../../../../field';

export type CorporationTypeType = {
  di: DataIdentifier;
  entity: Entity;
};

const CorporationType = ({ di, entity }: CorporationTypeType) => {
  const { t } = useTranslation('business-details', {
    keyPrefix: 'vault.basic.corporation-type',
  });

  const getCorporationTypeText = (value: VaultValue) => {
    if (value === 'agent') return t('agent');
    if (value === 'c_corporation') return t('c_corporation');
    if (value === 's_corporation') return t('s_corporation');
    if (value === 'b_corporation') return t('b_corporation');
    if (value === 'llc') return t('llc');
    if (value === 'llp') return t('llp');
    if (value === 'non_profit') return t('non_profit');
    if (value === 'partnership') return t('partnership');
    if (value === 'sole_proprietorship') return t('sole_proprietorship');
    if (value === 'trust') return t('trust');
    return t('unknown');
  };

  return hasDataIdentifier(entity, BusinessDI.corporationType) ? (
    <Field
      di={di}
      entity={entity}
      renderValue={value => {
        if (isVaultDataDecrypted(value)) {
          return (
            <Text variant="body-3" color="primary">
              {getCorporationTypeText(value)}
            </Text>
          );
        }
        return <EncryptedCell />;
      }}
    />
  ) : null;
};

export default CorporationType;
