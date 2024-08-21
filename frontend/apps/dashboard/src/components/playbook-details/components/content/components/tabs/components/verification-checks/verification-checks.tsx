import type { OnboardingConfig } from '@onefootprint/types';
import { Stack } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import Info from '../info';

export type VerificationChecksProps = {
  playbook: OnboardingConfig;
};

const VerificationChecks = ({ playbook: { verificationChecks } }: VerificationChecksProps) => {
  const { t } = useTranslation('playbooks', { keyPrefix: 'details.verification-checks.aml' });
  const aml = verificationChecks.find(({ kind }) => kind === 'aml');

  return (
    <Stack flexDirection="column" gap={5}>
      <Info.Group title={t('title')}>
        {aml ? (
          <>
            <Info.Item label={t('ofac')} checked={aml.data.ofac} />
            <Info.Item label={t('pep')} checked={aml.data.pep} />
            <Info.Item label={t('adverse-media')} checked={aml.data.adverseMedia} />
          </>
        ) : (
          <Info.EmptyItem>{t('empty')}</Info.EmptyItem>
        )}
      </Info.Group>
    </Stack>
  );
};

export default VerificationChecks;
