import type { Icon } from '@onefootprint/icons';
import { AnimatePresence, motion } from 'framer-motion';
import type { ParseKeys } from 'i18next';
import { useTranslation } from 'react-i18next';

import { cx } from 'class-variance-authority';

type CustomToggleProps = {
  onChange?: (option: string) => void;
  activeSection: string;
  sections: { value: string; labelKey: string; icon: Icon }[];
  className?: string;
};

export const CustomToggle = ({ onChange, activeSection, sections, className }: CustomToggleProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.home.verify.cards.verify.illustration',
  });

  return (
    <div
      className={`flex p-1 rounded-full bg-primary relative isolate border border-solid border-tertiary ${className}`}
    >
      <AnimatePresence>
        {sections.map(section => {
          const isActive = activeSection === section.value;
          return (
            <button
              type="button"
              onClick={() => onChange?.(section.value)}
              key={section.value}
              className="relative z-10 flex items-center p-2 px-4 transition-colors duration-200 rounded-full cursor-pointer hover:bg-secondary group"
            >
              {isActive && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  layoutId="activeMarker"
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0 z-0 rounded-lg bg-tertiary"
                />
              )}
              <div className={cx('z-20 flex items-center gap-1 text-label-3', { 'text-quinary': isActive })}>
                <section.icon color={isActive ? 'quinary' : 'primary'} />
                <p>{t(section.labelKey as unknown as ParseKeys<'common'>)}</p>
              </div>
            </button>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default CustomToggle;
