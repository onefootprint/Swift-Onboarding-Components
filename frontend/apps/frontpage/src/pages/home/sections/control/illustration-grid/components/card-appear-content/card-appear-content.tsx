import { IcoCloseSmall16 } from '@onefootprint/icons';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const cardVariants = {
  initial: { height: 0, filter: 'blur(5px)' },
  visible: {
    height: 'auto',
    filter: 'blur(0)',
    transition: { duration: 0.1, ease: 'easeInOut' },
  },
  exit: {
    height: 0,
    filter: 'blur(5px)',
    transition: { duration: 0.1, ease: 'easeInOut' },
  },
};

type CardAppearContentProps = {
  isVisible: boolean;
  children: React.ReactNode;
  onClose?: () => void;
};

const CardAppearContent = ({ isVisible, children, onClose }: CardAppearContentProps) => {
  const [localVisible, setLocalVisible] = useState(isVisible);

  useEffect(() => {
    setLocalVisible(isVisible);
  }, [isVisible]);

  const handleClose = () => {
    setLocalVisible(false);
    if (onClose) onClose();
  };

  return (
    <AnimatePresence>
      {localVisible && (
        <div className="flex flex-col gap-5">
          <motion.div
            className="relative pt-3 border-t border-solid border-tertiary"
            initial="initial"
            animate="visible"
            exit="exit"
            variants={cardVariants}
          >
            {onClose && (
              <button type="button" className="absolute top-[-10px] right-[-10px] cursor-pointer" onClick={handleClose}>
                <IcoCloseSmall16 color="tertiary" />
              </button>
            )}
            <p className="text-body-3 text-secondary">{children}</p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CardAppearContent;
