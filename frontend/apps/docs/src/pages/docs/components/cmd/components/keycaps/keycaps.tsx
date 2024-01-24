import styled, { css } from '@onefootprint/styled';
import { createFontStyles, media, Typography } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

const Keycaps = () => {
  const { t } = useTranslation('common', { keyPrefix: 'components.cmd' });
  return (
    <Container>
      <KeyCaps>
        <KeyCap>⌘</KeyCap>
        <KeyCap>K</KeyCap>
      </KeyCaps>
      <Typography variant="body-4" color="tertiary">
        {t('jump-to-section')}
      </Typography>
    </Container>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    display: none;
    align-items: center;
    gap: ${theme.spacing[4]};
    justify-content: flex-start;
    position: fixed;
    bottom: ${theme.spacing[4]};
    right: ${theme.spacing[4]};

    ${media.greaterThan('md')`
      display: flex;
    `}
  `};
`;

const KeyCap = styled.div`
  ${({ theme }) => css`
    width: 20px;
    height: 20px;
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    background: ${theme.backgroundColor.secondary};
    border-radius: ${theme.borderRadius.compact};
    ${createFontStyles('caption-4')}
    color: ${theme.color.tertiary};
    display: flex;
    justify-content: center;
    align-items: center;
    font-weight: 700;
  `};
`;

const KeyCaps = styled.div`
  ${({ theme }) => css`
    display: flex;
    gap: ${theme.spacing[2]};
  `};
`;

export default Keycaps;
