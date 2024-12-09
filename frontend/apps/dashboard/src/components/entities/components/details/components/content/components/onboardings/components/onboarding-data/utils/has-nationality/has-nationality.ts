import type { VaultType } from '../../components/onboarding-user-data/hooks/use-seqno-vault';

const hasNationality = (vaultData: VaultType | undefined) =>
  Object.keys(vaultData?.vault || {}).some(di => di === 'id.nationality');

export default hasNationality;
