import { useTranslation } from 'react-i18next';

type MetaProps = {
  collectsTin: boolean;
  collectsBO: boolean;
  collectsBusinessAddress: boolean;
  runKyb: boolean;
};

const useMeta = ({ runKyb, collectsTin, collectsBO, collectsBusinessAddress }: MetaProps) => {
  const { t } = useTranslation('playbooks', { keyPrefix: 'create.verification-checks' });

  return {
    businessAml: {
      disabled: !runKyb || !collectsBO,
      disabledText: !runKyb ? t('aml.disabled.must-run-kyb') : t('aml.disabled.missing-bos'),
    },
    kyc: {
      // KYC is always determined by whether we collect BOs
      disabled: true,
      disabledText: collectsBO
        ? t('kyc-checks.disabled.must-kyc-if-collecting-bos')
        : t('kyc-checks.disabled.missing-bos'),
    },
    kyb: {
      disabled: !collectsTin,
      disabledText: t('kyb-checks.disabled'),
    },
    kybKind: {
      disabled: !collectsBusinessAddress,
      disabledText: t('kyb-checks.full.disabled'),
    },
  };
};

export default useMeta;
