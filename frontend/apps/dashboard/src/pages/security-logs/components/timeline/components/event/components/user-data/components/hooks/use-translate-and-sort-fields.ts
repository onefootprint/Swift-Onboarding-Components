import type { CollectedDataOption, DataIdentifier } from '@onefootprint/request-types/dashboard';
import {
  CdoToAllDisMap,
  CollectedKybDataOption,
  type DataIdentifier as LegacyDataIdentifier,
} from '@onefootprint/types';
import { useTranslation } from 'react-i18next';

type TranslatedField = {
  key: string;
  /** Translated display name. We will only show one entry for each display name */
  displayName: string;
  /** A key used to sort fields, which allows grouping fields under the same CDO close to each other */
  sortKey: string;
};

/** Groups fields into a deterministic order, sorted by the parent CDO. This places fields under the same CDO close to each other. */
const useTranslateAndSortFields = (dis: DataIdentifier[], cdos: CollectedDataOption[]) => {
  const { t: diT } = useTranslation('common', { keyPrefix: 'di' });
  const { t: cdoT } = useTranslation('common', { keyPrefix: 'cdo' });

  const translateDi = (di: DataIdentifier): TranslatedField => {
    if (di.startsWith('custom.'))
      return {
        key: di,
        displayName: di,
        sortKey: 'custom',
      };

    // @ts-expect-error: Display undocumented DI as "Beneficial owners"
    if (di.startsWith('business.beneficial_owners.') || di === 'business.beneficial_owner_explanation_message')
      return {
        key: di,
        displayName: diT('business.beneficial_owners'),
        sortKey: CollectedKybDataOption.kycedBeneficialOwners,
      };

    // Sort fields within a CDO together, and order individual fields in the CDO
    const cdoEntry = Object.entries(CdoToAllDisMap).find(([_, dis]) => dis.includes(di as LegacyDataIdentifier));
    if (!cdoEntry)
      return {
        key: di,
        displayName: diT(di),
        sortKey: di.split('.').slice(1).join('.'),
      };

    const [cdo, dis] = cdoEntry;
    const idxInCdo = dis.indexOf(di as LegacyDataIdentifier);
    return {
      key: di,
      displayName: diT(di),
      sortKey: `${cdo}.${idxInCdo}`,
    };
  };

  const translateCdo = (cdo: CollectedDataOption): TranslatedField => {
    return {
      key: cdo,
      displayName: cdoT(cdo),
      sortKey: cdo,
    };
  };

  const allFields = [...dis.map(translateDi), ...cdos.map(translateCdo)];

  // Only take the first field for each display name. We might have duplicates for, for ex, business
  // beneficial owners
  const distinctOnDisplayName = (field: TranslatedField, index: number, self: TranslatedField[]) =>
    index === self.findIndex(t => t.displayName === field.displayName);
  const uniqueFields = allFields.filter(distinctOnDisplayName);

  // Sort first by the sortKey and then by the key (data identifier)
  const sortedFields = uniqueFields.sort((a, b) => {
    const sortKey = a.sortKey.localeCompare(b.sortKey);
    if (sortKey !== 0) return sortKey;
    return a.key.localeCompare(b.key);
  });

  const sortedDisplayNames = sortedFields.map(field => field.displayName);

  return sortedDisplayNames;
};

export default useTranslateAndSortFields;
