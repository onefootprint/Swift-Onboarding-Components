import { Banner } from '@onefootprint/ui';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import ContactForm from 'src/components/contact-form';
import useOrgSession from 'src/hooks/use-org-session';

const SandboxBanner = () => {
  const { t } = useTranslation('common', { keyPrefix: 'components.sandbox-banner' });
  const { sandbox } = useOrgSession();

  return sandbox.isSandbox ? (
    <div className="w-full border-b border-tertiary">
      <Banner variant="warning" className="flex items-center justify-center gap-0.5">
        <div className="flex flex-row items-center justify-center">
          <span>{t('title')}</span>
          {sandbox.canToggle ? (
            <button type="button" onClick={sandbox.toggle} disabled={!sandbox.canToggle}>
              {t('toggle')}
            </button>
          ) : (
            <>
              <div className="flex flex-row gap-2 ml-2">
                <span>{t('to-activate')}</span>
                <Link href="mailto:eli@onefootprint.com">
                  <button type="button">{t('contact-us')}</button>
                </Link>
                <span className="text-warning">{t('or')}</span>
                <ContactForm>{t('form')}</ContactForm>
              </div>
              <span className="text-warning">.</span>
            </>
          )}
        </div>
      </Banner>
    </div>
  ) : null;
};

export default SandboxBanner;
