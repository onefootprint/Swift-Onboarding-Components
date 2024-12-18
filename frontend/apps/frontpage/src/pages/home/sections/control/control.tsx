import { useTranslation } from 'react-i18next';

import FrontpageContainer from 'src/components/frontpage-container';
import SectionTitle from '../../../../components/section-title';
import IllustrationGrid from './illustration-grid';

const Control = () => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.home.control',
  });

  return (
    <>
      <FrontpageContainer className="relative pt-16 pb-11 md:pt-32 md:pb-16 gap-11">
        <SectionTitle title={t('title')} subtitle={t('subtitle')} />
      </FrontpageContainer>
      <IllustrationGrid />
    </>
  );
};

export default Control;
