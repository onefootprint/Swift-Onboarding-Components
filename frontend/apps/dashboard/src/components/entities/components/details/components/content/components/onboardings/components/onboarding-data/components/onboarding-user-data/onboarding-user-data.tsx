import { useTranslation } from 'react-i18next';
import hasLegalStatus from '../../utils/has-legal-status';
import hasNationality from '../../utils/has-nationality';
import Decrypt from '../decrypt';
import Subsection from '../subsection';
import Fieldset from './components/fieldset';
import useField from './hooks/use-field';
import useFieldsets from './hooks/use-fieldsets';
import type { VaultType } from './hooks/use-seqno-vault';

type OnboardingUserDataProps = {
  onboardingId: string;
  canDecrypt: boolean;
  vault: { data: VaultType | undefined; update: (newData: VaultType) => void; isAllDecrypted: boolean };
};

const OnboardingUserData = ({ canDecrypt, onboardingId, vault }: OnboardingUserDataProps) => {
  const { t } = useTranslation('entity-details', { keyPrefix: 'onboardings.user-data' });
  const { data: vaultData, update: updateVault, isAllDecrypted } = vault;
  const includeNationality = hasNationality(vaultData) && !hasLegalStatus(vaultData);
  const { basic, address, identity, custom } = useFieldsets(includeNationality);
  const getFieldProps = useField(vaultData);
  const hasCustomData = Object.keys(vaultData?.vault || {}).some(di => di.startsWith('custom'));

  return (
    <Subsection
      title={t('title')}
      hasDivider
      rightComponent={
        isAllDecrypted && (
          <Decrypt
            canDecrypt={canDecrypt}
            onDecryptSuccess={updateVault}
            onboardingId={onboardingId}
            vaultData={vaultData}
          />
        )
      }
    >
      <div className="flex flex-col gap-4">
        <Fieldset fields={basic.fields} title={basic.title} useField={getFieldProps} />
        <Fieldset fields={address.fields} title={address.title} useField={getFieldProps} />
        <Fieldset fields={identity.fields} title={identity.title} useField={getFieldProps} />
        {hasCustomData && <Fieldset fields={custom.fields} title={custom.title} useField={getFieldProps} />}
      </div>
    </Subsection>
  );
};

export default OnboardingUserData;
