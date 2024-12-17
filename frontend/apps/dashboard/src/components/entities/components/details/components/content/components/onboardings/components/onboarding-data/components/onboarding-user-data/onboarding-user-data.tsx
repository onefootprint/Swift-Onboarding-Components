import useEntityId from '@/entities/components/details/hooks/use-entity-id';
import { getEntitiesByFpIdDataOptions } from '@onefootprint/axios/dashboard';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import hasLegalStatus from '../../utils/has-legal-status';
import hasNationality from '../../utils/has-nationality';
import Subsection from '../subsection';
import Decrypt from './components/decrypt';
import Fieldset from './components/fieldset';
import useField from './hooks/use-field';
import useFieldsets from './hooks/use-fieldsets';
import useSeqnoVault from './hooks/use-seqno-vault';

type OnboardingUserDataProps = {
  onboardingId: string;
  seqno: number | undefined;
};

const OnboardingUserData = ({ onboardingId, seqno }: OnboardingUserDataProps) => {
  const { t } = useTranslation('entity-details', { keyPrefix: 'onboardings.user-data' });
  const entityId = useEntityId();
  const { data: entityAttributes } = useQuery({
    ...getEntitiesByFpIdDataOptions({
      path: { fpId: entityId },
      query: { seqno },
    }),
    enabled: Boolean(entityId) && Boolean(seqno),
  });
  const { data: vaultData, update: updateVault, isAllDecrypted } = useSeqnoVault(entityAttributes, seqno?.toString());
  const hasDecryptableDIs = Boolean(entityAttributes?.some(attr => attr.isDecryptable));
  const includeNationality = hasNationality(vaultData) && !hasLegalStatus(vaultData);
  const { basic, address, identity, custom } = useFieldsets(includeNationality);
  const getFieldProps = useField(vaultData);
  const hasCustomData = Object.keys(vaultData?.vault || {}).some(di => di.startsWith('custom'));

  return (
    <Subsection
      title={t('title')}
      rightComponent={
        !isAllDecrypted && (
          <Decrypt
            canDecrypt={hasDecryptableDIs}
            onDecryptSuccess={updateVault}
            onboardingId={onboardingId}
            vaultData={vaultData}
          />
        )
      }
    >
      <div className="grid grid-cols-2 gap-y-6 gap-x-10">
        <Fieldset fields={basic.fields} title={basic.title} useField={getFieldProps} />
        <Fieldset fields={address.fields} title={address.title} useField={getFieldProps} />
        <Fieldset fields={identity.fields} title={identity.title} useField={getFieldProps} />
        {hasCustomData && <Fieldset fields={custom.fields} title={custom.title} useField={getFieldProps} />}
      </div>
    </Subsection>
  );
};

export default OnboardingUserData;
