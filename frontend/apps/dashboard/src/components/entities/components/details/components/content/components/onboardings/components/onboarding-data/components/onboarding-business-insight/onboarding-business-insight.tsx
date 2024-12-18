import { useTranslation } from 'react-i18next';
import type { Subsection as SubsectionType } from '../../hooks/use-subsections';
import Decrypt from '../decrypt';
import type { VaultType } from '../onboarding-user-data/hooks/use-seqno-vault';
import Subsection from '../subsection';
import DecryptedContent from './components/decrypted-content';

type OnboardingBusinessInsightProps = {
  canDecrypt: boolean;
  isDecrypted: boolean;
  selectedSubsection: SubsectionType;
  title: string;
  onboardingId: string;
  vault: { data: VaultType | undefined; update: (newData: VaultType) => void; isAllDecrypted: boolean };
};

const OnboardingBusinessInsight = ({
  canDecrypt,
  isDecrypted,
  selectedSubsection,
  title,
  onboardingId,
  vault,
}: OnboardingBusinessInsightProps) => {
  const { t } = useTranslation('entity-details', { keyPrefix: 'onboardings.business-insight' });
  const { data: vaultData, update: updateVault } = vault;

  return isDecrypted ? (
    <DecryptedContent onboardingId={onboardingId} selectedSubsection={selectedSubsection} />
  ) : (
    <Subsection
      title={title}
      hasDivider
      rightComponent={
        <Decrypt
          canDecrypt={canDecrypt}
          onDecryptSuccess={updateVault}
          onboardingId={onboardingId}
          vaultData={vaultData}
        />
      }
    >
      <span className="text-body-3">{t('encrypted')}</span>
    </Subsection>
  );
};

export default OnboardingBusinessInsight;
