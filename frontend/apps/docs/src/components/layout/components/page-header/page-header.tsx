import { createPopup } from '@typeform/embed';
import { useTranslation } from 'hooks';
import LogoFpCompact from 'icons/ico/logo-fp-compact';
import React from 'react';
import styled, { css } from 'styled-components';
import { Button, Container, Typography } from 'ui';

const { toggle: toggleTypeform } = createPopup('COZNk70C');

const PageHeader = () => {
  const { t } = useTranslation('components.header');

  return (
    <Header>
      <Container fluid>
        <Inner>
          <Title>
            <LogoFpCompact />
            <Typography
              variant="label-2"
              color="tertiary"
              sx={{ marginLeft: 3 }}
            >
              {t('title')}
            </Typography>
          </Title>
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

const Title = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
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
