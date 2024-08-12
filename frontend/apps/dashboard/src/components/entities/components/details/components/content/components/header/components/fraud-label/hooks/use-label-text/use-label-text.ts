import { EntityLabel } from '@onefootprint/types';
import { useTranslation } from 'react-i18next';

const useLabelText = () => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.entity.header.fraud-label.labels',
  });

  return (label: EntityLabel) => {
    if (label === EntityLabel.active) {
      return t('active');
    }
    if (label === EntityLabel.offboard_fraud) {
      return t('offboard-fraud');
    }
    if (label === EntityLabel.offboard_other) {
      return t('offboard-other');
    }
    return '';
  };
};

export default useLabelText;
