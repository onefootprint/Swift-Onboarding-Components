import { useTranslation } from '@onefootprint/hooks';
import { LogoFpDefault } from '@onefootprint/icons';
import Link from 'next/link';
import React from 'react';

type LogoLinkProps = {
  onClick?: () => void;
};

const LogoLink = ({ onClick }: LogoLinkProps) => {
  const { t } = useTranslation('components.navbar.logo');

  return (
    <Link href="/">
      <a href="/" aria-label={t('aria-label')} onClick={onClick}>
        <LogoFpDefault />
      </a>
    </Link>
  );
};

export default LogoLink;
