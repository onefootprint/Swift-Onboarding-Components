import { BusinessDetail } from '@onefootprint/types';
import { useTranslation } from 'react-i18next';

const useOtherDetailText = () => {
  const { t } = useTranslation('entity-details', {
    keyPrefix: 'business-insights.details',
  });

  return (detailKind: BusinessDetail) => {
    if (detailKind === BusinessDetail.formationDate) {
      return t('formation-date');
    }
    if (detailKind === BusinessDetail.formationState) {
      return t('formation-state');
    }
    if (detailKind === BusinessDetail.tin) {
      return t('tin');
    }
    if (detailKind === BusinessDetail.entityType) {
      return t('entity-type');
    }
    if (detailKind === BusinessDetail.phoneNumber) {
      return t('phone-number');
    }
    if (detailKind === BusinessDetail.website) {
      return t('website');
    }
    return 'Unknown';
  };
};

export default useOtherDetailText;
