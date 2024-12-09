import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

import Illustration from './components/illustration';

const titleVariants = {
  hidden: { opacity: 0, filter: 'blur(10px)' },
  visible: {
    opacity: 1,
    filter: 'blur(0px)',
    transition: { delay: 0.8, duration: 0.5 },
  },
};

const Hero = () => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.customers.hero',
  });

  return (
    <motion.div className="flex flex-col gap-10 pt-10">
      <Illustration />
      <motion.div
        className="container flex flex-col items-center justify-center gap-4 mx-auto mt-6 text-center"
        initial="hidden"
        animate="visible"
        variants={titleVariants}
      >
        <h1 className="text-display-2 max-w-[600px]">{t('title')}</h1>
        <h4 className="text-display-4 text-secondary max-w-[600px]">{t('subtitle')}</h4>
      </motion.div>
    </motion.div>
  );
};

export default Hero;
