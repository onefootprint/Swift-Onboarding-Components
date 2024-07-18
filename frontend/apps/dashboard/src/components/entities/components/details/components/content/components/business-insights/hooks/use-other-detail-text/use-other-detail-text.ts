import { useTranslation } from 'react-i18next';
import { BusinessDetail } from '../../types';

const useOtherDetailText = () => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.entity.business-insights.details',
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
