import type { RiskSignalGroupKind } from '@onefootprint/request-types/dashboard';
import { useTranslation } from 'react-i18next';

const useRiskSignalGroupText = () => {
  const { t } = useTranslation('entity-details', {
    keyPrefix: 'onboardings.risk-signals.group',
  });

  return (group: RiskSignalGroupKind) => {
    if (group === 'kyc') {
      return t('kyc');
    }
    if (group === 'kyb') {
      return t('kyb');
    }
    if (group === 'doc') {
      return t('doc');
    }
    if (group === 'web_device') {
      return t('web-device');
    }
    if (group === 'native_device') {
      return t('native-device');
    }
    if (group === 'aml') {
      return t('aml');
    }
    if (group === 'behavior') {
      return t('behavior');
    }
    if (group === 'phone') {
      return t('phone');
    }
    if (group === 'synthetic') {
      return t('synthetic');
    }
  };
};

export default useRiskSignalGroupText;
