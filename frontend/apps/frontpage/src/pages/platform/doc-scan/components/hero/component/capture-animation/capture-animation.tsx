import { IcoCheckCircle40 } from '@onefootprint/icons';
import { AnimatePresence, motion } from 'framer-motion';
import { delay } from 'lodash';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

const CONFIRMATION_DELAY = 4000;

const Keyframes = () => (
  <style>{`
    @keyframes shadowAnimation {
      0% { box-shadow: 0 0 10px var(--purple-50); background-color: var(--purple-25); }
      50% { box-shadow: 0 0 40px var(--purple-200); background-color: var(--purple-25 / 0.5); }
      100% { box-shadow: 0 0 10px var(--purple-50); background-color: var(--purple-25); }
    }
    @keyframes successAnimation {
      0% { box-shadow: 0 0 10px var(--purple-50); background-color: var(--purple-25); }
      50% { box-shadow: 0 0 40px var(--green-200); background-color: var(--green-25 / 0.5); }
      100% { box-shadow: 0 0 10px var(--green-50); background-color: var(--green-25); }
    }
  `}</style>
);

const CaptureInformation = () => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.doc-scan.illustration' });
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    const timer = delay(() => setShowConfirmation(true), CONFIRMATION_DELAY);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className="relative md:h-[400px] h-[300px] w-full overflow-hidden flex items-center justify-center"
      style={{
        maskImage: 'linear-gradient(to bottom, transparent, black 25%, black 75%, transparent)',
        maskType: 'alpha',
      }}
    >
      <Keyframes />
      <AnimatePresence>
        <motion.div
          className="p-4 mt-10 rounded-lg outline-double outline-offset-8 outline-solid outline-gray-50 max-w-[90%] mx-auto md:h-[272px] h-[212px]"
          style={{
            animation: `${showConfirmation ? 'successAnimation 2s ease-out forwards' : 'shadowAnimation 4s ease-out infinite'}`,
          }}
        >
          <AnimatePresence>
            {showConfirmation ? (
              <motion.div
                initial={{ opacity: 0, y: '-20%' }}
                animate={{
                  opacity: 1,
                  y: '0',
                  transition: { duration: 0.5, delay: 2, ease: 'easeInOut' },
                }}
                exit={{ y: '20%', transition: { duration: 0.5, ease: 'easeInOut' } }}
                className="flex flex-col items-center justify-center gap-3 md:w-[380px] md:h-[240px] w-[280px] h-[180px] mx-auto"
                key="success"
              >
                <IcoCheckCircle40 color="success" />
                <h3 className="text-heading-3 text-success">{t('success')}</h3>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, x: '-100%' }}
                animate={{
                  opacity: 1,
                  x: '0',
                  transition: { duration: 1, ease: 'easeInOut' },
                }}
                exit={{ opacity: 0, x: '100%', transition: { duration: 1, ease: 'easeInOut' } }}
                className={`flex items-center justify-center max-w-[95%] bg-[url('/home/doc-scan/fake-id.png')] bg-contain bg-center bg-no-repeat md:w-[380px] md:h-[240px] w-[280px] h-[180px] mx-auto`}
                key="image"
              />
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default CaptureInformation;
