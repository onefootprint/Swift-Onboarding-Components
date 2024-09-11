import { CollectedKybDataOption, type OnboardingConfig, OnboardingConfigKind } from '@onefootprint/types';
import { Stack } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import Info from '../info';
import { isAmlCheck, isKybCheck, isKycCheck } from './verification-checks.utils';

export type VerificationChecksProps = {
  playbook: OnboardingConfig;
};

const VerificationChecks = ({
  playbook: { kind, verificationChecks, mustCollectData, skipKyc },
}: VerificationChecksProps) => {
  const { t } = useTranslation('playbooks', { keyPrefix: 'details.verification-checks' });

  const kyb = verificationChecks.find(isKybCheck);
  const kyc = verificationChecks.find(isKycCheck);
  const aml = verificationChecks.find(isAmlCheck);

  const kybText = (() => {
    if (kind === OnboardingConfigKind.kyc) return null;
    if (kyb?.data) {
      return kyb.data.einOnly ? t('kyb.ein-only') : t('kyb.full');
    }
    return t('kyb.none');
  })();

  const kycText = (() => {
    if (kind === OnboardingConfigKind.kyb) {
      if (skipKyc) return t('kyb.kyc.none');
      if (mustCollectData.includes(CollectedKybDataOption.beneficialOwners)) return t('kyb.kyc.primary-only');
      if (mustCollectData.includes(CollectedKybDataOption.kycedBeneficialOwners)) return t('kyb.kyc.full');
    }
    if (kind === OnboardingConfigKind.kyc) {
      return kyc ? t('kyc.full') : t('kyc.none');
    }
    return null;
  })();

  return (
    <Stack flexDirection="column" gap={8}>
      {kybText && (
        <Info.Group title={t('kyb.title')}>
          <Info.Item label={kybText} checked={!!kyb?.data} />
        </Info.Group>
      )}
      {kycText && (
        <Info.Group title={t('kyc.title')}>
          <Info.Item label={kycText} checked={kyc && !skipKyc} />
        </Info.Group>
      )}
      <Info.Group title={t('aml.title')}>
        {aml ? (
          <>
            <Info.Item label={t('aml.ofac')} checked={aml.data.ofac} />
            <Info.Item label={t('aml.pep')} checked={aml.data.pep} />
            <Info.Item label={t('aml.adverse-media')} checked={aml.data.adverseMedia} />
          </>
        ) : (
          <Info.Item label={t('aml.none')} checked={false} />
        )}
      </Info.Group>
    </Stack>
  );
};

export default VerificationChecks;
