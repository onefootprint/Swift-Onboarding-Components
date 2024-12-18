import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import CardAppearContent from '../../components/card-appear-content';
import CardContainer from '../../components/card-container';
import CardTitle from '../../components/card-title';

type InvestorQuestionsCardProps = {
  className?: string;
};

const InvestorQuestionsCard = ({ className }: InvestorQuestionsCardProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.home.control.illustration.investor-profile-questions',
  });

  const [isExtraContentVisible, setIsExtraContentVisible] = useState(false);

  return (
    <CardContainer className={className}>
      <CardTitle type="add" onClick={() => setIsExtraContentVisible(prev => !prev)}>
        {t('title')}
      </CardTitle>
      <p className="text-body-3 text-tertiary">{t('subtitle')}</p>
      <CardAppearContent isVisible={isExtraContentVisible}>{t('extra-content')}</CardAppearContent>
    </CardContainer>
  );
};

export default InvestorQuestionsCard;
