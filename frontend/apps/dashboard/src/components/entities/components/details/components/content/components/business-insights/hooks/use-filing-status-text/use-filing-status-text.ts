import { FilingStatus } from '@onefootprint/types';
import { useTranslation } from 'react-i18next';

const useFilingStatusText = () => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.entity.business-insights.sos-filings.status',
  });

  return (status: FilingStatus) => {
    if (status === FilingStatus.unknown) {
      return t('unknown');
    }
    if (status === FilingStatus.active) {
      return t('active');
    }
    if (status === FilingStatus.inactive) {
      return t('inactive');
    }
  };
};

export default useFilingStatusText;
