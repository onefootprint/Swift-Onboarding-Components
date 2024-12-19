import { useTranslation } from 'react-i18next';
import FrontpageContainer from 'src/components/frontpage-container';
import CaptureAnimation from './component/capture-animation';

const Hero = () => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.doc-scan.hero',
  });
  return (
    <FrontpageContainer className="flex flex-col items-center justify-center gap-4 pt-12 md:pt-24 md:pb-32 ">
      <h1 className="text-center text-display-2 md:text-display-1 max-w-[800px]">{t('title')}</h1>
      <p className="text-center text-display-4 text-secondary max-w-[800px]">{t('subtitle')}</p>
      <CaptureAnimation />
    </FrontpageContainer>
  );
};

export default Hero;
