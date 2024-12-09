import type { DataIdentifier } from '@onefootprint/request-types/dashboard';
import { IdDI, isVaultDataDecrypted, isVaultDataEmpty } from '@onefootprint/types';
import type { ParseKeys } from 'i18next';
import { useTranslation } from 'react-i18next';
import type { VaultType } from '../use-seqno-vault';

export type UseFieldProps = {
  label: string;
  value: unknown;
  transforms: unknown;
  isDecrypted: boolean;
  isEmpty: boolean;
};

const useField = (vaultData: VaultType | undefined) => {
  const { t } = useTranslation('common', { keyPrefix: 'di' });

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
