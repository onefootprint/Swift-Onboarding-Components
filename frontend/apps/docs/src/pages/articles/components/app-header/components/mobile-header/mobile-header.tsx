import { FRONTPAGE_BASE_URL } from '@onefootprint/global-constants';
import { IcoClose24, IcoMenu24, ThemedLogoFpCompact } from '@onefootprint/icons';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

type MobileNavProps = {
  onClick: () => void;
  isExpanded: boolean;
};

const MobileNav = ({ onClick, isExpanded }: MobileNavProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'components.header' });
  return (
    <div className="flex items-center gap-5 px-3 py-4 flex-0">
      <button
        type="button"
        onClick={onClick}
        aria-label={isExpanded ? t('nav.nav-toggle.close') : t('nav.nav-toggle.open')}
        aria-expanded={isExpanded}
        className="w-6 h-6 border-none cursor-pointer bg-none"
      >
        {isExpanded ? <IcoClose24 /> : <IcoMenu24 />}
      </button>
      <div className="relative flex items-center justify-center h-full gap-3">
        <Link href={FRONTPAGE_BASE_URL} aria-label={t('nav.home')} className="flex items-center justify-center">
          <ThemedLogoFpCompact color="primary" />
        </Link>
        <div className="w-px h-5 bg-tertiary" />
        <Link href="/" className="no-underline text-body-3 text-tertiary">
          {t('nav.documentation')}
        </Link>
      </div>
    </div>
  );
};

export default MobileNav;
