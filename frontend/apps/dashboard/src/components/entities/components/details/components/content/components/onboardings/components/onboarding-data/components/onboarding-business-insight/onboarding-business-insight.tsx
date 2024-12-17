import { useTranslation } from 'react-i18next';
import type { Subsection as SubsectionType } from '../../hooks/use-subsections';
import Decrypt from '../decrypt';
import type { VaultType } from '../onboarding-user-data/hooks/use-seqno-vault';
import Subsection from '../subsection';

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
  title,
  onboardingId,
  vault,
}: OnboardingBusinessInsightProps) => {
  const { t } = useTranslation('entity-details', { keyPrefix: 'onboardings.business-insight' });
  const { data: vaultData, update: updateVault } = vault;

  if (!isDecrypted) {
    return (
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
  }

  return <span className="text-body-3">[decrypted details here]</span>;
};

export default OnboardingBusinessInsight;
