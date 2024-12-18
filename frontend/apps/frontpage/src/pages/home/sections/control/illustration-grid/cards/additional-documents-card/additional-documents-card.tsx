import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import CardAppearContent from '../../components/card-appear-content';
import CardContainer from '../../components/card-container/card-container';
import CardTitle from '../../components/card-title';

type AdditionalDocumentsCardProps = {
  className?: string;
};

export const AdditionalDocumentsCard = ({ className }: AdditionalDocumentsCardProps) => {
  const [isExtraContentVisible, setIsExtraContentVisible] = useState<boolean>(false);
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.home.control.illustration.additional-documents',
  });

  return (
    <CardContainer className={className}>
      <CardTitle type="add" onClick={() => setIsExtraContentVisible((prev: boolean) => !prev)}>
        {t('title')}
      </CardTitle>
      <p className="text-body-3 text-tertiary">{t('subtitle')}</p>
      <CardAppearContent isVisible={isExtraContentVisible}>{t('extra-content')}</CardAppearContent>
    </CardContainer>
  );
};

export default AdditionalDocumentsCard;
