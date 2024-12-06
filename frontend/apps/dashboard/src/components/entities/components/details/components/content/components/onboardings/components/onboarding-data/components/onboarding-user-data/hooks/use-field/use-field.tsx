import useEntityVault from '@/entities/hooks/use-entity-vault';
import type { DataIdentifier } from '@onefootprint/request-types/dashboard';
import { type Entity, IdDI, type VaultValue, isVaultDataDecrypted, isVaultDataEmpty } from '@onefootprint/types';
import type { Transforms } from '@onefootprint/types/src/data/entity';
import type { ParseKeys } from 'i18next';
import { useTranslation } from 'react-i18next';

export type UseFieldProps = {
  label: string;
  value: VaultValue;
  transforms: Transforms | undefined;
  isDecrypted: boolean;
  isEmpty: boolean;
};

const useField = (entity: Entity, _seqno?: number) => {
  const { t } = useTranslation('common', { keyPrefix: 'di' });
  const { data: vaultData } = useEntityVault(entity.id, entity);

  const getLabel = (di: DataIdentifier) => {
    const hasLegalStatus = !!vaultData?.vault[IdDI.usLegalStatus];
    if (di === IdDI.nationality && hasLegalStatus) {
      return t('id.country_of_birth');
    }
    return t(di as ParseKeys<'common'>);
  };

  const getProps = (di: DataIdentifier): UseFieldProps => {
    const value = vaultData?.vault[di as keyof typeof vaultData.vault];

    return {
      label: getLabel(di),
      value,
      transforms: vaultData?.transforms[di as keyof typeof vaultData.transforms],
      isDecrypted: isVaultDataDecrypted(value),
      isEmpty: isVaultDataEmpty(value),
    };
  };

  return getProps;
};

export default useField;
