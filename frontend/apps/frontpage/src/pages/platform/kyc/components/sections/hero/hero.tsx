import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

import Ctas from 'src/components/ctas';
import Illustration from './components/illustration/illustration';

const Hero = () => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.kyc' });
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
      className="flex flex-col items-center justify-center gap-10"
    >
      <Illustration />
      <div className="flex flex-col items-center justify-center gap-3">
        <h1 className="text-center text-display-2">{t('title')}</h1>
        <h2 className="text-display-4 text-tertiary">{t('subtitle')}</h2>
        <div className="w-full pt-3">
          <Ctas />
        </div>
      </div>
    </motion.div>
  );
};

export default Hero;
