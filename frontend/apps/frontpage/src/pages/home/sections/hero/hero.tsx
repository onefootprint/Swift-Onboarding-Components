import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { useTranslation } from 'react-i18next';
import Ctas from 'src/components/ctas';
import FrontpageContainer from 'src/components/frontpage-container';
import CustomersLogos from './components/customers-logos';
const Screen = dynamic(() => import('./components/screen'));

const staggerVariants = {
  hidden: { opacity: 0, y: -5, filter: 'blur(10px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { staggerChildren: 0.1 } },
};

const textVariants = {
  hidden: { opacity: 0, y: -5, filter: 'blur(10px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.5 } },
};

const Hero = () => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.home' });

  return (
    <div className="relative">
      <div className="z-10 overflow-hidden">
        <FrontpageContainer className="relative flex flex-col items-center gap-24 py-10">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerVariants}
            className="flex flex-col items-center justify-center mx-4"
          >
            <motion.h1 variants={textVariants} className="text-center max-w-[580px] text-display-2 md:text-display-1">
              {t('hero.title')}
            </motion.h1>
            <motion.h2 variants={textVariants} className="text-center text-secondary max-w-[620px] text-display-4 mt-2">
              {t('hero.subtitle')}
            </motion.h2>
            <motion.div variants={textVariants} className="w-full mt-6">
              <Ctas />
            </motion.div>
          </motion.div>
          <Screen />
          <CustomersLogos />
        </FrontpageContainer>
      </div>
      <div className="absolute inset-0 z-[-1] bg-[url('/home/hero/background-texture.png')] bg-cover bg-center [clip-path:polygon(0_0,100%_0,100%_50%,0_50%)] opacity-50" />
    </div>
  );
};

export default Hero;
