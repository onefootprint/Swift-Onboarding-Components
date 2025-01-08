import { Dialog } from '@onefootprint/ui';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';

export type HelpDialogProps = {
  open: boolean;
  onClose: () => void;
};

const HelpDialog = ({ open, onClose }: HelpDialogProps) => {
  const { t } = useTranslation('settings', { keyPrefix: 'pages.business-profile.support-links.dialog' });

  return (
    <Dialog title={t('title')} open={open} onClose={onClose} size="compact">
      <div className="flex flex-col gap-3">
        <p className="text-body-3">{t('body')}</p>
        <div className="w-full h-full max-w-[548px] max-h-[244px] overflow-hidden bg-secondary rounded border border-solid border-tertiary">
          <Image
            className="w-full h-full object-contain"
            alt={t('img-alt')}
            src="/settings/support-links.png"
            width={548}
            height={244}
          />
        </div>
      </div>
    </Dialog>
  );
};

export default HelpDialog;
