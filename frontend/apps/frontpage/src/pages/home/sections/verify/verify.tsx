import { useTranslation } from 'react-i18next';

import FrontpageContainer from 'src/components/frontpage-container';
import SectionTitle from 'src/components/section-title';
import Backtest from './cards/backtest';
import BuildRules from './cards/build-rules';
import DeviceInsights from './cards/device-insights';
import VerifyUsers from './cards/verify-users';

const Verify = () => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.home.verify',
  });

  return (
    <FrontpageContainer className="flex flex-col items-center justify-center gap-10 pt-40 pb-32 md:py-32">
      <SectionTitle title={t('title')} subtitle={t('subtitle')} />
      <div className="grid w-full grid-cols-1 gap-5 md:grid-cols-2 md:grid-rows-2">
        <BuildRules />
        <VerifyUsers />
        <DeviceInsights />
        <Backtest />
      </div>
    </FrontpageContainer>
  );
};

export default Verify;
