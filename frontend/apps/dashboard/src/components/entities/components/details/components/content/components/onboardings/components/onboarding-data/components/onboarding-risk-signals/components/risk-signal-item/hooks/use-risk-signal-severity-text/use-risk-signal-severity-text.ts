import type { SignalSeverity } from '@onefootprint/request-types/dashboard';
import { useTranslation } from 'react-i18next';

const useRiskSignalSeverityText = () => {
  const { t } = useTranslation('entity-details', {
    keyPrefix: 'onboardings.risk-signals.severity',
  });

  return (severity: SignalSeverity) => {
    if (severity === 'info') {
      return t('info');
    }
    if (severity === 'low') {
      return t('low');
    }
    if (severity === 'medium') {
      return t('medium');
    }
    if (severity === 'high') {
      return t('high');
    }
  };
};

export default useRiskSignalSeverityText;
