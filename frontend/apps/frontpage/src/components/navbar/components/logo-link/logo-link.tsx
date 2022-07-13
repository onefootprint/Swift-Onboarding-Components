import { useTranslation } from 'hooks';
import Link from 'next/link';
import React from 'react';
import { FootprintLogo } from 'ui';

type LogoLinkProps = {
  onClick?: () => void;
};

const LogoLink = ({ onClick }: LogoLinkProps) => {
  const { t } = useTranslation('components.navbar.logo');

  return (
    <Link href="/">
      <a href="/" aria-label={t('aria-label')} onClick={onClick}>
        <FootprintLogo alt={t('alt')} />
      </a>
    </Link>
  );
};

export default LogoLink;
