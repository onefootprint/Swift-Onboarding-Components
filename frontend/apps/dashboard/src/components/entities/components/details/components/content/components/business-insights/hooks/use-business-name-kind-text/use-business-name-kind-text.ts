import { BusinessNameKind } from '@onefootprint/types';
import { useTranslation } from 'react-i18next';

const useBusinessNameKindText = () => {
  const { t } = useTranslation('entity-details', {
    keyPrefix: 'business-insights.name.table',
  });

  return (status: BusinessNameKind | null) => {
    if (status === BusinessNameKind.dba) {
      return t('dba');
    }
    if (status === BusinessNameKind.legal) {
      return t('legal');
    }
    return '-';
  };
};

export default useBusinessNameKindText;
