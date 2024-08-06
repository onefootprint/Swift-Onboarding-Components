import { useTranslation } from 'react-i18next';

import DesktopBanner from './components/desktop-banner';
import MobileBanner from './components/mobile-banner/mobile-banner';

const MakeItYours = () => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.auth.make-it-yours',
  });
  return (
    <>
      <DesktopBanner title={t('title')} subtitle={t('subtitle')} />
      <MobileBanner title={t('title')} subtitle={t('subtitle')} />
    </>
  );
};

export default MakeItYours;
