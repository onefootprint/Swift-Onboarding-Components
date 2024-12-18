import { useTranslation } from 'react-i18next';

import CardContainer from '../../components/card-container/card-container';
import CardTitle from '../../components/card-title';

export const GovernmentIdCard = () => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.home.control.illustration.government-issued-id',
  });

  return (
    <span className="relative z-30">
      <div className="absolute top-0 left-0 w-full h-full border border-dashed rounded border-tertiary bg-secondary" />
      <CardContainer
        className="
          origin-top-left rotate-[3deg] shadow-lg 
          w-fit left-2 md:left-0 -top-1 md:top-0 
          scale-[0.98] md:scale-100
        "
      >
        <CardTitle type="add">{t('title')}</CardTitle>
        <p className="text-body-3 text-tertiary">{t('subtitle')}</p>
      </CardContainer>
    </span>
  );
};

export default GovernmentIdCard;
