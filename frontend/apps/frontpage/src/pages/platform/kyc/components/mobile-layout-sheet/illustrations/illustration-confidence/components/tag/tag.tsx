import type { Icon } from '@onefootprint/icons';
import { createFontStyles } from '@onefootprint/ui';
import { motion } from 'framer-motion';
import React from 'react';
import styled, { css } from 'styled-components';

type TagProps = {
  children: string;
  icon: Icon;
};

const Tag = ({ children, icon: Icon }: TagProps) => {
  const renderedIcon = <Icon />;
  return (
    <Container>
      {renderedIcon}
      {children}
    </Container>
  );
};

const Container = styled(motion.span)`
  ${({ theme }) => css`
    ${createFontStyles('body-4')}
    color: ${theme.color.primary};
    display: flex;
    align-items: center;
    padding: ${theme.spacing[2]} ${theme.spacing[4]} ${theme.spacing[2]}
      ${theme.spacing[3]};
    border-radius: ${theme.borderRadius.full};
    background-color: ${theme.backgroundColor.primary};
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    gap: ${theme.spacing[2]};
    width: fit-content;
  `}
`;

export default Tag;
