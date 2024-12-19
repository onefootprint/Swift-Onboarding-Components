import { useTranslation } from 'react-i18next';

const useOtherDetailText = () => {
  const { t } = useTranslation('entity-details', {
    keyPrefix: 'onboardings.business-details.details',
  });

  return (detailKind: string) => {
    if (detailKind === 'formationDate') {
      return t('formation-date');
    }
    if (detailKind === 'formationState') {
      return t('formation-state');
    }
    if (detailKind === 'tin') {
      return t('tin');
    }
    if (detailKind === 'entityType') {
      return t('entity-type');
    }
    if (detailKind === 'phoneNumber') {
      return t('phone-number');
    }
    if (detailKind === 'website') {
      return t('website');
    }
    return 'Unknown';
  };
};

export default useOtherDetailText;
