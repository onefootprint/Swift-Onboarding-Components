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
    <Link href="/" aria-label={t('aria-label')} onClick={onClick}>
      <LogoFpDefault />
    </Link>
  );
};

export default LogoLink;
