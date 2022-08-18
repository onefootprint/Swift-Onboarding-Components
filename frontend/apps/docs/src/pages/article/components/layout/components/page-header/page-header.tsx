import { createPopup } from '@typeform/embed';
import { useTranslation } from 'hooks';
import Logo from 'icons/ico/logo-fpdocs-default';
import React from 'react';
import styled, { css } from 'styled-components';
import { Button, Container } from 'ui';

const { toggle: toggleTypeform } = createPopup('COZNk70C');

const PageHeader = () => {
  const { t } = useTranslation('components.header');

  return (
    <Header>
      <Container fluid>
        <Inner>
          <Logo />
          <Button onClick={toggleTypeform} size="small">
            {t('request-early-access')}
          </Button>
        </Inner>
      </Container>
    </Header>
  );
};

const Header = styled.header`
  ${({ theme }) => css`
    background: ${theme.backgroundColor.primary};
    border: ${theme.borderWidth[1]}px solid ${theme.borderColor.tertiary};
    left: 0;
    position: fixed;
    right: 0;
    top: 0;
    z-index: ${theme.zIndex.overlay};
  `}
`;

const Inner = styled.div`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: ${theme.spacing[4]}px 0;
  `};
`;

export default PageHeader;
