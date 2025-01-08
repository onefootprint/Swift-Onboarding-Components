import { LinkButton } from '@onefootprint/ui';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

type AddingCardProps = {
  value: string;
  onChange: (value: string) => void;
  handleSave: () => void;
  handleCancel: () => void;
};

export const AddingCard = ({ value, onChange, handleSave, handleCancel }: AddingCardProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'components.frequent-notes' });

  return (
    <motion.li
      className="box-border flex flex-col w-full border border-solid rounded border-tertiary group"
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.1 }}
    >
      <textarea
        className="w-full border-none text-body-2 rounded-b-none rounded-t p-3 resize-none focus-visible:outline-none focus-visible:border-accent focus-visible:border focus-visible:border-solid focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:shadow-[0px_0px_0px_4px_rgba(74,36,219,0.12)]"
        value={value}
        tabIndex={0}
        onChange={e => onChange(e.target.value)}
        aria-label={t('new-note')}
        // biome-ignore lint/a11y/noAutofocus: Autofocus is needed for UX when adding a new note
        autoFocus
      />
      <div className="flex flex-row items-center justify-between w-full gap-2 p-3 border-t border-dashed border-tertiary">
        <LinkButton onClick={handleSave}>{t('save')}</LinkButton>
        <LinkButton onClick={handleCancel}>{t('cancel')}</LinkButton>
      </div>
    </motion.li>
  );
};
