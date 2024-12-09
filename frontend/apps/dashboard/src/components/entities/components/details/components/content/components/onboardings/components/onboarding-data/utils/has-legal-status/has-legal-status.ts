import { CdoToAllDisMap, CollectedKycDataOption, type DataIdentifier } from '@onefootprint/types';
import type { VaultType } from '../../components/onboarding-user-data/hooks/use-seqno-vault';

const hasLegalStatus = (vaultData: VaultType | undefined) =>
  Object.keys(vaultData?.vault || {}).some(di =>
    CdoToAllDisMap[CollectedKycDataOption.usLegalStatus].includes(di as DataIdentifier),
  );

export default hasLegalStatus;
