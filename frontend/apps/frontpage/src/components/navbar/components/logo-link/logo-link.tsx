import { useTranslation } from '@onefootprint/hooks';
import { LogoFpDefault } from '@onefootprint/icons';
import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import React from 'react';
import styled, { css } from 'styled-components';

type LogoLinkProps = {
  onClick?: () => void;
};

const LogoLink = ({ onClick }: LogoLinkProps) => {
  const { t } = useTranslation('components.navbar.logo');

  return (
    <NavigationMenu.Item>
      <StyledLink href="/" aria-label={t('aria-label')} onClick={onClick}>
        <LogoFpDefault />
      </StyledLink>
    </NavigationMenu.Item>
  );
};

const StyledLink = styled(NavigationMenu.Link)`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    margin-right: ${theme.spacing[4]};
  `}
`;

export default LogoLink;
