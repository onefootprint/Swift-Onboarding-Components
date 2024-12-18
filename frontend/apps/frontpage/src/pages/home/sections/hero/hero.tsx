import { motion } from 'framer-motion';
import { uniqueId } from 'lodash';
import dynamic from 'next/dynamic';
import { useTranslation } from 'react-i18next';
import Ctas from 'src/components/ctas';
import FrontpageContainer from 'src/components/frontpage-container';
import CustomersLogos from './components/customers-logos';
const Screen = dynamic(() => import('./components/screen'));

const letterStagger = {
  hidden: { opacity: 0, filter: 'blur(10px)' },
  visible: {
    opacity: 1,
    filter: 'blur(0px)',
    transition: { duration: 0.1 },
  },
};

const buttonsAppear = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.4, delay: 1.2 },
  },
};

const Hero = () => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.home' });

  const renderTextWithLetterStagger = (text: string) => {
    return text.split('').map(char => (
      <motion.span variants={letterStagger} key={uniqueId()}>
        {char}
      </motion.span>
    ));
  };

  return (
    <div className="relative">
      <div className="z-10 overflow-hidden">
        <FrontpageContainer className="relative flex flex-col items-center gap-24 py-10">
          <div className="flex flex-col items-center justify-center">
            <motion.h1
              initial="hidden"
              animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.02 } } }}
              className="text-center max-w-[580px] text-display-2 md:text-display-1"
            >
              {renderTextWithLetterStagger(t('hero.title'))}
            </motion.h1>
            <motion.h2
              initial="hidden"
              animate="visible"
              variants={{ visible: { transition: { delayChildren: 0.5, staggerChildren: 0.01 } } }}
              className="text-center max-w-[520px] text-display-4 mt-2"
            >
              {renderTextWithLetterStagger(t('hero.subtitle'))}
            </motion.h2>
            <motion.div variants={buttonsAppear} initial="hidden" animate="visible" className="w-full mt-6">
              <Ctas />
            </motion.div>
          </div>
          <Screen />
          <CustomersLogos />
        </FrontpageContainer>
      </div>
      <div className="absolute inset-0 z-[-1] bg-[url('/home/hero/background-texture.png')] bg-cover bg-center [clip-path:polygon(0_0,100%_0,100%_50%,0_50%)] opacity-50" />
    </div>
  );
};

export default Hero;
