import Image from 'next/image';
import { useTranslation } from 'react-i18next';

import FrontpageContainer from 'src/components/frontpage-container';
import Logos from './logos';

const CustomersLogos = () => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.home.logos-section',
  });
  return (
    <FrontpageContainer className="flex flex-col items-center gap-9">
      <div className="flex flex-col items-center gap-6 max-w-[540px] text-center">
        <Image src="/home/hero/sparkles-01.svg" alt="Sparkles" width={32} height={32} />
        <h4 className="text-display-4">{t('title')}</h4>
      </div>
      <Logos />
    </FrontpageContainer>
  );
};

export default CustomersLogos;
