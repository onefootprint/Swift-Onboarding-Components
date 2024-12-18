import { IcoCloseSmall16 } from '@onefootprint/icons';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

type WhatIsThisCardProps = {
  isVisible: boolean;
  onClose: () => void;
};

const WhatIsThisCard = ({ isVisible, onClose }: WhatIsThisCardProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.home.verify.cards.behavior-and-device-insights.illustration.app-clip.what-is-this',
  });

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEsc);

    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="absolute z-50 flex flex-col w-full gap-4 p-6 rounded-xl backdrop-blur-md"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.25)',
          }}
          initial={{ opacity: 0, y: -100, height: 0 }}
          animate={{ opacity: 1, y: 0, height: '100%' }}
          exit={{ opacity: 0, y: -100, height: 0 }}
          transition={{ duration: 0.1, ease: 'easeOut' }}
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute opacity-50 top-4 right-4 hover:opacity-100"
          >
            <IcoCloseSmall16 />
          </button>
          <p className="text-label-2">{t('title')}</p>
          <p className="text-body-2 text-secondary">{t('description')}</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WhatIsThisCard;
