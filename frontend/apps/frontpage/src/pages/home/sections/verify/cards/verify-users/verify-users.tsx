import { IcoIdCard16, IcoUser16 } from '@onefootprint/icons';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import BaseCard from '../../components/base-card';
import CardTitle from '../../components/card-title';
import CustomToggle from './components/custom-toggle';

const sections = [
  { value: 'user-input-data', labelKey: 'user-input-data', icon: IcoUser16 },
  { value: 'ocr-data', labelKey: 'ocr-data', icon: IcoIdCard16 },
];

const VerifyUsers = () => {
  const [activeSection, setActiveSection] = useState('user-input-data');

  const handleToggleChange = (value: string) => {
    setActiveSection(value);
  };

  const { t } = useTranslation('common', {
    keyPrefix: 'pages.home.verify.cards.verify',
  });

  const imageSources = {
    'user-input-data': '/home/verify-cards/good-penguin.png',
    'ocr-data': '/home/verify-cards/bad-penguin.png',
  };

  const getSrc = () => imageSources[activeSection as keyof typeof imageSources];

  const inputData = () => {
    if (activeSection === 'user-input-data') {
      return {
        firstString: '2234',
        diff: 'Any',
        secondString: 'where Street, Albany, 12222',
      };
    }
    return {
      firstString: '2234',
      diff: 'Some',
      secondString: 'where Street, Albany, 12222',
    };
  };

  return (
    <BaseCard className="relative h-fit md:h-full">
      <div
        className="
          absolute inset-0 
          bg-cover bg-center bg-no-repeat 
          bg-[url('/home/verify-cards/paper.png')]
        "
        style={{
          WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 100%)',
          maskImage: 'linear-gradient(to bottom, transparent, black 100%)',
          maskType: 'alpha',
        }}
      />
      <CardTitle title={t('title')} subtitle={t('subtitle')} />
      <div className="flex flex-col items-center">
        <CustomToggle sections={sections} onChange={handleToggleChange} activeSection={activeSection} />
        <div
          className="
          relative flex justify-between items-center 
          w-full gap-5 p-7 
          md:max-w-[556px] flex-col-reverse md:flex-row
        "
        >
          <div className="flex flex-col w-full gap-5 md:w-auto">
            <div className="flex flex-col gap-1">
              <p className="text-caption-1 text-tertiary">Name</p>
              <div className="flex items-center gap-1">
                <p className="text-body-3 text-secondary">Percy Littlefeet</p>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-caption-1 text-tertiary">Address</p>
              <div className="flex items-center gap-1">
                <motion.p className="text-body-3 text-secondary">{inputData().firstString}</motion.p>
                <motion.span
                  initial={{ opacity: 0, filter: 'blur(5px)' }}
                  animate={{ opacity: 1, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, filter: 'blur(5px)' }}
                  transition={{ duration: 0.2 }}
                  key={activeSection}
                  className="p-1 -mr-1 rounded text-label-3 text-error bg-error"
                >
                  {inputData().diff}
                </motion.span>
                <p className="text-body-3 text-primary">{inputData().secondString}</p>
              </div>
            </div>
          </div>
          <span
            className="transition-transform duration-300 rotate-10"
            style={{ transform: activeSection === 'ocr-data' ? 'rotate(-5deg)' : 'rotate(10deg)' }}
          />
          <motion.div
            className="
              md:w-[120px] md:h-[120px] 
              w-[100px] h-[100px] 
              bg-cover bg-center bg-no-repeat 
              border-4 box-border border-solid border-[#fff] 
              rounded
            "
            style={{ backgroundImage: `url(${getSrc()})` }}
            initial={{ transform: 'rotate(0deg)' }}
            animate={{ transform: activeSection === 'ocr-data' ? 'rotate(-5deg)' : 'rotate(10deg)' }}
          />
        </div>
      </div>
    </BaseCard>
  );
};

export default VerifyUsers;
