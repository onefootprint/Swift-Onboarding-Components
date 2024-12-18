import { Button } from '@onefootprint/ui';
import { cx } from 'class-variance-authority';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ButtonLink from 'src/components/button-link';
import MarketingLink from 'src/components/marketing-link';
import ContactDialog from '../contact-dialog';

type Labels = {
  primary?: string;
  secondary?: string;
};

type CtasProps = {
  labels?: Labels;
};

const Ctas = ({ labels }: CtasProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'components.ctas' });
  const [showDialog, setShowDialog] = useState(false);

  const handleBookCall = useCallback(() => {
    setShowDialog(true);
  }, []);

  return (
    <>
      <div
        className={cx(
          'flex flex-col justify-center items-center gap-3 px-3 w-full max-w-[580px] md:flex-row md:gap-3',
          // Button and MarketingLink should take up the full width on mobile, and half width on desktop and while we migrate them to tailwind we need to keep this
          '[&>button]:w-full [&>button]:md:w-auto [&>a]:w-full [&>a]:md:w-auto',
        )}
      >
        <Button variant="primary" size="large" onClick={handleBookCall}>
          {labels?.primary || t('book-a-call')}
        </Button>
        <MarketingLink app="dashboard" href="authentication/sign-up" target="_blank" asChild>
          <ButtonLink variant="secondary" size="large">
            {labels?.secondary || t('sign-up-for-free')}
          </ButtonLink>
        </MarketingLink>
      </div>
      <ContactDialog open={showDialog} onClose={() => setShowDialog(false)} />
    </>
  );
};

export default Ctas;
