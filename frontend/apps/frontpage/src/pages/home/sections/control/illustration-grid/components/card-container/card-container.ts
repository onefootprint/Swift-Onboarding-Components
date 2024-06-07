import { Stack } from '@onefootprint/ui';
import { motion } from 'framer-motion';
import styled, { css } from 'styled-components';

const CardContainer = styled(motion(Stack))<{ size?: 'compact' | 'default' }>`
  ${({ theme, size = 'default' }) => css`
    flex-direction: column;
    width: 100%;
    border-radius: ${theme.borderRadius.default};
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    background-color: ${theme.backgroundColor.primary};
    gap: ${size === 'compact' ? theme.spacing[5] : theme.spacing[7]};
    padding: ${
      size === 'compact'
        ? `${theme.spacing[5]} ${theme.spacing[7]}`
        : `${theme.spacing[7]} ${theme.spacing[7]} ${theme.spacing[5]} ${theme.spacing[7]}`
    };
  `}
`;

export default CardContainer;
