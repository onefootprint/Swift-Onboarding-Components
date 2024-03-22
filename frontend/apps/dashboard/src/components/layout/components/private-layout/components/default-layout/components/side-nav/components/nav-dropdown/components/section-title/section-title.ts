import { Box, createFontStyles } from '@onefootprint/ui';
import styled, { css } from 'styled-components';

const SectionTitle = styled(Box)`
  ${({ theme }) => css`
    padding: ${theme.spacing[2]} ${theme.spacing[5]};
    ${createFontStyles('label-3')};
    color: ${theme.color.tertiary};
  `};
`;

export default SectionTitle;
