import { useTranslation } from '@onefootprint/hooks';
import { LogoFpDefault } from '@onefootprint/icons';
import Link from 'next/link';
import React from 'react';
import styled from 'styled-components';

type LogoLinkProps = {
  onClick?: () => void;
};

const LogoLink = ({ onClick }: LogoLinkProps) => {
  const { t } = useTranslation('components.navbar.logo');

  return (
    <StyledLink href="/" aria-label={t('aria-label')} onClick={onClick}>
      <LogoFpDefault />
    </StyledLink>
  );
};

const StyledLink = styled(Link)`
  display: flex;
`;

export default LogoLink;
